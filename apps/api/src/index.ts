import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import rawBody from 'fastify-raw-body';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { loadEnv } from './env.js';

type RawBodyRequest = {
  rawBody?: string | Buffer;
};

// Minimal view of a Stripe error for structured logging / branching. Stripe's
// error classes are runtime values, so we describe just the fields we read.
type StripeErrorShape = {
  type?: string;
  code?: string;
  message?: string;
};

const env = loadEnv();
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' });
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

const server = Fastify({
  logger: true,
  // Trust the proxy so rate limiting keys on the real client IP behind
  // Railway/Render/Fly load balancers rather than the proxy address.
  trustProxy: true,
});

// Security headers (nosniff, frameguard, HSTS, etc.). CSP is disabled because
// this is a JSON API (no HTML rendered); CORP is set to cross-origin so the
// CORS-allowed frontend fetches are never blocked.
await server.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// WEB_ORIGIN may be a single origin or a comma-separated allowlist, so the new
// custom domain and the old *.vercel.app URL both keep working through the DNS
// migration. The first entry is canonical and is used for Stripe redirect URLs.
const webOrigins = env.WEB_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];
const primaryOrigin = webOrigins[0] ?? 'http://localhost:5173';

// CORS: in production env.ts guarantees WEB_ORIGIN is set, so we never fall
// back to the permissive `true` outside local development.
await server.register(cors, {
  origin: webOrigins.length > 0 ? webOrigins : true,
});

// Per-IP rate limit for abuse prevention (brief §13). The Stripe webhook is
// exempted below via its route config because Stripe can legitimately burst
// events and is already authenticated by signature verification.
await server.register(rateLimit, {
  global: true,
  max: env.RATE_LIMIT_MAX,
  timeWindow: '1 minute',
});

await server.register(rawBody, {
  field: 'rawBody',
  global: false,
  encoding: false,
  runFirst: true,
});

// Sanitize errors so we never leak internal/stack detail to clients. 5xx are
// logged in full server-side and returned as a generic message; intentional
// 4xx (rate limit, validation) keep their own client-safe message.
server.setErrorHandler((error: FastifyError, request, reply) => {
  const statusCode = error.statusCode ?? 500;
  if (statusCode >= 500) {
    request.log.error({ err: error }, 'Unhandled server error');
    return reply.code(500).send({ error: 'Something went wrong. Please try again.' });
  }
  request.log.warn({ err: error, statusCode }, 'Client error');
  return reply.code(statusCode).send({ error: error.message });
});

// Generic 404 instead of Fastify's default, which echoes the probed route.
server.setNotFoundHandler((_request, reply) => {
  return reply.code(404).send({ error: 'Not found' });
});

server.get('/health', async () => ({ ok: true }));

async function getAuthenticatedUser(authorizationHeader?: string) {
  const token = authorizationHeader?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

async function upsertProfile(userId: string, email?: string | null) {
  await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email: email ?? null,
  });
}

async function getLatestSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

function isPaidStatus(status?: string | null) {
  return status === 'active' || status === 'trialing';
}

async function syncStripeSubscription(subscription: Stripe.Subscription, userId?: string | null) {
  const resolvedUserId = userId ?? subscription.metadata.user_id;
  const currentPeriodEnd = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  if (!resolvedUserId) {
    server.log.warn({ subscriptionId: subscription.id }, 'Missing user id for subscription sync');
    return;
  }

  await upsertProfile(resolvedUserId);

  const row = {
    user_id: resolvedUserId,
    stripe_customer_id:
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: selectError } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  if (selectError) {
    server.log.error({ error: selectError, subscriptionId: subscription.id }, 'Subscription lookup failed');
    return;
  }

  const { error } = existing?.id
    ? await supabaseAdmin.from('subscriptions').update(row).eq('id', existing.id)
    : await supabaseAdmin.from('subscriptions').insert(row);

  if (error) {
    server.log.error({ error, subscriptionId: subscription.id }, 'Subscription sync failed');
  }
}

server.get('/entitlements', async (request, reply) => {
  const user = await getAuthenticatedUser(request.headers.authorization);
  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  await upsertProfile(user.id, user.email);
  const subscription = await getLatestSubscription(user.id);
  const status = subscription?.status ?? 'free';

  return {
    plan: isPaidStatus(status) ? 'pro' : 'free',
    status,
    currentPeriodEnd: subscription?.current_period_end ?? null,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
  };
});

