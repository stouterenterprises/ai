create table if not exists businesses (
  id char(36) primary key,
  name varchar(255) not null,
  slug varchar(255) unique not null,
  allow_department_picker tinyint(1) default 1,
  default_department_id char(36) null,
  created_at timestamp default current_timestamp
);

create table if not exists departments (
  id char(36) primary key,
  business_id char(36) not null,
  name varchar(255) not null,
  description text,
  enabled_channels json,
  routing_keywords json,
  default_queue varchar(255),
  hours json,
  branding json,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade
);

create table if not exists memberships (
  id char(36) primary key,
  business_id char(36) not null,
  user_id char(36) not null,
  role enum('platform_owner', 'business_owner', 'agent', 'customer') not null,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade
);

create table if not exists ai_bots (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  name varchar(255) not null,
  system_prompt text not null,
  tone varchar(255) not null,
  escalation_threshold decimal(3,2) default 0.60,
  allowed_sources json,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists kb_articles (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  title varchar(255) not null,
  summary text,
  url text,
  status varchar(50) default 'draft',
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists kb_chunks (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  article_id char(36),
  title varchar(255) not null,
  url text,
  content longtext not null,
  embedding json,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null,
  foreign key (article_id) references kb_articles(id) on delete cascade
);

create table if not exists conversations (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  customer_id char(36),
  subject varchar(255),
  status varchar(50) default 'open',
  channel varchar(50) default 'chat',
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists messages (
  id char(36) primary key,
  conversation_id char(36) not null,
  sender_id char(36),
  sender_role varchar(50) not null,
  content longtext not null,
  metadata json,
  created_at timestamp default current_timestamp,
  foreign key (conversation_id) references conversations(id) on delete cascade
);

create table if not exists tickets (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  conversation_id char(36),
  subject varchar(255) not null,
  status varchar(50) default 'open',
  priority varchar(50) default 'medium',
  assignee_id char(36),
  tags json,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null,
  foreign key (conversation_id) references conversations(id) on delete set null
);

create table if not exists ticket_comments (
  id char(36) primary key,
  ticket_id char(36) not null,
  author_id char(36),
  body longtext not null,
  visibility varchar(50) default 'public',
  created_at timestamp default current_timestamp,
  foreign key (ticket_id) references tickets(id) on delete cascade
);

create table if not exists integrations (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  name varchar(255) not null,
  provider varchar(255) not null,
  status varchar(50) default 'inactive',
  config json,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists feature_flags (
  id char(36) primary key,
  business_id char(36) not null,
  `key` varchar(255) not null,
  enabled tinyint(1) default 0,
  created_at timestamp default current_timestamp,
  unique key uniq_business_flag (business_id, `key`),
  foreign key (business_id) references businesses(id) on delete cascade
);

create table if not exists webhook_subscriptions (
  id char(36) primary key,
  business_id char(36) not null,
  department_id char(36),
  url text not null,
  event_types json not null,
  secret varchar(255) not null,
  active tinyint(1) default 1,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);

create table if not exists jobs (
  id bigint unsigned primary key auto_increment,
  business_id char(36) not null,
  type varchar(255) not null,
  payload json not null,
  status varchar(50) default 'queued',
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade
);

create table if not exists event_log (
  id bigint unsigned primary key auto_increment,
  business_id char(36) not null,
  department_id char(36),
  event_type varchar(255) not null,
  payload json not null,
  created_at timestamp default current_timestamp,
  foreign key (business_id) references businesses(id) on delete cascade,
  foreign key (department_id) references departments(id) on delete set null
);
