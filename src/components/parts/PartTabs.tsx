"use client";

import { Children, useState } from "react";

/* Tabs for the part page. Every panel stays in the HTML (only hidden), so Google reads all of it. */
export default function PartTabs({ tabs, children, footer }: { tabs: { id: string; label: string }[]; children: React.ReactNode; footer?: React.ReactNode }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const panels = Children.toArray(children);
  return (
    <section aria-label="Part details" className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#EAEAEC] bg-white shadow-[0_30px_70px_-55px_rgba(19,19,22,0.5)]">
      <div role="tablist" aria-label="Part details" className="grid grid-cols-3 gap-1.5 border-b border-[#EAEAEC] bg-[#FAFAFB] p-2 sm:flex sm:gap-1 sm:px-4 sm:pb-0 sm:pt-3">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={on} aria-controls={`panel-${t.id}`}
              onClick={() => setActive(t.id)}
              className={`relative min-w-0 truncate rounded-xl px-1.5 py-2.5 text-center text-[13px] font-semibold transition sm:-mb-px sm:flex-[1_1_auto] sm:overflow-visible sm:whitespace-nowrap sm:px-2.5 sm:rounded-b-none sm:rounded-t-xl sm:py-3 sm:text-[13.5px] xl:text-[14px] ${
                on
                  ? "bg-white text-[#A50D25] shadow-[0_6px_16px_-10px_rgba(19,19,22,0.5)] ring-1 ring-[#C8102E]/25 sm:border sm:border-[#EAEAEC] sm:border-b-white sm:shadow-none sm:ring-0"
                  : "text-[#5A5A66] hover:text-[#131316] sm:border sm:border-transparent"
              }`}>
              {t.label}
              {on && <span aria-hidden="true" className="absolute inset-x-4 top-0 hidden h-0.75 rounded-b-full bg-linear-to-r from-[#C8102E] to-[#FF3B55] sm:block" />}
            </button>
          );
        })}
      </div>
      <div className="flex-1">
        {panels.map((panel, i) => {
          const t = tabs[i];
          return (
            <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={t.id !== active} className="p-5 sm:p-7">
              {panel}
            </div>
          );
        })}
      </div>
      {footer}
    </section>
  );
}
