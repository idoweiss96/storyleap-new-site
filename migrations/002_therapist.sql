-- ============================================================
-- Migration 002: Therapist onboarding
-- Run in Supabase SQL Editor
-- ============================================================

-- ── Therapist profiles ────────────────────────────────────────
create table if not exists public.therapist_profiles (
  user_email        text primary key references public.users(email) on delete cascade,
  full_name         text not null,
  license_number    text,
  specialization    text,
  clinic_name       text,
  phone             text,
  status            text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  reject_reason     text,
  created_at        timestamptz not null default now()
);

-- ── Therapist ↔ clients ───────────────────────────────────────
create table if not exists public.therapist_clients (
  id              uuid primary key default gen_random_uuid(),
  therapist_email text not null references public.users(email) on delete cascade,
  parent_email    text not null,
  child_name      text not null,
  child_age       integer,
  gender          text,
  notes           text,
  created_at      timestamptz not null default now()
);

create index if not exists therapist_clients_therapist_idx on public.therapist_clients(therapist_email);

-- ── Therapist messages to parents ────────────────────────────
create table if not exists public.therapist_messages (
  id              uuid primary key default gen_random_uuid(),
  therapist_email text not null references public.users(email) on delete cascade,
  parent_email    text not null,
  child_name      text not null,
  subject         text not null,
  message         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists therapist_messages_therapist_idx on public.therapist_messages(therapist_email);
create index if not exists therapist_messages_parent_idx   on public.therapist_messages(parent_email);

-- ── Invite tokens ─────────────────────────────────────────────
create table if not exists public.invite_tokens (
  token           text primary key default gen_random_uuid()::text,
  role            text not null default 'therapist',
  created_by      text,
  expires_at      timestamptz not null default (now() + interval '30 days'),
  used_at         timestamptz,
  used_by_email   text,
  created_at      timestamptz not null default now()
);

-- ── RLS ───────────────────────────────────────────────────────
alter table public.therapist_profiles enable row level security;
alter table public.therapist_clients   enable row level security;
alter table public.therapist_messages  enable row level security;
alter table public.invite_tokens       enable row level security;

-- Therapist can read/update own profile
create policy "therapist_profile_own" on public.therapist_profiles
  for all using (user_email = auth.jwt()->>'email');

-- Admin can read all profiles
create policy "therapist_profile_admin" on public.therapist_profiles
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Therapist can manage own clients
create policy "therapist_clients_own" on public.therapist_clients
  for all using (therapist_email = auth.jwt()->>'email');

-- Admin can read all clients
create policy "therapist_clients_admin" on public.therapist_clients
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Therapist can manage own messages
create policy "therapist_messages_own" on public.therapist_messages
  for all using (therapist_email = auth.jwt()->>'email');

-- Parent can read messages sent to them
create policy "therapist_messages_parent" on public.therapist_messages
  for select using (parent_email = auth.jwt()->>'email');

-- Admin can manage invite tokens
create policy "invite_tokens_admin" on public.invite_tokens
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Add 'therapist' to users role (no DB change needed, just allow in app logic)
