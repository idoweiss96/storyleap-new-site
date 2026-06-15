-- ============================================================
-- Migration 001: Coupons & coupon redemptions
-- Run in Supabase SQL Editor
-- ============================================================

create table if not exists public.coupons (
  code              text primary key,              -- e.g. 'MATANA30'
  type              text not null,                 -- 'discount' | 'free_credits' | 'hosted_button'
  -- For type='discount': overrides price shown + sent to PayPal
  price_ils         numeric,                       -- discounted price in ILS (null = no override)
  price_usd         numeric,                       -- discounted price in USD (null = no override)
  -- For type='free_credits': credits gifted without payment
  credits_amount    integer,
  -- For type='hosted_button': PayPal hosted button
  hosted_button_id  text,
  hosted_currency   text,
  hosted_display    text,
  -- Usage limits
  max_uses          integer,                       -- null = unlimited
  max_uses_per_user integer default 1,             -- null = unlimited per user
  -- Lifecycle
  active            boolean not null default true,
  expires_at        timestamptz,
  created_at        timestamptz not null default now()
);

create table if not exists public.coupon_redemptions (
  id          uuid primary key default gen_random_uuid(),
  coupon_code text not null references public.coupons(code),
  user_email  text not null,
  redeemed_at timestamptz not null default now()
);

create index if not exists coupon_redemptions_code_idx  on public.coupon_redemptions(coupon_code);
create index if not exists coupon_redemptions_email_idx on public.coupon_redemptions(user_email);

-- RLS
alter table public.coupons              enable row level security;
alter table public.coupon_redemptions   enable row level security;

-- Admins can read and manage coupons; service role bypasses RLS for validation
create policy "coupons_admin_all" on public.coupons
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Users can read active coupons (needed for admin panel reads by admin users)
-- Actually only service role + admin needed; anonymous should NOT see coupon codes
-- The policy above covers admins; server uses service_role which bypasses RLS

-- Admins can read redemptions
create policy "coupon_redemptions_admin_select" on public.coupon_redemptions
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ── Seed initial coupons ──────────────────────────────────────

insert into public.coupons (code, type, price_ils, price_usd, max_uses, max_uses_per_user)
values
  ('MATANA30', 'discount',      15, 5, null, null),
  ('MIL30',    'discount',      15, 5, null, null),
  ('NYUD30',   'discount',      15, 5, null, null),
  ('SHNK30',   'discount',      15, 5, null, null),
  ('MIAMI30',  'discount',      15, 5, null, null)
on conflict (code) do nothing;

insert into public.coupons (code, type, credits_amount, max_uses_per_user)
values
  ('STORY20',  'free_credits',  20, 1)
on conflict (code) do nothing;

insert into public.coupons (code, type, hosted_button_id, hosted_currency, hosted_display, max_uses_per_user)
values
  ('IDO10',    'hosted_button', 'AMAMAC5GTGJUG', 'ILS', '₪0.10', null)
on conflict (code) do nothing;
