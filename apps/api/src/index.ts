import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import rawBody from 'fastify-raw-body';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { loadEnv } from './env';

type RawBodyRequest = {
  rawBody?: string | Buffer;
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

// CORS: in production env.ts guarantees WEB_ORIGIN is set, so we never fall
// back to the permissive `true` outside local development.
await server.register(cors, {
  origin: env.WEB_ORIGIN ?? true,
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
      success_url: `${env.WEB_ORIGIN ?? 'http://localhost:5173'}/account?checkout=success`,
      cancel_url: `${env.WEB_ORIGIN ?? 'http://localhost:5173'}/account?checkout=cancelled`,
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
    const message = error instanceof Error ? error.message : 'Unable to create checkout session';
    request.log.error({ error }, 'Checkout session creation failed');
    return reply.code(400).send({ error: message });
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

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${env.WEB_ORIGIN ?? 'http://localhost:5173'}/account`,
  });

  return { url: portalSession.url };
});

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
      const message = error instanceof Error ? error.message : 'Invalid webhook signature';
      return reply.code(400).send({ error: message });
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

