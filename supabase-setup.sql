-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Index for fast lookups and unique enforcement
create unique index if not exists waitlist_email_idx on waitlist (lower(email));
