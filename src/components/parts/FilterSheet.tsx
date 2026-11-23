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
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#131316] px-4 text-[14.5px] font-bold text-white"
      >
        <SlidersHorizontal size={17} aria-hidden="true" />
        Filters{active ? ` (${active})` : ""}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="absolute inset-0 bg-[#0A0A0C]/55" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-[22px] bg-white text-[#131316] shadow-[0_-20px_50px_-20px_rgba(10, 10, 12,0.5)]"
          >
            <span aria-hidden="true" className="mx-auto mt-2 h-1.5 w-11 rounded-full bg-[#D4D4D8]" />
            <div className="flex items-center justify-between border-b border-[#F3F3F4] px-4 pb-3 pt-2">
              <p className="text-[18px] font-extrabold">Filters</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[#F7F7F8]">
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
            <div className="border-t border-[#F3F3F4] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={() => setOpen(false)} className="h-12 w-full rounded-xl bg-linear-to-br from-[#C8102E] to-[#F31D3D] text-[15px] font-extrabold text-white">
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
