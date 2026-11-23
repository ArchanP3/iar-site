-- Two country sites (automiqautomation.ca and .com) share this CMS.
--   site:           which site shows a landing page / blog post: both (default), CA only or US only.
--   ca_title etc.:  optional Canada-only SEO for any page; empty = the normal SEO fields on .ca too.
-- Additive only: existing rows get 'both' / NULL, so nothing changes until someone edits them.

alter table cms.cms_landing add column if not exists site text not null default 'both';
alter table cms.cms_posts   add column if not exists site text not null default 'both';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cms_landing_site_check') then
    alter table cms.cms_landing add constraint cms_landing_site_check check (site in ('both', 'CA', 'US'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'cms_posts_site_check') then
    alter table cms.cms_posts add constraint cms_posts_site_check check (site in ('both', 'CA', 'US'));
  end if;
end $$;

alter table cms.cms_page_seo
  add column if not exists ca_title       text,
  add column if not exists ca_description text,
  add column if not exists ca_schema_json text;