server.post(
  '/billing/create-checkout-session',
  {
    // Tighter cap: each call may create a Stripe customer, so we don't want it
    // hammered even within the global allowance.
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
  },
  async (request, reply) => {
  try {
    const user = await getAuthenticatedUser(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    await upsertProfile(user.id, user.email);
    const existingSubscription = await getLatestSubscription(user.id);
    let customerId = existingSubscription?.stripe_customer_id as string | undefined;

    // Self-heal: a stored customer created in a different Stripe mode (test vs
    // live) or since deleted will 404 here. Rather than fail checkout, drop it
    // so a fresh customer is created below. This makes a test→live switch (and
    // any stale row) transparent to new signups.
    if (customerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(customerId);
        if ((existingCustomer as Stripe.DeletedCustomer).deleted) {
          customerId = undefined;
        }
      } catch (error) {
        const stripeError = error as StripeErrorShape;
        if (stripeError.code === 'resource_missing') {
          request.log.warn(
            { userId: user.id, customerId },
            'Stored Stripe customer not found in current mode — creating a fresh one',
          );
          customerId = undefined;
        } else {
          throw error;
        }
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${primaryOrigin}/account?checkout=success`,
      cancel_url: `${primaryOrigin}/account?checkout=cancelled`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    return { url: session.url };
  } catch (error) {
    // Log the real cause server-side; return a generic message so we don't
    // leak Stripe/internal error detail to the client.
    request.log.error({ error }, 'Checkout session creation failed');
    return reply.code(400).send({ error: 'Unable to start checkout. Please try again.' });
  }
});

server.post('/billing/create-portal-session', async (request, reply) => {
  const user = await getAuthenticatedUser(request.headers.authorization);
  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const subscription = await getLatestSubscription(user.id);
  if (!subscription?.stripe_customer_id) {
    return reply.code(400).send({ error: 'No Stripe customer found for this account' });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${primaryOrigin}/account`,
    });

    return { url: portalSession.url };
  } catch (error) {
    // Surface the Stripe specifics in the log so the 400 is diagnosable in one
    // line (e.g. missing portal configuration for the current mode, or a
    // test/live customer mismatch). The client still gets a generic message.
    const stripeError = error as StripeErrorShape;
    request.log.error(
      {
        err: error,
        stripeType: stripeError.type,
        stripeCode: stripeError.code,
        stripeMessage: stripeError.message,
        customerId: subscription.stripe_customer_id,
      },
      'Portal session creation failed',
    );
    return reply.code(400).send({ error: 'Unable to open billing portal. Please try again.' });
  }
});

server.post(
  '/account/delete',
  {
    // Destructive + irreversible: keep a tight cap on top of the global limit.
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  },
  async (request, reply) => {
    const user = await getAuthenticatedUser(request.headers.authorization);
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Acts only on the authenticated user's own id (no body params) → no IDOR.
    const subscription = await getLatestSubscription(user.id);

    // 1) Cancel any live subscription first so a deleted account can never keep
    //    billing. Immediate cancellation forfeits remaining paid time
    //    (consistent with the no-partial-refund policy).
    if (
      subscription?.stripe_subscription_id &&
      ['active', 'trialing', 'past_due', 'unpaid'].includes(subscription.status)
    ) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      } catch (error) {
        const stripeError = error as StripeErrorShape;
        // Already-cancelled / missing is fine; any other failure aborts so we
        // never delete an account that might still be billable.
        if (stripeError.code !== 'resource_missing') {
          request.log.error(
            { err: error, userId: user.id },
            'Account deletion: subscription cancel failed',
          );
          return reply.code(500).send({ error: 'Could not delete account. Please try again.' });
        }
      }
    }

    // 2) Delete the Stripe customer to strip stored PII / payment methods.
    //    Non-fatal: Stripe still retains invoices/payment records for tax/legal
    //    compliance (lawful retention under GDPR Art 17(3)(b)).
    if (subscription?.stripe_customer_id) {
      try {
        await stripe.customers.del(subscription.stripe_customer_id);
      } catch (error) {
        request.log.warn(
          { err: error, userId: user.id },
          'Account deletion: Stripe customer delete failed (non-fatal)',
        );
      }
    }

    // 3) Delete the Supabase auth user. FK cascades remove profiles +
    //    subscriptions and null usage_events (see supabase/schema.sql). A
    //    late webhook arriving after this point FK-fails harmlessly.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      request.log.error(
        { err: deleteError, userId: user.id },
        'Account deletion: auth user delete failed',
      );
      return reply.code(500).send({ error: 'Could not delete account. Please try again.' });
    }

    return { deleted: true };
  },
);

server.post(
  '/webhooks/stripe',
  {
    config: {
      rawBody: true,
      rateLimit: false,
    },
  },
  async (request, reply) => {
    const signature = request.headers['stripe-signature'];
    if (!signature || Array.isArray(signature)) {
      return reply.code(400).send({ error: 'Missing Stripe signature header' });
    }

    const rawBody = (request as typeof request & RawBodyRequest).rawBody;
    if (!rawBody) {
      return reply.code(400).send({ error: 'Missing raw body' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
      // Log the real verification failure server-side; return a generic message
      // so probes don't learn internal signature-validation detail.
      request.log.warn({ err: error }, 'Stripe webhook signature verification failed');
      return reply.code(400).send({ error: 'Invalid signature' });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncStripeSubscription(subscription, userId);
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      await syncStripeSubscription(subscription);
    }

    return reply.code(200).send({ received: true });
  },
);

await server.listen({ port: env.PORT, host: '0.0.0.0' });

