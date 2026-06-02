-- Phase 2 schema (Supabase Postgres)
-- Apply via Supabase SQL editor.

-- Profiles tied to Supabase Auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

-- Stripe customer + subscription state
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'free',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

-- Usage events (no image bytes; counts only)
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;

-- Policies: users can read/update their own profile
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

-- Policies: users can read their own subscription row(s)
create policy "subscriptions_select_own"
on public.subscriptions for select
using (auth.uid() = user_id);

-- Users can insert usage events for themselves (optional; server can also insert)
create policy "usage_insert_own"
on public.usage_events for insert
with check (auth.uid() = user_id);

create policy "usage_select_own"
on public.usage_events for select
using (auth.uid() = user_id);
