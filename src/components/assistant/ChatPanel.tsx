"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CheckCircle2, Cpu, FileText, Loader2, Mail, Phone, PhoneCall, Search, Send, TriangleAlert, Wrench, X } from "lucide-react";
import { brandFont } from "@/lib/font";
import { phoneHref } from "@/lib/contact";
import { WA_EVENT, WhatsAppIcon } from "@/components/WhatsAppButton";
import { useContact } from "@/components/cms/ContactProvider";
import { sendLead } from "@/components/request/FormParts";
import type { Action, Reply } from "@/lib/assistant/brain";

type Card = "repair" | "quote" | "callback";
type Msg =
  | { id: number; from: "me"; text: string }
  | { id: number; from: "bot"; text: string[]; reply?: Reply; chips?: Action[] }
  | { id: number; from: "bot"; card: Card; done?: boolean };

const KEY = "aq_chat_v1";
const title: Record<Card, string> = { repair: "Repair request", quote: "Quote request", callback: "Call back request" };
const actionLabel: Record<Action, string> = {
  repair: "Request a repair",
  quote: "Get a quote",
  part: "Find a part",
  callback: "Call me back",
  fault: "Fault code help",
  contact: "Contact options",
};
const actionIcon: Record<Action, typeof Wrench> = { repair: Wrench, quote: FileText, part: Search, callback: PhoneCall, fault: TriangleAlert, contact: Mail };

let nextId = Date.now();
const id = () => ++nextId;

function greeting(path: string): { text: string[]; chips: Action[] } {
  const h1 = typeof document !== "undefined" ? document.querySelector("h1")?.textContent?.trim().replace(/\s+/g, " ") ?? "" : "";
  if (path.startsWith("/parts/") && h1) return { text: [`Questions about ${h1}? I can get you a quote, check a repair, or find a similar part.`], chips: ["quote", "repair", "callback"] };
  if (path.startsWith("/brands/") && h1) return { text: [`Need help with ${h1.replace(/ Repair$/i, "")} equipment? Type a part number or fault code, or start a request.`], chips: ["repair", "quote", "fault"] };
  if (path.startsWith("/fault-codes")) return { text: ["Stuck on a fault? Type the code shown on the drive (for example F30001) and I'll find it."], chips: ["fault", "repair", "callback"] };
  return {
    text: ["Hi, I'm the AutomIQ assistant. I can find a part, look up a fault code, or start a repair or quote for you.", "Type a question or pick an option."],
    chips: ["repair", "quote", "part", "fault", "callback"],
  };
}

