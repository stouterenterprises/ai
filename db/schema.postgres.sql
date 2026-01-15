create table if not exists businesses (
  id uuid primary key,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  allow_department_picker boolean default true,
  default_department_id uuid null,
  created_at timestamp default now()
);

create table if not exists departments (
  id uuid primary key,
  business_id uuid not null,
  name varchar(255) not null,
  description text,
  enabled_channels jsonb,
  routing_keywords jsonb,
  default_queue varchar(255),
  hours jsonb,
  branding jsonb,
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade
);

create table if not exists memberships (
  id uuid primary key,
  business_id uuid not null,
  user_id uuid not null,
  role text not null check (role in ('platform_owner', 'business_owner', 'agent', 'customer')),
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade
);

create table if not exists ai_bots (
  id uuid primary key,
  business_id uuid not null,
  department_id uuid,
  name varchar(255) not null,
  system_prompt text not null,
  tone varchar(255) not null,
  escalation_threshold numeric(3, 2) default 0.60,
  allowed_sources jsonb,
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists kb_articles (
  id uuid primary key,
  business_id uuid not null,
  department_id uuid,
  title varchar(255) not null,
  summary text,
  url text,
  status varchar(50) default 'draft',
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists kb_chunks (
  id uuid primary key,
  business_id uuid not null,
  department_id uuid,
  article_id uuid,
  title varchar(255) not null,
  url text,
  content text not null,
  embedding jsonb,
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null,
  foreign key (article_id) references kb_articles(id) on delete cascade
);

create table if not exists conversations (
  id uuid primary key,
  business_id uuid not null,
  department_id uuid,
  customer_id uuid,
  subject varchar(255),
  status varchar(50) default 'open',
  channel varchar(50) default 'chat',
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists messages (
  id uuid primary key,
  conversation_id uuid not null,
  sender_id uuid,
  sender_role varchar(50) not null,
  content text not null,
  metadata jsonb,
  created_at timestamp default now(),
  foreign key (conversation_id) references conversations(id) on delete cascade
);

create table if not exists tickets (
  id uuid primary key,
  business_id uuid not null,
  department_id uuid,
  conversation_id uuid,
  subject varchar(255) not null,
  status varchar(50) default 'open',
  priority varchar(50) default 'medium',
  assignee_id uuid,
  tags jsonb,
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null,
  foreign key (conversation_id) references conversations(id) on delete set null
);

create table if not exists ticket_comments (
  id uuid primary key,
  ticket_id uuid not null,
  author_id uuid,
  body text not null,
  visibility varchar(50) default 'public',
  created_at timestamp default now(),
  foreign key (ticket_id) references tickets(id) on delete cascade
);

create table if not exists integrations (
  id uuid primary key,
  business_id uuid not null,
  department_id uuid,
  name varchar(255) not null,
  provider varchar(255) not null,
  status varchar(50) default 'inactive',
  config jsonb,
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists feature_flags (
  id uuid primary key,
  business_id uuid not null,
  "key" varchar(255) not null,
  enabled boolean default false,
  created_at timestamp default now(),
  unique (business_id, "key"),
  foreign key (business_id) references businesses(id) on delete cascade
);

create table if not exists webhook_subscriptions (
  id uuid primary key,
  business_id uuid not null,
  department_id uuid,
  url text not null,
  event_types jsonb not null,
  secret varchar(255) not null,
  active boolean default true,
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists jobs (
  id bigint generated by default as identity primary key,
  business_id uuid not null,
  type varchar(255) not null,
  payload jsonb not null,
  status varchar(50) default 'queued',
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade
);

create table if not exists event_log (
  id bigint generated by default as identity primary key,
  business_id uuid not null,
  department_id uuid,
  event_type varchar(255) not null,
  payload jsonb not null,
  created_at timestamp default now(),
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);
