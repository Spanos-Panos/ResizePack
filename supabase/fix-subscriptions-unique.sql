-- Run once in Supabase → SQL Editor if webhook upserts failed with:
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification"
--
-- Safe to re-run: only adds the constraint when missing.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_stripe_subscription_id_key'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_stripe_subscription_id_key unique (stripe_subscription_id);
  end if;
end $$;
