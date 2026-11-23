-- Postgres fallback search (used when Typesense is not configured).
-- Matches full-text on part number / manufacturer / title, plus a trigram
-- substring match on part_number so partial part numbers like "7PF01" hit.

create or replace function public.search_products(q text, lim int default 24, off int default 0)
returns table (
  id bigint,
  slug text,
  part_number text,
  title text,
  manufacturer text,
  manufacturer_slug text,
  image_url text,
  price numeric,
  currency text,
  price_display text,
  total bigint
)
language sql
stable
set search_path = public, extensions
as $$
  with query as (
    select
      websearch_to_tsquery('simple', q) as ts,
      '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pattern
  ),
  hits as (
    select
      p.*,
      ts_rank(p.search, query.ts) + case when p.part_number ilike query.pattern then 1 else 0 end as rank
    from public.products p, query
    where char_length(trim(q)) >= 2
      and (p.search @@ query.ts or p.part_number ilike query.pattern)
  )
  select
    id, slug, part_number, title, manufacturer, manufacturer_slug, image_url,
    price, currency, price_display,
    count(*) over () as total
  from hits
  order by rank desc, part_number
  limit least(greatest(lim, 1), 100)
  offset greatest(off, 0)
$$;

grant execute on function public.search_products(text, int, int) to anon, authenticated;
