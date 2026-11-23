-- 20261120120000_cms_products_editor.sql  (v2: reviewed 2026-11-20)
-- Parts Catalog editor in the CMS (/admin/parts).
-- Changes from Barun's v1:
--   * one transaction, so the public read policy is never missing for a moment
--   * brand/category counts only count published products (hidden/draft parts
--     no longer inflate counts or keep an empty brand page indexable)
--   * no DELETE grant yet: hiding covers PRs 1-3; delete is granted with PR 4
--
-- Safe for the live site: every existing product stays 'published', and anon
-- keeps reading products through the Data API exactly as today.

begin;

-- 1. Let the CMS login (cms_app) manage products --------------------------------
grant usage on schema public to cms_app;
grant select, insert, update on public.products to cms_app;
grant usage, select on sequence public.products_id_seq to cms_app;

create policy "cms_app manages products" on public.products
  for all to cms_app using (true) with check (true);

-- 2. Product status: published / draft / hidden ---------------------------------
alter table public.products
  add column status text not null default 'published'
  check (status in ('published', 'draft', 'hidden'));

create index idx_products_status_not_published on public.products (status)
  where status <> 'published';

-- The public site only sees published products. search_products() is security
-- invoker, so this policy also filters shop search for anon.
drop policy "public read products" on public.products;
create policy "public read products" on public.products
  for select to anon, authenticated using (status = 'published');

-- 3. Brand / category counts: published products only ---------------------------
drop materialized view public.category_facets;
create materialized view public.category_facets as
  select category_slug as slug, min(category) as name, count(*)::integer as product_count
  from public.products
  where category_slug is not null and status = 'published'
  group by category_slug;
create unique index category_facets_slug_idx on public.category_facets (slug);

drop materialized view public.manufacturer_facets;
create materialized view public.manufacturer_facets as
  select manufacturer_slug as slug, min(manufacturer) as name, count(*)::integer as product_count
  from public.products
  where manufacturer_slug <> '' and status = 'published'
  group by manufacturer_slug;
create unique index manufacturer_facets_slug_idx on public.manufacturer_facets (slug);

grant select on public.category_facets, public.manufacturer_facets to anon, authenticated, service_role, cms_app;
grant execute on function public.refresh_catalog_facets() to cms_app;

-- 4. Fields edited in the CMS are locked against imports -------------------------
-- The CMS adds a field name to cms_locked when someone edits it (and removes it on
-- "Unlock"). Enforced by the database, so every import path respects it (CSV script,
-- catalog script, one-off SQL): any update not made by cms_app keeps the locked
-- fields' old values and cannot change cms_locked. Tested on Postgres 17.
alter table public.products
  add column cms_locked text[] not null default '{}'
  check (cms_locked <@ array[
    'price', 'price_display', 'currency', 'condition', 'availability', 'stock_qty', 'warranty',
    'category', 'manufacturer', 'brand', 'sku', 'title', 'description', 'ebay_item_id',
    'image_url', 'images', 'image_source',
    'tab_specifications', 'tab_common_faults', 'tab_repair_process', 'tab_faq'
  ]::text[]);

create function public.products_keep_cms_locked() returns trigger
  language plpgsql set search_path = '' as $$
begin
  if current_user <> 'cms_app' and cardinality(old.cms_locked) > 0 then
    new := jsonb_populate_record(new, (select jsonb_object_agg(k, to_jsonb(old) -> k) from unnest(old.cms_locked) k));
    new.cms_locked := old.cms_locked;
  end if;
  return new;
end $$;

create trigger trg_products_cms_locked before update on public.products
  for each row execute function public.products_keep_cms_locked();

commit;

-- Check after running (expected: every row 'published', counts unchanged):
--   select status, count(*) from public.products group by status;
--   select count(*), sum(product_count) from public.manufacturer_facets;
