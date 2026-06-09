-- ============================================================
-- StoryLeap — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Tables ───────────────────────────────────────────────────

create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  role        text not null default 'user',  -- 'user' | 'admin'
  credits     integer not null default 3,
  created_at  timestamptz not null default now()
);

create table if not exists public.stories (
  id              uuid primary key default gen_random_uuid(),
  created_by      text,                        -- user email
  child_name      text,
  child_age       integer,
  gender          text,
  setting         text,
  challenge_type  text,
  trigger_desc    text,
  reaction_type   text,
  hobbies         text,
  child_image     text,
  contact_email   text,
  contact_phone   text,
  payment_status  text not null default 'pending_payment',
  content         text,
  story_link      text,
  created_at      timestamptz not null default now()
);

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  story_id          uuid references public.stories(id),
  user_email        text,
  paypal_order_id   text,
  paypal_capture_id text,
  status            text not null default 'pending_payment',
  amount            numeric,
  currency          text default 'ILS',
  error_message     text,
  created_at        timestamptz not null default now()
);

create table if not exists public.credit_packages (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  credits     integer,
  price       numeric,
  currency    text default 'ILS',
  active      boolean default true,
  created_at  timestamptz not null default now()
);

-- ── Auto-create user profile on signup ───────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role, credits)
  values (new.id, new.email, 'user', 3)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────────

alter table public.users   enable row level security;
alter table public.stories enable row level security;
alter table public.orders  enable row level security;
alter table public.credit_packages enable row level security;

-- users: can read/update own row
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- stories: users can CRUD their own stories
create policy "stories_select_own" on public.stories
  for select using (created_by = auth.jwt()->>'email');
create policy "stories_insert_own" on public.stories
  for insert with check (created_by = auth.jwt()->>'email');
create policy "stories_update_own" on public.stories
  for update using (created_by = auth.jwt()->>'email');
create policy "stories_delete_own" on public.stories
  for delete using (created_by = auth.jwt()->>'email');

-- orders: users can see their own orders
create policy "orders_select_own" on public.orders
  for select using (user_email = auth.jwt()->>'email');

-- credit_packages: anyone can read
create policy "credit_packages_select" on public.credit_packages
  for select using (true);

-- ── Storage bucket ────────────────────────────────────────────
-- Create a bucket named "story-images" in Supabase Dashboard → Storage,
-- then set it to public (or add policies below).

-- insert into storage.buckets (id, name, public) values ('story-images', 'story-images', true)
-- on conflict do nothing;
