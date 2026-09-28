-- Migration: verification_tokens
-- Run this against your existing database (it only adds a new table,
-- doesn't touch anything else, so no need to drop/recreate anything).
-- Usage: psql $DATABASE_URL -f packages/db/migration_auth_tokens.sql

create table if not exists verification_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  token text unique not null,
  type text not null check (type in ('email_verify', 'password_reset')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_verification_tokens_token on verification_tokens(token);
create index if not exists idx_verification_tokens_user on verification_tokens(user_id);
