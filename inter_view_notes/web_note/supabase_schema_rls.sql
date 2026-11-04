-- RLS Policies Update for Admin Access
-- Run this to enable admin management of users and routine content

-- Enable RLS on all tables if not already enabled
alter table public.users enable row level security;
alter table public.refresh_tokens enable row level security;
alter table public.routine_records enable row level security;
alter table public.interview_questions enable row level security;
alter table public.routine_groups enable row level security;
alter table public.routine_topics enable row level security;

-- Drop existing policies
drop policy if exists "Users can view own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can update users" on public.users;
drop policy if exists "Admins can delete users" on public.users;

drop policy if exists "Users can view routine groups" on public.routine_groups;
drop policy if exists "Admins can manage routine groups" on public.routine_groups;

drop policy if exists "Users can view routine topics" on public.routine_topics;
drop policy if exists "Admins can manage routine topics" on public.routine_topics;

drop policy if exists "Users can manage own tokens" on public.refresh_tokens;
drop policy if exists "Users can manage own records" on public.routine_records;
drop policy if exists "Users can view all questions" on public.interview_questions;
drop policy if exists "Users can manage questions" on public.interview_questions;

-- Create new RLS Policies for Users
create policy "Users can view own profile" on public.users
  for select using (auth.uid()::text = id);

create policy "Admins can view all users" on public.users
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid()::text and role = 'admin'
    )
  );

create policy "Admins can update users" on public.users
  for update using (
    exists (
      select 1 from public.users
      where id = auth.uid()::text and role = 'admin'
    )
  );

create policy "Admins can delete users" on public.users
  for delete using (
    exists (
      select 1 from public.users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- RLS Policies for Routine Groups
create policy "Users can view routine groups" on public.routine_groups
  for select using (true);

create policy "Admins can manage routine groups" on public.routine_groups
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid()::text and role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- RLS Policies for Routine Topics
create policy "Users can view routine topics" on public.routine_topics
  for select using (true);

create policy "Admins can manage routine topics" on public.routine_topics
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid()::text and role = 'admin'
    )
  ) with check (
    exists (
      select 1 from public.users
      where id = auth.uid()::text and role = 'admin'
    )
  );

-- RLS Policies for Refresh Tokens
create policy "Users can manage own tokens" on public.refresh_tokens
  for all using (user_id = auth.uid()::text);

-- RLS Policies for Routine Records
create policy "Users can manage own records" on public.routine_records
  for all using (true);

-- RLS Policies for Interview Questions
create policy "Users can view all questions" on public.interview_questions
  for select using (true);

create policy "Users can manage questions" on public.interview_questions
  for all using (true);

-- Notify to reload schema
notify pgrst, 'reload schema';
