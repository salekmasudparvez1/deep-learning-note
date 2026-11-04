create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists refresh_tokens_user_idx on public.refresh_tokens(user_id);
create index if not exists refresh_tokens_expiry_idx on public.refresh_tokens(expires_at);

alter table public.interview_questions add column if not exists user_id uuid references public.users(id) on delete cascade;
alter table public.routine_records add column if not exists user_id uuid references public.users(id) on delete cascade;
alter table public.users add column if not exists role text not null default 'user';
alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check check (role in ('admin', 'user'));
create index if not exists interview_questions_user_idx on public.interview_questions(user_id);
create index if not exists routine_records_user_idx on public.routine_records(user_id);

alter table public.users enable row level security;
alter table public.refresh_tokens enable row level security;
alter table public.interview_questions enable row level security;
alter table public.routine_records enable row level security;

notify pgrst, 'reload schema';
