-- Baisa OS — Supabase schema
-- Generic, multi-tenant JSONB store mirroring the app's data layer.
-- Prefixed (baisa_os_*) so it can coexist with the sibling OMS schema in the
-- shared project (mhlyicynbznlvbinvqna) without collision.

create table if not exists baisa_os_orgs (
  id          text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists baisa_os_records (
  id          text not null,
  org_id      text not null,
  collection  text not null,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (org_id, id)
);
create index if not exists baisa_os_records_org_coll_idx on baisa_os_records (org_id, collection);

create table if not exists baisa_os_sessions (
  token       text primary key,
  user_id     text not null,
  org_id      text not null,
  created_at  timestamptz not null default now()
);
create index if not exists baisa_os_sessions_org_idx on baisa_os_sessions (org_id);

-- RLS on; writes happen only via the server-side service-role key (which
-- bypasses RLS). Anon gets read-only on business records, matching the suite
-- convention. Sessions are never exposed to anon.
alter table baisa_os_orgs    enable row level security;
alter table baisa_os_records enable row level security;
alter table baisa_os_sessions enable row level security;

drop policy if exists baisa_os_records_anon_read on baisa_os_records;
create policy baisa_os_records_anon_read on baisa_os_records for select to anon using (true);

drop policy if exists baisa_os_orgs_anon_read on baisa_os_orgs;
create policy baisa_os_orgs_anon_read on baisa_os_orgs for select to anon using (true);
