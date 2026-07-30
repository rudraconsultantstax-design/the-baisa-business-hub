-- ============================================================
--  DEPLOYED: Supabase project "oms-integrator" (mhlyicynbznlvbinvqna)
--  Migration name: tcc_voice_agent_schema   (applied 2026-07-30)
--
--  Same tables as schema.sql but namespaced into a dedicated
--  "voice" schema — public.usage_events already exists in the
--  shared suite DB, so the voice agent gets its own schema.
--  RLS is enabled with NO anon policies: access is server-side
--  only via the service-role key (bypasses RLS) or direct
--  Postgres. When wiring the middleware to Supabase, query
--  voice.* tables (e.g. supabase.schema('voice').from('call_logs')).
-- ============================================================

create schema if not exists voice;

create table if not exists voice.clients (
  id                text primary key,
  name              text not null,
  contact           text,
  phone             text,
  tier              text not null default 'reception',
  status            text not null default 'active',
  monthly_override  integer,
  overage_override  numeric,
  setup_billed_month text,
  internal          boolean not null default false,
  created_at        timestamptz not null default now()
);

create table if not exists voice.usage_events (
  id            bigserial primary key,
  client_id     text references voice.clients(id),
  execution_id  text unique,
  agent_key     text,
  direction     text,
  seconds       integer not null default 0,
  cost_estimate numeric,
  month         text not null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_voice_usage_client_month on voice.usage_events(client_id, month);

create table if not exists voice.call_logs (
  execution_id  text primary key,
  client_id     text,
  agent_key     text,
  direction     text,
  customer      text,
  seconds       integer,
  recording_url text,
  transcript    text,
  extracted     jsonb,
  outcome       text,
  created_at    timestamptz not null default now()
);

create table if not exists voice.consent_log (
  id         bigserial primary key,
  number     text not null,
  purpose    text,
  source     text,
  ref        text,
  created_at timestamptz not null default now()
);
create index if not exists idx_voice_consent_number on voice.consent_log(number);

create table if not exists voice.suppression (
  number     text primary key,
  reason     text,
  since      timestamptz not null default now(),
  until      timestamptz
);

create or replace view voice.v_client_month_usage as
select client_id,
       month,
       count(*)                       as calls,
       coalesce(sum(seconds),0)       as seconds,
       round(coalesce(sum(seconds),0)/60.0, 2) as minutes
from voice.usage_events
group by client_id, month;

alter table voice.clients      enable row level security;
alter table voice.usage_events enable row level security;
alter table voice.call_logs    enable row level security;
alter table voice.consent_log  enable row level security;
alter table voice.suppression  enable row level security;
