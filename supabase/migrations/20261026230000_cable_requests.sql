-- Custom cable requests (/request-cable) are saved alongside the other
-- website requests.

alter table public.quote_requests
  drop constraint quote_requests_request_type_check,
  add constraint quote_requests_request_type_check
    check (request_type in ('quote', 'offer', 'repair', 'pickup', 'cable'));

comment on table public.quote_requests is
  'Website requests (quote / offer / repair / pickup / cable). Insert-only for anon; read via dashboard or service role.';