export default function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname();
  const contact = useContact();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);

  /* restore this visit's conversation, or greet */
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || "[]") as Msg[];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is browser-only
      if (saved.length) { setMsgs(saved); return; }
    } catch {}
    const g = greeting(path);
    setMsgs([{ id: id(), from: "bot", text: g.text, chips: g.chips }]);
  }, [path]);

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch {}
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (!open) return;
    /* phones: don't pop the keyboard open over the chat the moment it opens */
    const t = setTimeout(() => { if (matchMedia("(hover: hover) and (pointer: fine)").matches) input.current?.focus(); }, 60);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc); };
  }, [open, onClose]);

  const push = (...m: Msg[]) => setMsgs((x) => [...x, ...m]);

  async function ask(q: string) {
    const clean = q.trim();
    if (!clean || busy) return;
    setText("");
    push({ id: id(), from: "me", text: clean });
    setBusy(true);
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: clean }) });
      const reply = (await r.json()) as Reply;
      const msg: Msg = { id: id(), from: "bot", text: reply.text, reply, chips: reply.open ? reply.actions.filter((a) => a !== reply.open) : reply.actions };
      if (reply.open) push(msg, { id: id(), from: "bot", card: reply.open });
      else push(msg);
    } catch {
      push({ id: id(), from: "bot", text: ["I couldn't reach the server just now. Please try again, or use the options below."], chips: ["repair", "quote", "callback"] });
    }
    setBusy(false);
  }

  function choose(a: Action) {
    if (a === "repair" || a === "quote" || a === "callback") {
      push({ id: id(), from: "me", text: actionLabel[a] }, { id: id(), from: "bot", card: a });
      return;
    }
    if (a === "part") {
      push({ id: id(), from: "me", text: actionLabel.part }, { id: id(), from: "bot", text: ["Type the part number or model (for example 6SL3120-1TE21-0AA3). I'll search our catalogue."] });
    } else if (a === "fault") {
      push({ id: id(), from: "me", text: actionLabel.fault }, { id: id(), from: "bot", text: ["Type the fault or alarm code from the display, and the brand if you know it (for example \"Siemens F30001\")."] });
    } else {
      const lines = ["You can reach our team here:"];
      if (contact.email) lines.push(`Email: ${contact.email}`);
      if (!contact.phone) lines.push("Or leave your number and we'll call you back.");
      push({ id: id(), from: "me", text: actionLabel.contact }, { id: id(), from: "bot", text: lines, chips: contact.phone ? [] : ["callback"] });
    }
    input.current?.focus();
  }

  const markDone = (mid: number) => setMsgs((x) => x.map((m) => (m.id === mid ? { ...m, done: true } : m)));

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="AutomIQ assistant"
      className={`${brandFont.className} ${open ? "flex" : "hidden"} fixed inset-x-0 top-0 h-dvh z-[60] flex-col bg-[#F7F7F8] text-[#131316] sm:inset-auto sm:top-auto sm:right-5 sm:bottom-24 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[390px] sm:overflow-hidden sm:rounded-[22px] sm:border sm:border-[#F0DADD] sm:shadow-[0_40px_90px_-30px_rgba(6, 6, 7,0.55)] print:hidden`}
    >
      {/* header */}
      <div className="relative flex items-center gap-3 overflow-hidden bg-[#060607] px-4 py-3.5 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -top-16 -left-10 size-48 rounded-full bg-[radial-gradient(closest-side,rgba(200, 16, 46,0.55),transparent)]" />
        <span className="relative grid size-10 place-items-center rounded-xl bg-[#C8102E]"><Cpu size={20} aria-hidden="true" /></span>
        <div className="relative min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-tight">AutomIQ Assistant</p>
          <p className="flex items-center gap-1.5 text-[12px] text-white/70"><span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" /> Parts, fault codes, repairs and quotes</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat" className="relative grid size-9 place-items-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* contact strip */}
      <div className="flex gap-2 border-b border-[#EAEAEC] bg-white px-3 py-2">
          {contact.phone && (
            <a href={phoneHref(contact.phone)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#F0DADD] px-2.5 text-[12.5px] font-semibold hover:border-[#C8102E]"><Phone size={13} aria-hidden="true" /> Call</a>
          )}
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent(WA_EVENT, { detail: { topic: "A question from the website chat" } }))} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#F0DADD] px-2.5 text-[12.5px] font-semibold hover:border-[#25D366]"><WhatsAppIcon size={13} className="text-[#1DA851]" /> WhatsApp</button>
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-lg border border-[#F0DADD] px-2.5 text-[12.5px] font-semibold hover:border-[#C8102E]"><Mail size={13} aria-hidden="true" /> <span className="truncate">Email</span></a>
          )}
        </div>


      {/* messages */}
      <div ref={list} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {msgs.map((m) =>
          m.from === "me" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-md bg-[#C8102E] px-3.5 py-2 text-[14px] leading-snug text-white">{m.text}</p>
            </div>
          ) : "card" in m ? (
            <RequestCard key={m.id} kind={m.card} done={m.done} onDone={() => markDone(m.id)} page={path} />
          ) : (
            <div key={m.id} className="max-w-[92%] space-y-2">
              {m.text.map((t, i) => (
                <p key={i} className="rounded-2xl rounded-bl-md border border-[#EAEAEC] bg-white px-3.5 py-2 text-[14px] leading-relaxed">{t}</p>
              ))}
              {!!m.reply?.parts.length && (
                <div className="space-y-1.5">
                  {m.reply.parts.map((p) => (
                    <Link key={p.href} href={p.href} className="flex items-center gap-2 rounded-xl border border-[#EAEAEC] bg-white px-3 py-2 hover:border-[#C8102E]">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[13px] font-semibold">{p.partNumber}</span>
                        <span className="block truncate text-[12px] text-[#62626F]">{p.manufacturer} · {p.name}</span>
                      </span>
                      <ArrowRight size={15} className="shrink-0 text-[#B30E29]" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
              {!!m.reply?.links.length && (
                <div className="flex flex-col gap-1">
                  {m.reply.links.map((l) => (
                    <Link key={l.href + l.label} href={l.href} className="inline-flex items-start gap-1.5 text-[13px] font-semibold text-[#B30E29] hover:underline">
                      <ArrowUpRight size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{l.label}{l.note && <span className="font-normal text-[#62626F]"> · {l.note}</span>}</span>
                    </Link>
                  ))}
                </div>
              )}
              {!!m.chips?.length && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {m.chips.map((a) => {
                    const I = actionIcon[a];
                    return (
                      <button key={a} type="button" onClick={() => choose(a)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#EACBCF] bg-white px-3 text-[12.5px] font-semibold text-[#131316] hover:border-[#C8102E] hover:text-[#B30E29]">
                        <I size={13} aria-hidden="true" /> {actionLabel[a]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ),
        )}
        {busy && (
          <p className="inline-flex items-center gap-2 rounded-2xl border border-[#EAEAEC] bg-white px-3.5 py-2 text-[13px] text-[#62626F]">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Looking that up…
          </p>
        )}
      </div>

      {/* input */}
      <form onSubmit={(e) => { e.preventDefault(); void ask(text); }} className="flex items-center gap-2 border-t border-[#EAEAEC] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <label htmlFor="aq-chat-input" className="sr-only">Type your question</label>
        <input
          ref={input}
          id="aq-chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          autoComplete="off"
          placeholder="Part number, fault code, question…"
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#F0DADD] bg-[#FAFAFA] px-3.5 text-[14px] outline-none placeholder:text-[#696976] focus:border-[#C8102E]"
        />
        <button type="submit" disabled={busy || !text.trim()} aria-label="Send" className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#C8102E] text-white hover:bg-[#B30E29] disabled:opacity-50">
          <Send size={17} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

/* ---------- short request forms inside the chat ---------- */
function RequestCard({ kind, done, onDone, page }: { kind: Card; done?: boolean; onDone: () => void; page: string }) {
  const contact = useContact();
  const [state, setState] = useState<"idle" | "sending" | "error" | "closed">("idle");
  const field = "h-10 w-full rounded-lg border border-[#F0DADD] bg-white px-3 text-[13.5px] outline-none placeholder:text-[#696976] focus:border-[#C8102E]";
  const lab = "mb-1 block text-[12px] font-semibold text-[#4B4B55]";
  const fid = (n: string) => `aqc-${kind}-${n}`;

  if (done) {
    return (
      <div className="flex max-w-[92%] items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[13.5px] leading-snug text-emerald-900">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
        <span>{kind === "callback" ? "Thanks! Your call back request is in. Our team will call you." : "Thanks! Your request is in. Our team will reply by email."}</span>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (await sendLead({ ...data, _type: "chat", _subject: `Website chat: ${title[kind]}`, Chat: page })) onDone();
    else setState("error");
  }

  return (
    <form onSubmit={submit} className="max-w-[96%] space-y-2.5 rounded-2xl border border-[#F0DADD] bg-white p-3.5 shadow-[0_14px_30px_-24px_rgba(19, 19, 22,0.6)]">
      <p className="text-[14px] font-bold">{title[kind]}</p>
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid grid-cols-2 gap-2">
        <div><label htmlFor={fid("name")} className={lab}>Name *</label><input id={fid("name")} name="Name" required className={field} autoComplete="name" /></div>
        {kind === "callback" ? (
          <div><label htmlFor={fid("phone")} className={lab}>Phone *</label><input id={fid("phone")} name="Phone" type="tel" required className={field} autoComplete="tel" /></div>
        ) : (
          <div><label htmlFor={fid("email")} className={lab}>Email *</label><input id={fid("email")} name="Email" type="email" required className={field} autoComplete="email" /></div>
        )}
      </div>
      {kind === "repair" && (
        <>
          <div><label htmlFor={fid("part")} className={lab}>Part number or model *</label><input id={fid("part")} name="Part number" required className={`${field} font-mono`} placeholder="e.g. 6SL3120-1TE21-0AA3" /></div>
          <div><label htmlFor={fid("fault")} className={lab}>What&apos;s wrong?</label><textarea id={fid("fault")} name="Fault" rows={2} className={`${field} h-auto py-2`} placeholder="Fault code, symptoms…" /></div>
          <div><label htmlFor={fid("phone2")} className={lab}>Phone (optional)</label><input id={fid("phone2")} name="Phone" type="tel" className={field} autoComplete="tel" /></div>
        </>
      )}
      {kind === "quote" && (
        <>
          <div><label htmlFor={fid("part")} className={lab}>Part number *</label><input id={fid("part")} name="Part number" required className={`${field} font-mono`} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label htmlFor={fid("qty")} className={lab}>Quantity</label><input id={fid("qty")} name="Quantity" type="number" min={1} defaultValue={1} className={field} /></div>
            <div>
              <label htmlFor={fid("cond")} className={lab}>Condition</label>
              <select id={fid("cond")} name="Condition" className={field} defaultValue="Any">
                <option>Any</option><option>New</option><option>Refurbished</option><option>Exchange</option><option>Repair mine</option>
              </select>
            </div>
          </div>
        </>
      )}
      {kind === "callback" && (
        <>
          <div><label htmlFor={fid("time")} className={lab}>Best time to call</label><input id={fid("time")} name="Best time" className={field} placeholder="e.g. Today after 2 pm" /></div>
          <div><label htmlFor={fid("about")} className={lab}>What&apos;s it about?</label><input id={fid("about")} name="Topic" className={field} placeholder="Part number, repair, quote…" /></div>
        </>
      )}
      {state === "error" && <p role="alert" className="text-[12.5px] text-red-700">That didn&apos;t send. Please try again{contact.email ? ` or email ${contact.email}` : ""}.</p>}
      {state === "closed" && <p role="alert" className="text-[12.5px] text-[#5B4A1E]">Online requests open very soon.{contact.email ? ` Please email ${contact.email} for now.` : ""}</p>}
      <button type="submit" disabled={state === "sending"} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#C8102E] text-[13.5px] font-semibold text-white hover:bg-[#B30E29] disabled:opacity-60">
        {state === "sending" ? <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Sending…</> : <>Send {kind === "callback" ? "call back request" : "request"} <ArrowRight size={15} aria-hidden="true" /></>}
      </button>
      <p className="text-[11.5px] leading-snug text-[#696976]">No work starts without your approval. Your details are used only for this request.</p>
    </form>
  );
}
