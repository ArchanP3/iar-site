-- WhatsApp buttons and the chat assistant save their requests here too.
-- A call back request from the chat may have a phone number and no email.

alter table public.quote_requests
  drop constraint quote_requests_request_type_check,
  add constraint quote_requests_request_type_check
    check (request_type in ('quote', 'offer', 'repair', 'pickup', 'cable',
                            'order', 'contact', 'onsite', 'surplus', 'international',
                            'whatsapp', 'chat'));

alter table public.quote_requests
  alter column email drop not null,
  add constraint quote_requests_email_or_phone
    check (email is not null or char_length(coalesce(phone, '')) >= 7);

comment on table public.quote_requests is
  'Website requests (quote / offer / repair / pickup / cable / order / contact / onsite / surplus / international / whatsapp / chat). Insert-only for anon; read via dashboard or service role.';
