-- CMS at /admin: its own private schema and a least-privilege login.
--
-- * Schema `cms` is not exposed through the Data API and anon/authenticated
--   get no access, so the publishable key can never reach it.
-- * The website connects as `cms_app` (DATABASE_URL on Vercel). It can use the
--   cms tables, read website requests for the Leads screen, and nothing else.
--   The role is created without a password: set one in the SQL editor
--   (alter role cms_app with password '...') and put it in DATABASE_URL.
-- * Row level security is on for every table as a second lock; the only
--   policies are for cms_app.

create schema if not exists cms;
revoke all on schema cms from public, anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'cms_app') then
    create role cms_app login noinherit;
  end if;
end $$;
alter role cms_app set search_path = cms;
alter role cms_app set statement_timeout = '30s';
grant usage on schema cms to cms_app;

-- USERS & SIGN-IN ------------------------------------------------------------
create table cms.cms_users (
  id                   serial primary key,
  email                text not null unique,
  name                 text not null,
  role                 text not null default 'viewer' check (role in ('owner', 'seo', 'writer', 'viewer')),
  password_hash        text not null,
  totp_secret          text,
  totp_on              boolean not null default false,
  totp_last_step       bigint,
  disabled             boolean not null default false,
  failed_logins        int not null default 0,
  locked_until         timestamptz,
  must_change_password boolean not null default false,
  last_active          timestamptz,
  created_at           timestamptz not null default now()
);

create table cms.cms_sessions (
  id          text primary key,
  user_id     int not null references cms.cms_users (id) on delete cascade,
  pending_2fa boolean not null default false,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index cms_sessions_user_idx on cms.cms_sessions (user_id);

-- Attempts per key (sign-in by IP, 2FA by user, setup, 404 log by IP) in fixed windows.
create table cms.cms_rate (
  key          text not null,
  window_start timestamptz not null,
  hits         int not null default 1,
  primary key (key, window_start)
);

-- PAGES, REDIRECTS, SETTINGS ------------------------------------------------
create table cms.cms_page_seo (
  path           text primary key,
  title          text,
  description    text,
  canonical      text,
  noindex        boolean not null default false,
  nofollow       boolean not null default false,
  og_title       text,
  og_description text,
  og_image       text,
  focus_keyword  text,
  schema_json    text,
  head_html      text,
  body_html      text,
  public_path    text,
  updated_at     timestamptz not null default now(),
  updated_by     text
);

create table cms.cms_redirects (
  id         serial primary key,
  from_path  text not null unique,
  to_path    text not null default '',
  code       int not null default 301 check (code in (301, 302, 307, 308, 410)),
  match      text not null default 'exact' check (match in ('exact', 'prefix')),
  source     text not null default 'manual',
  note       text,
  active     boolean not null default true,
  expires_at timestamptz,
  hits       int not null default 0,
  last_hit   timestamptz,
  created_at timestamptz not null default now(),
  created_by text
);

create table cms.cms_404 (
  path       text primary key,
  hits       int not null default 1,
  referrer   text,
  ignored    boolean not null default false,
  first_seen timestamptz not null default now(),
  last_seen  timestamptz not null default now()
);
create index cms_404_last_idx on cms.cms_404 (last_seen desc);

create table cms.cms_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

-- CONTENT --------------------------------------------------------------------
-- Uploaded images live here (resized WebP, served from /media with a 1-year cache).
create table cms.cms_media (
  id             serial primary key,
  filename       text not null unique,
  mime           text not null,
  data           bytea not null,
  width          int,
  height         int,
  bytes          int not null,
  original_name  text,
  original_bytes int,
  alt            text not null default '',
  caption        text not null default '',
  folder         text not null default 'General',
  aliases        text[] not null default '{}',
  created_at     timestamptz not null default now(),
  created_by     text
);

create table cms.cms_posts (
  id              serial primary key,
  slug            text not null unique,
  title           text not null,
  excerpt         text not null default '',
  body            text not null default '',
  cover           text,
  cover_alt       text,
  category        text not null default '',
  tags            text[] not null default '{}',
  author_name     text not null default '',
  author_role     text not null default '',
  author_bio      text not null default '',
  status          text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published')),
  publish_at      timestamptz,
  seo_title       text,
  seo_description text,
  faq             jsonb not null default '[]',
  related         jsonb not null default '[]',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      text
);
create index cms_posts_live_idx on cms.cms_posts (status, publish_at);

create table cms.cms_landing (
  id              serial primary key,
  path            text not null unique,
  name            text not null,
  kind            text not null default 'page' check (kind in ('page', 'template')),
  blocks          jsonb not null default '[]',
  vars            jsonb not null default '{}',
  template_id     int,
  status          text not null default 'draft',
  seo_title       text,
  seo_description text,
  in_sitemap      text not null default 'pages',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      text
);

-- LEADS: the requests themselves stay in public.quote_requests (one list).
-- The CMS keeps only its own status and notes per request.
create table cms.lead_notes (
  request_id bigint primary key references public.quote_requests (id) on delete cascade,
  status     text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'spam')),
  notes      text not null default '',
  updated_at timestamptz not null default now(),
  updated_by text
);

