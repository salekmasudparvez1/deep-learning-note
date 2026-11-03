create table
  if not exists public.routine_groups (
    id text primary key,
    title text not null,
    subtitle text not null default '',
    sort_order integer not null default 0,
    created_at timestamptz not null default now ()
  );

create table
  if not exists public.routine_topics (
    id text primary key,
    group_id text not null references public.routine_groups (id) on delete cascade,
    title text not null,
    hint text not null default '',
    sort_order integer not null default 0,
    created_at timestamptz not null default now ()
  );

create table
  if not exists public.routine_records (
    id bigint generated always as identity primary key,
    task_id text not null references public.routine_topics (id) on delete cascade,
    completed boolean not null,
    timestamp timestamptz not null default now ()
  );

alter table public.routine_groups enable row level security;

alter table public.routine_topics enable row level security;

alter table public.routine_records enable row level security;

insert into
  public.routine_groups (id, title, subtitle, sort_order)
values
  (
    'core-preparation',
    'Core preparation',
    'Build fundamentals before moving to harder questions.',
    1
  ),
  (
    'applied-ai-engineering',
    'Applied AI engineering',
    'Connect concepts to implementation and production systems.',
    2
  ) on conflict (id) do nothing;

insert into
  public.routine_topics (id, group_id, title, hint, sort_order)
values
  (
    't1',
    'core-preparation',
    'DSA / coding practice',
    '1–2 problems; explain time and space complexity.',
    1
  ),
  (
    't2',
    'core-preparation',
    'Machine learning fundamentals',
    'Review one concept and answer it out loud.',
    2
  ),
  (
    't3',
    'core-preparation',
    'Math, probability, and statistics',
    'Practice a small calculation or reasoning question.',
    3
  ),
  (
    't4',
    'applied-ai-engineering',
    'ML coding / PyTorch / NumPy',
    'Implement or debug one small component.',
    1
  ),
  (
    't5',
    'applied-ai-engineering',
    'LLMs, RAG, or AI system design',
    'Draw one architecture and explain trade-offs.',
    2
  ),
  (
    't6',
    'applied-ai-engineering',
    'Review and record mistakes',
    'Write down what went wrong and revisit it.',
    3
  ) on conflict (id) do nothing;

-- InterviewVault questions table
create table
  if not exists public.interview_questions (
    id text primary key,
    question text not null,
    answer text not null default '',
    category text not null default '',
    topic text not null default '',
    difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
    status text not null default 'not-started' check (status in ('not-started', 'reviewing', 'learned')),
    created_at timestamptz not null default now (),
    updated_at timestamptz not null default now ()
  );

create index if not exists interview_questions_category_idx on public.interview_questions (category);

create index if not exists interview_questions_status_idx on public.interview_questions (status);

create index if not exists interview_questions_difficulty_idx on public.interview_questions (difficulty);

alter table public.interview_questions enable row level security;

-- Seed (safe to run repeatedly)
insert into
  public.interview_questions (
    id,
    question,
    answer,
    category,
    topic,
    difficulty,
    status
  )
values
  (
    'seed-1',
    'What is the difference between supervised and unsupervised learning?',
    'Supervised learning trains on labeled data to learn a mapping from inputs to known targets. Examples include classification and regression. Unsupervised learning works with unlabeled data to discover structure, such as clusters or lower-dimensional representations.',
    'Machine Learning',
    'Fundamentals',
    'Easy',
    'learned'
  ),
  (
    'seed-2',
    'Explain the bias-variance trade-off.',
    'Bias is error from overly simple assumptions; variance is sensitivity to fluctuations in the training data. High bias can underfit, while high variance can overfit. The goal is to balance both and minimize generalization error, using validation, regularization, and suitable model complexity.',
    'Machine Learning',
    'Model evaluation',
    'Medium',
    'reviewing'
  ),
  (
    'seed-3',
    'What is backpropagation and why is it used?',
    'Backpropagation applies the chain rule to calculate the gradient of a loss with respect to each trainable parameter. An optimizer uses these gradients to update weights and reduce the loss.',
    'Deep Learning',
    'Neural networks',
    'Medium',
    'not-started'
  ),
  (
    'seed-4',
    'What is the difference between a list and a tuple in Python?',
    'A list is mutable, so its elements can be changed after creation. A tuple is immutable. Lists are useful for collections that change; tuples are useful for fixed records and can be hashable when all their elements are hashable.',
    'Python',
    'Core language',
    'Easy',
    'learned'
  ),
  (
    'seed-5',
    'How does self-attention work in a Transformer?',
    'Self-attention projects token representations into queries, keys, and values. Similarity scores between queries and keys are scaled and normalized with softmax; the resulting weights combine the value vectors. This lets each token incorporate context from other tokens.',
    'NLP',
    'Language models',
    'Hard',
    'not-started'
  ),
  (
    'seed-6',
    'What is the purpose of a model registry?',
    'A model registry stores and versions trained model artifacts along with metadata, evaluation metrics, lineage, and lifecycle stage. It supports reproducibility, review, promotion, rollback, and controlled deployment.',
    'MLOps',
    'Deployment',
    'Medium',
    'reviewing'
  ) on conflict (id) do nothing;