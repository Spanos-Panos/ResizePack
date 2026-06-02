import { z } from 'zod';
import { config } from 'dotenv';

// Locally we read secrets from the repo-root .env.local. In production the
// host (Railway/Render/Fly/etc.) injects real environment variables, so we
// skip the file to avoid masking host config.
if (process.env.NODE_ENV !== 'production') {
  config({ path: '../../.env.local' });
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(8787),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRICE_ID: z.string().min(1),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    // Allowed browser origin for CORS + Stripe redirect URLs.
    WEB_ORIGIN: z.string().url().optional(),
    // Per-IP request cap per minute (abuse prevention, brief §13).
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  })
  .refine((value) => value.NODE_ENV !== 'production' || Boolean(value.WEB_ORIGIN), {
    message: 'WEB_ORIGIN is required in production so CORS is not left open to all origins.',
    path: ['WEB_ORIGIN'],
  });

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.path.join('.') + ': ' + issue.message);
    throw new Error(`Invalid API environment variables:\n${message.join('\n')}`);
  }
  return parsed.data;
}

