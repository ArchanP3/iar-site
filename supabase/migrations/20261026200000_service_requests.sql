-- quote_requests now stores every website request: parts quotes, offers,
-- repairs and pickups. Core contact fields stay as columns; form-specific
-- fields (fault description, pickup address, box sizes, …) go in `details`.

alter table public.quote_requests
  add column request_type text not null default 'quote'
    check (request_type in ('quote', 'offer', 'repair', 'pickup')),
  add column subject      text check (char_length(subject) <= 200),
  add column manufacturer text check (char_length(manufacturer) <= 200),
  add column details      jsonb not null default '{}'::jsonb
    check (jsonb_typeof(details) = 'object' and pg_column_size(details) < 16384);

alter table public.quote_requests
  add constraint quote_requests_part_number_len check (char_length(part_number) <= 500);

create index idx_quotes_type on public.quote_requests (request_type, created_at desc);

comment on table public.quote_requests is
  'Website requests (quote / offer / repair / pickup). Insert-only for anon; read via dashboard or service role.';
