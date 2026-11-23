"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";

/* Phones and tablets: a "Filters" button that opens the filters as a sheet from the bottom
   (rendered on <body>, so the sticky bar around the button cannot clip it).
   Picking a filter is a link, so the sheet closes and the new list loads. */
export default function FilterSheet({ active, children }: { active: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B1A3C] px-4 text-[14.5px] font-bold text-white"
      >
        <SlidersHorizontal size={17} aria-hidden="true" />
        Filters{active ? ` (${active})` : ""}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="absolute inset-0 bg-[#050B18]/55" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-[22px] bg-white text-[#0B1A3C] shadow-[0_-20px_50px_-20px_rgba(5,11,24,0.5)]"
          >
            <span aria-hidden="true" className="mx-auto mt-2 h-1.5 w-11 rounded-full bg-[#CBD5E1]" />
            <div className="flex items-center justify-between border-b border-[#EEF3F9] px-4 pb-3 pt-2">
              <p className="text-[18px] font-extrabold">Filters</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[#F4F7FB]">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-4"
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              {children}
            </div>
            <div className="border-t border-[#EEF3F9] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={() => setOpen(false)} className="h-12 w-full rounded-xl bg-linear-to-br from-[#0066FF] to-[#2F8BFF] text-[15px] font-extrabold text-white">
                Show parts
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
