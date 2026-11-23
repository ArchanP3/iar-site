"use client";

import { useActionState, useState } from "react";
import { Building2, CheckCircle2, Clock, Image as ImageIcon, Megaphone, Plus, Share2, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { saveBusiness, saveSite } from "@/app/admin/(app)/locations/actions";
import type { Business, Security, SiteSettings } from "@/lib/cms/settings";
import MediaPicker from "./MediaPicker";
import { Alert, Card, b, cx, input } from "./ui";

function Status({ s }: { s?: { ok?: string; error?: string } }) {
  if (s?.error) return <Alert tone="bad" icon={<TriangleAlert size={16} />}>{s.error}</Alert>;
  if (s?.ok) return <Alert tone="ok" icon={<CheckCircle2 size={16} />}>{s.ok}</Alert>;
  return null;
}
const F = ({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) => (
  <label className={cx("flex flex-col gap-1.5", wide && "sm:col-span-2")}><span className="text-[12.5px] font-bold">{label}</span>{children}{hint && <span className="text-[11.5px] text-[#8494AB]">{hint}</span>}</label>
);

export function BusinessForm({ b: biz }: { b: Business }) {
  const [state, action, pending] = useActionState(saveBusiness, undefined);
  const [hours, setHours] = useState<[string, string][]>(biz.hours.length ? biz.hours : [["Mon – Fri", ""], ["Sat – Sun", "Closed"]]);
  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[1.3fr_1fr]">
      <Card title="Business details (NAP)" icon={<Building2 size={17} />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Business name" wide><input name="name" defaultValue={biz.name} className={input} /></F>
          <F label="Street address" hint="Leave empty to show only the city." wide><input name="street" defaultValue={biz.street} className={input} /></F>
          <F label="City"><input name="city" defaultValue={biz.city} className={input} /></F>
          <F label="Province / state"><input name="region" defaultValue={biz.region} className={input} /></F>
          <F label="Postal code"><input name="postal" defaultValue={biz.postal} className={input} /></F>
          <F label="Country code"><input name="country" defaultValue={biz.country} maxLength={2} className={input} /></F>
          <F label="Phone" hint="Empty = phone is hidden everywhere on the site."><input name="phone" defaultValue={biz.phone} placeholder="+1 (905) 555-0123" className={input} /></F>
          <F label="Email"><input name="email" defaultValue={biz.email} className={input} /></F>
          <F label="Google Business Profile link" hint="Use exactly the same name, address and phone as on your profile." wide><input name="gbp" defaultValue={biz.gbp} placeholder="https://maps.google.com/…" className={input} /></F>
        </div>
      </Card>
      <div className="flex flex-col gap-5">
        <Card title="Opening hours" icon={<Clock size={17} />}>
          <div className="flex flex-col gap-2">
            {hours.map(([d, t], i) => (
              <div key={i} className="grid grid-cols-[1fr_1.3fr_auto] gap-2">
                <input name="h_days" value={d} onChange={(e) => setHours(hours.map((h, k) => (k === i ? [e.target.value, h[1]] : h)))} placeholder="Mon – Fri" className={input} />
                <input name="h_time" value={t} onChange={(e) => setHours(hours.map((h, k) => (k === i ? [h[0], e.target.value] : h)))} placeholder="8:00 am – 5:00 pm" className={input} />
                <button type="button" onClick={() => setHours(hours.filter((_, k) => k !== i))} className="text-[#8494AB] hover:text-[#B42318]"><Trash2 size={15} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setHours([...hours, ["", ""]])} className={b("light", true)}><Plus size={13} /> Add a row</button>
            <p className="text-[11.5px] text-[#8494AB]">Rows with an empty time are not shown. No rows = the hours card on Contact is hidden.</p>
          </div>
        </Card>
        <Card title="Customer notes">
          <div className="flex flex-col gap-3">
            <F label="Drop-off note"><input name="dropOff" defaultValue={biz.dropOff} className={input} /></F>
            <F label="Service area"><input name="serviceArea" defaultValue={biz.serviceArea} className={input} /></F>
            <Status s={state} />
            <div><button disabled={pending} className={b("primary")}>{pending ? "Saving…" : "Save business details"}</button></div>
          </div>
        </Card>
      </div>
    </form>
  );
}

export function SiteForm({ s, sec, owner }: { s: SiteSettings; sec: Security; owner: boolean }) {
  const [state, action, pending] = useActionState(saveSite, undefined);
  const [og, setOg] = useState(s.ogImage);
  const [pick, setPick] = useState(false);
  const [on, setOn] = useState(s.announcement.on);
  const [text, setText] = useState(s.announcement.text);
  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-2">
      {pick && <MediaPicker onClose={() => setPick(false)} onPick={(m) => { setOg(m.url); setPick(false); }} />}
      <div className="flex flex-col gap-5">
        <Card title="Top bar message" icon={<Megaphone size={17} />}>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2.5 text-[13px] font-semibold"><input type="checkbox" name="announcement_on" checked={on} onChange={(e) => setOn(e.target.checked)} className="h-4 w-4 accent-[#0066FF]" /> Show a message in the dark bar above the menu (desktop)</label>
            <input name="announcement" value={text} onChange={(e) => setText(e.target.value)} maxLength={140} className={input} />
            <div className="rounded-lg bg-[#030817] px-3 py-2 text-[12.5px] text-white/70">{on ? text : <span className="opacity-50">(no message)</span>}</div>
          </div>
        </Card>
        <Card title="Default share image" icon={<ImageIcon size={17} />}>
          <div className="flex flex-col gap-3">
            <div className="flex aspect-1200/630 items-center justify-center rounded-xl bg-[#0B1A3C] bg-cover bg-center text-[13px] text-white/60" style={og ? { backgroundImage: `url(${og})` } : undefined}>{!og && "No default image"}</div>
            <div className="flex gap-2"><input name="ogImage" value={og} onChange={(e) => setOg(e.target.value)} placeholder="/media/share-image.webp" className={cx(input, "font-mono text-[12.5px]")} /><button type="button" onClick={() => setPick(true)} className={b("light")}>Choose</button></div>
            <p className="text-[11.5px] text-[#8494AB]">Shown on LinkedIn, WhatsApp, email and so on when a page has no image of its own. Best size 1200 × 630.</p>
          </div>
        </Card>
      </div>
      <div className="flex flex-col gap-5">
        <Card title="Social profiles" icon={<Share2 size={17} />}>
          <div className="flex flex-col gap-3">
            {(["linkedin", "youtube", "facebook", "instagram", "x"] as const).map((k) => (
              <F key={k} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)}><input name={k} defaultValue={s.social[k]} placeholder="https://" className={input} /></F>
            ))}
            <p className="text-[11.5px] text-[#8494AB]">Added to the Organization schema (sameAs), which helps Google connect your profiles to the website.</p>
          </div>
        </Card>
        {owner && (
          <Card title="Security" icon={<ShieldCheck size={17} />}>
            <label className="flex items-start gap-2.5 text-[13px]"><input type="checkbox" name="require2fa" defaultChecked={sec.require2fa} className="mt-0.5 h-4 w-4 accent-[#0066FF]" /><span><b>Require two-step sign-in for everyone</b><br /><span className="text-[#5B6B84]">Each person uses an authenticator app (Google Authenticator, Microsoft Authenticator) with their password.</span></span></label>
          </Card>
        )}
        <Status s={state} />
        <div><button disabled={pending} className={b("primary")}>{pending ? "Saving…" : "Save settings"}</button></div>
      </div>
    </form>
  );
}
