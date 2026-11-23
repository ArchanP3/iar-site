"use client";

import { useEffect, useRef } from "react";

export type TabItem<K extends string> = { key: K; label: string; count?: number };

/* Segmented tabs with a navy pill that slides to the selected tab.
   The pill is positioned straight on the DOM (no re-render), and re-measured on resize. */
export default function SlidingTabs<K extends string>({
  label,
  idPrefix,
  tabs,
  value,
  onChange,
}: {
  label: string;
  idPrefix: string;
  tabs: readonly TabItem<K>[];
  value: K;
  onChange: (key: K) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const ind = indRef.current;
    if (!list || !ind) return;
    const place = () => {
      const active = list.querySelector<HTMLButtonElement>('[aria-selected="true"]');
      if (!active) return;
      const first = !("ready" in list.dataset);
      if (first) ind.style.transition = "none"; // no slide-in on page load
      ind.style.width = `${active.offsetWidth}px`;
      ind.style.transform = `translateX(${active.offsetLeft}px)`;
      ind.style.opacity = "1";
      list.dataset.ready = "";
      if (first) {
        void ind.offsetWidth;
        ind.style.transition = "";
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => ro.disconnect();
  }, [value]);

  /* Arrow keys move between tabs (standard tablist keyboard pattern) */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.key === value);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    onChange(next.key);
    listRef.current?.querySelector<HTMLButtonElement>(`#${idPrefix}-tab-${next.key}`)?.focus();
  };

  return (
    <div ref={listRef} role="tablist" aria-label={label} className="aq-tabs" onKeyDown={onKeyDown}>
      <span ref={indRef} aria-hidden="true" className="aq-tabs__ind" />
      {tabs.map((t) => (
        <button
          key={t.key}
          id={`${idPrefix}-tab-${t.key}`}
          type="button"
          role="tab"
          aria-selected={value === t.key}
          aria-controls={`${idPrefix}-panel-${t.key}`}
          tabIndex={value === t.key ? 0 : -1}
          onClick={() => onChange(t.key)}
          className="aq-tabs__btn"
        >
          {t.label}
          {t.count != null && <span className="aq-tabs__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
