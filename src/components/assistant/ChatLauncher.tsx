"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { montserrat } from "@/lib/font";

/* The chat window's code downloads only when someone opens it (or hovers the button). */
const loadPanel = () => import("./ChatPanel");
const ChatPanel = dynamic(loadPanel, { ssr: false });

export default function ChatLauncher() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);

  /* reopen after a page change if the visitor had it open */
  useEffect(() => {
    try {
      // sessionStorage only exists in the browser, so this runs after the first render
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (sessionStorage.getItem("aq_chat_open") === "1") { setUsed(true); setOpen(true); }
    } catch {}
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem("aq_chat_open", open ? "1" : "0"); } catch {}
  }, [open]);

  /* let any button on the site open it: window.dispatchEvent(new Event("aq-chat-open")) */
  useEffect(() => {
    const show = () => { setUsed(true); setOpen(true); };
    window.addEventListener("aq-chat-open", show);
    return () => window.removeEventListener("aq-chat-open", show);
  }, []);

  if (path.startsWith("/admin")) return null;
  /* part pages have a sticky buy bar at the bottom on phones */
  const lift = path.startsWith("/parts/") ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-5" : "bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-5";

  return (
    <>
      {used && <ChatPanel open={open} onClose={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => { setUsed(true); setOpen((o) => !o); }}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        aria-label={open ? "Close chat" : "Need help? Chat with AutomIQ"}
        aria-expanded={open}
        className={`${montserrat.className} fixed right-4 ${lift} z-50 inline-flex size-13 items-center justify-center gap-2 rounded-full bg-[#0066FF] sm:h-14 sm:w-auto sm:pl-4 sm:pr-5 text-[14.5px] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(0,102,255,0.9)] transition hover:bg-[#005AE0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22D3EE] print:hidden sm:right-5 ${open ? "max-sm:hidden" : ""}`}
      >
        {open ? <X size={20} aria-hidden="true" /> : <MessageCircle size={20} aria-hidden="true" />}
        {/* phones: a round icon, so it doesn't cover the page */}
        <span className="sr-only sm:not-sr-only">{open ? "Close" : "Need help?"}</span>
      </button>
    </>
  );
}
