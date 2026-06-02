-- Adds cancellation tracking so the app can show "cancels on <date>, Pro until then"
-- instead of "renews on <date>". Apply once in the Supabase SQL editor.
alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;
