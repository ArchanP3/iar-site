import "server-only";

/* ------------------------------------------------------------------ */
/*  Leads = the website requests in public.quote_requests (saved by     */
/*  src/lib/requests.ts), plus the status and notes the team keeps in   */
/*  cms.lead_notes. The CMS login can read requests but never change    */
/*  them. Where the visitor came from is stored in `details` when the   */
/*  request is saved (Source, Landing page, Referrer, Sent from).       */
/* ------------------------------------------------------------------ */

export const LEAD_STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type Lead = {
  id: number; form: string; summary: string; data: Record<string, string>; page: string; landing: string; referrer: string; source: string;
  status: LeadStatus | "test"; notes: string; created_at: Date;
};

/** Attribution keys in `details`, shown separately from the form fields. */
export const SOURCE_KEYS = ["Source", "Campaign", "Landing page", "Referrer", "Sent from"];

/** One row per request, shaped like the Leads screen expects. Use as a subquery: SELECT ... FROM (${LEADS}) l */
export const LEADS = `
  SELECT r.id, r.created_at,
         CASE r.request_type
           WHEN 'quote' THEN 'Quote request' WHEN 'offer' THEN 'Offer' WHEN 'repair' THEN 'Repair request'
           WHEN 'pickup' THEN 'Pickup request' WHEN 'cable' THEN 'Cable request' WHEN 'order' THEN 'Order'
           WHEN 'contact' THEN 'Contact message' WHEN 'onsite' THEN 'On-site service' WHEN 'surplus' THEN 'Surplus offer'
           WHEN 'international' THEN 'International quote' WHEN 'whatsapp' THEN 'WhatsApp' WHEN 'chat' THEN 'Chat assistant'
           ELSE r.request_type END AS form,
         concat_ws(' · ', r.name, r.company, r.email, r.part_number) AS summary,
         jsonb_strip_nulls(jsonb_build_object(
           'Name', r.name, 'Email', r.email, 'Phone', r.phone, 'Company', r.company, 'Part number', r.part_number,
           'Manufacturer', r.manufacturer, 'Quantity', r.quantity::text, 'Message', r.message, 'Subject', r.subject
         )) || (r.details - '{${SOURCE_KEYS.join(",")}}'::text[]) AS data,
         coalesce(r.details->>'Sent from', '') AS page,
         coalesce(r.details->>'Landing page', '') AS landing,
         coalesce(r.details->>'Referrer', '') AS referrer,
         coalesce(nullif(concat_ws(' / ', r.details->>'Source', r.details->>'Campaign'), ''), 'Direct') AS source,
         -- requests sent from preview builds stay "test" until someone gives them a status
         coalesce(n.status, CASE WHEN r.details ? 'Test' THEN 'test' ELSE 'new' END) AS status,
         coalesce(n.notes, '') AS notes
    FROM public.quote_requests r
    LEFT JOIN cms.lead_notes n ON n.request_id = r.id`;
