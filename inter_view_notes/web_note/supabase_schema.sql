create table if not exists public.routine_groups (
  id text primary key,
  title text not null,
  subtitle text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_topics (
  id text primary key,
  group_id text not null references public.routine_groups(id) on delete cascade,
  title text not null,
  hint text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_records (
  id bigint generated always as identity primary key,
  task_id text not null references public.routine_topics(id) on delete cascade,
  completed boolean not null,
  timestamp timestamptz not null default now()
);

alter table public.routine_groups enable row level security;
alter table public.routine_topics enable row level security;
alter table public.routine_records enable row level security;

insert into public.routine_groups (id, title, subtitle, sort_order) values
('core-preparation', 'Core preparation', 'Build fundamentals before moving to harder questions.', 1),
('applied-ai-engineering', 'Applied AI engineering', 'Connect concepts to implementation and production systems.', 2)
on conflict (id) do nothing;

insert into public.routine_topics (id, group_id, title, hint, sort_order) values
('t1', 'core-preparation', 'DSA / coding practice', '1–2 problems; explain time and space complexity.', 1),
('t2', 'core-preparation', 'Machine learning fundamentals', 'Review one concept and answer it out loud.', 2),
('t3', 'core-preparation', 'Math, probability, and statistics', 'Practice a small calculation or reasoning question.', 3),
('t4', 'applied-ai-engineering', 'ML coding / PyTorch / NumPy', 'Implement or debug one small component.', 1),
('t5', 'applied-ai-engineering', 'LLMs, RAG, or AI system design', 'Draw one architecture and explain trade-offs.', 2),
('t6', 'applied-ai-engineering', 'Review and record mistakes', 'Write down what went wrong and revisit it.', 3)
on conflict (id) do nothing;
