-- ============================================================
--  TCC Voice Agent — production schema (Postgres / Supabase)
--  The JSON-file store is fine to start; move to this when you
--  have several clients or want dashboards/BI on the data.
-- ============================================================

create table if not exists clients (
  id                text primary key,          -- e.g. 'smile-dental'
  name              text not null,
  contact           text,
  phone             text,
  tier              text not null default 'reception',   -- reception | growth | scale
  status            text not null default 'active',      -- active | paused
  monthly_override  integer,                   -- optional custom base fee (INR)
  overage_override  numeric,                   -- optional custom overage rate (INR/min)
  setup_billed_month text,                     -- 'YYYY-MM' the one-time setup is billed
  internal          boolean not null default false,
  created_at        timestamptz not null default now()
);

create table if not exists usage_events (
  id            bigserial primary key,
  client_id     text references clients(id),
  execution_id  text unique,                   -- Bolna execution id (idempotency key)
  agent_key     text,
  direction     text,                          -- inbound | outbound
  seconds       integer not null default 0,
  cost_estimate numeric,                        -- Bolna total_cost, if sent
  month         text not null,                 -- 'YYYY-MM'
  created_at    timestamptz not null default now()
);
create index if not exists idx_usage_client_month on usage_events(client_id, month);

create table if not exists call_logs (
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

create table if not exists consent_log (
  id         bigserial primary key,
  number     text not null,
  purpose    text,
  source     text,
  ref        text,
  created_at timestamptz not null default now()
);
create index if not exists idx_consent_number on consent_log(number);

create table if not exists suppression (
  number     text primary key,                -- opt-out / DND
  reason     text,
  since      timestamptz not null default now(),
  until      timestamptz                       -- 90-day cool-off
);

-- Monthly billing rollup (join with your tier pricing in the app layer).
create or replace view v_client_month_usage as
select client_id,
       month,
       count(*)                       as calls,
       coalesce(sum(seconds),0)       as seconds,
       round(coalesce(sum(seconds),0)/60.0, 2) as minutes
from usage_events
group by client_id, month;
