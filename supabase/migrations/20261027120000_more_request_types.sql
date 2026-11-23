-- Website orders (cart checkout: confirmed by the team before payment) and the
-- contact, on-site service, surplus and international quote forms.

alter table public.quote_requests
  drop constraint quote_requests_request_type_check,
  add constraint quote_requests_request_type_check
    check (request_type in ('quote', 'offer', 'repair', 'pickup', 'cable',
                            'order', 'contact', 'onsite', 'surplus', 'international'));

comment on table public.quote_requests is
  'Website requests (quote / offer / repair / pickup / cable / order / contact / onsite / surplus / international). Insert-only for anon; read via dashboard or service role.';