-- ACTIVITY & SITE SCAN -------------------------------------------------------
create table cms.cms_activity (
  id         serial primary key,
  user_name  text not null,
  action     text not null,
  target     text not null default '',
  kind       text not null,
  ref        text not null default '',
  before     jsonb,
  after      jsonb,
  undone     boolean not null default false,
  created_at timestamptz not null default now()
);
create index cms_activity_created_idx on cms.cms_activity (created_at desc);

create table cms.cms_crawl (
  path         text primary key,
  status       int not null,
  title        text not null default '',
  description  text not null default '',
  canonical    text not null default '',
  robots       text not null default '',
  headings     jsonb not null default '[]',
  images       int not null default 0,
  images_noalt int not null default 0,
  image_list   jsonb not null default '[]',
  words        int not null default 0,
  links        jsonb not null default '[]',
  inbound      int not null default 0,
  ld_types     text[] not null default '{}',
  bytes        int not null default 0,
  ms           int not null default 0,
  crawled_at   timestamptz not null default now()
);

create table cms.cms_audit_runs (
  id          serial primary key,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  pages       int not null default 0,
  score       int,
  summary     jsonb not null default '{}'
);

-- ACCESS ---------------------------------------------------------------------
grant select, insert, update, delete on all tables in schema cms to cms_app;
grant usage, select on all sequences in schema cms to cms_app;

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'cms' loop
    execute format('alter table cms.%I enable row level security', t);
    execute format('create policy "cms_app only" on cms.%I for all to cms_app using (true) with check (true)', t);
  end loop;
end $$;

-- Leads screen: read website requests (no insert/update/delete).
grant usage on schema public to cms_app;
grant select on public.quote_requests to cms_app;
create policy "cms reads requests" on public.quote_requests for select to cms_app using (true);

-- RATE LIMIT FOR WEBSITE REQUESTS ------------------------------------------
-- The request forms insert with the publishable key, so the limit runs in the
-- database: at most `max_hits` requests per key (hashed IP) per 10 minutes.
create or replace function public.request_allowed(key text, max_hits int default 10)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  w timestamptz := date_bin('10 minutes', now(), timestamptz '2000-01-01');
  n int;
begin
  if key is null or length(key) > 128 then return false; end if;
  insert into cms.cms_rate (key, window_start) values ('req:' || key, w)
    on conflict on constraint cms_rate_pkey do update set hits = cms.cms_rate.hits + 1
    returning hits into n;
  delete from cms.cms_rate where window_start < now() - interval '1 day' and random() < 0.01;
  return n <= least(greatest(max_hits, 1), 20);
end $$;
revoke all on function public.request_allowed(text, int) from public;
grant execute on function public.request_allowed(text, int) to anon, authenticated;

comment on schema cms is 'CMS at /admin. Private: reached only by the cms_app login, never by the Data API.';
