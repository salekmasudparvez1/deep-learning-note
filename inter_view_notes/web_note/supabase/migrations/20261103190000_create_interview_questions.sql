create table if not exists public.interview_questions (
  id text primary key,
  question text not null,
  answer text not null default '',
  category text not null default '',
  topic text not null default '',
  difficulty text not null default 'Medium'
    check (difficulty in ('Easy', 'Medium', 'Hard')),
  status text not null default 'not-started'
    check (status in ('not-started', 'reviewing', 'learned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_questions_category_idx
  on public.interview_questions (category);

create index if not exists interview_questions_status_idx
  on public.interview_questions (status);

create index if not exists interview_questions_difficulty_idx
  on public.interview_questions (difficulty);

alter table public.interview_questions enable row level security;

notify pgrst, 'reload schema';
