create extension if not exists "uuid-ossp";
create extension if not exists "vector";

create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  allow_department_picker boolean default true,
  default_department_id uuid,
  created_at timestamp with time zone default now()
);

create table if not exists departments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  name text not null,
  description text,
  enabled_channels text[] default array['chat'],
  routing_keywords text[] default array[]::text[],
  default_queue text,
  hours jsonb,
  branding jsonb,
  created_at timestamp with time zone default now()
);

alter table businesses
  add constraint businesses_default_department_fk
  foreign key (default_department_id)
  references departments(id)
  deferrable initially deferred;

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

create type membership_role as enum ('platform_owner', 'business_owner', 'agent', 'customer');

create table if not exists memberships (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role membership_role not null,
  created_at timestamp with time zone default now()
);

create table if not exists ai_bots (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  department_id uuid references departments(id) on delete cascade,
  name text not null,
  system_prompt text not null,
  tone text not null,
  escalation_threshold numeric default 0.6,
  allowed_sources text[] default array['global', 'department'],
  created_at timestamp with time zone default now()
);

create table if not exists kb_articles (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  department_id uuid references departments(id) on delete set null,
  title text not null,
  summary text,
  url text,
  status text default 'draft',
  created_at timestamp with time zone default now()
);

create table if not exists kb_chunks (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  department_id uuid references departments(id) on delete set null,
  article_id uuid references kb_articles(id) on delete cascade,
  title text not null,
  url text,
  content text not null,
  embedding vector(1536),
  created_at timestamp with time zone default now()
);

create table if not exists conversations (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  department_id uuid references departments(id) on delete set null,
  customer_id uuid references auth.users on delete set null,
  subject text,
  status text default 'open',
  channel text default 'chat',
  created_at timestamp with time zone default now()
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references auth.users on delete set null,
  sender_role text not null,
  content text not null,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists tickets (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  department_id uuid references departments(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  subject text not null,
  status text default 'open',
  priority text default 'medium',
  assignee_id uuid references auth.users on delete set null,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default now()
);

create table if not exists ticket_comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references tickets(id) on delete cascade not null,
  author_id uuid references auth.users on delete set null,
  body text not null,
  visibility text default 'public',
  created_at timestamp with time zone default now()
);

create table if not exists integrations (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  department_id uuid references departments(id) on delete set null,
  name text not null,
  provider text not null,
  status text default 'inactive',
  config jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists feature_flags (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  key text not null,
  enabled boolean default false,
  created_at timestamp with time zone default now(),
  unique (business_id, key)
);

create table if not exists webhook_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  department_id uuid references departments(id) on delete set null,
  url text not null,
  event_types text[] not null,
  secret text not null,
  active boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  type text not null,
  payload jsonb not null,
  status text default 'queued',
  created_at timestamp with time zone default now()
);

create table if not exists event_log (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  department_id uuid references departments(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamp with time zone default now()
);

create or replace function has_business_access(business_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from memberships
    where memberships.business_id = $1
    and memberships.user_id = auth.uid()
  );
$$;

alter table businesses enable row level security;
alter table departments enable row level security;
alter table memberships enable row level security;
alter table ai_bots enable row level security;
alter table kb_articles enable row level security;
alter table kb_chunks enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table tickets enable row level security;
alter table ticket_comments enable row level security;
alter table integrations enable row level security;
alter table feature_flags enable row level security;
alter table webhook_subscriptions enable row level security;
alter table jobs enable row level security;
alter table event_log enable row level security;

create policy "business_select" on businesses
  for select using (has_business_access(id));
create policy "business_insert" on businesses
  for insert with check (auth.uid() is not null);

create policy "department_select" on departments
  for select using (has_business_access(business_id));
create policy "department_modify" on departments
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "membership_select" on memberships
  for select using (has_business_access(business_id));
create policy "membership_modify" on memberships
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "bot_select" on ai_bots
  for select using (has_business_access(business_id));
create policy "bot_modify" on ai_bots
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "kb_select" on kb_articles
  for select using (has_business_access(business_id));
create policy "kb_modify" on kb_articles
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "kb_chunk_select" on kb_chunks
  for select using (has_business_access(business_id));
create policy "kb_chunk_modify" on kb_chunks
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "conversation_select" on conversations
  for select using (has_business_access(business_id));
create policy "conversation_modify" on conversations
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "message_select" on messages
  for select using (exists (
    select 1 from conversations c
    where c.id = messages.conversation_id
    and has_business_access(c.business_id)
  ));
create policy "message_modify" on messages
  for all using (exists (
    select 1 from conversations c
    where c.id = messages.conversation_id
    and has_business_access(c.business_id)
  )) with check (exists (
    select 1 from conversations c
    where c.id = messages.conversation_id
    and has_business_access(c.business_id)
  ));

create policy "ticket_select" on tickets
  for select using (has_business_access(business_id));
create policy "ticket_modify" on tickets
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "ticket_comment_select" on ticket_comments
  for select using (exists (
    select 1 from tickets t
    where t.id = ticket_comments.ticket_id
    and has_business_access(t.business_id)
  ));
create policy "ticket_comment_modify" on ticket_comments
  for all using (exists (
    select 1 from tickets t
    where t.id = ticket_comments.ticket_id
    and has_business_access(t.business_id)
  )) with check (exists (
    select 1 from tickets t
    where t.id = ticket_comments.ticket_id
    and has_business_access(t.business_id)
  ));

create policy "integration_select" on integrations
  for select using (has_business_access(business_id));
create policy "integration_modify" on integrations
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "feature_flags_select" on feature_flags
  for select using (has_business_access(business_id));
create policy "feature_flags_modify" on feature_flags
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "webhook_select" on webhook_subscriptions
  for select using (has_business_access(business_id));
create policy "webhook_modify" on webhook_subscriptions
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "jobs_select" on jobs
  for select using (has_business_access(business_id));
create policy "jobs_modify" on jobs
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create policy "event_log_select" on event_log
  for select using (has_business_access(business_id));
create policy "event_log_modify" on event_log
  for all using (has_business_access(business_id)) with check (has_business_access(business_id));

create or replace function match_kb_chunks(
  query_embedding vector(1536),
  match_count int,
  filter_business_id uuid default null
)
returns table (
  id uuid,
  title text,
  url text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select kb_chunks.id,
    kb_chunks.title,
    kb_chunks.url,
    kb_chunks.content,
    1 - (kb_chunks.embedding <=> query_embedding) as similarity
  from kb_chunks
  where (filter_business_id is null or kb_chunks.business_id = filter_business_id)
  order by kb_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
