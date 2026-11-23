"use client";

import Counter from "@/components/Counter";

/* Rolling number (React Bits Counter) that inherits the surrounding text size and colour.
   Optional second number for ranges like 24–72. */
export default function StatCounter({ value, to, suffix, prefix }: { value: number; to?: number; suffix?: string; prefix?: string }) {
  const common = { fontSize: "inherit", fontWeight: "inherit", textColor: "inherit", duration: 1.1, stagger: 0.06, fade: 0.25 } as const;
  return (
    <span className="inline-flex items-baseline whitespace-nowrap">
      {to === undefined ? (
        <Counter value={value} prefix={prefix} suffix={suffix} {...common} />
      ) : (
        <>
          <Counter value={value} prefix={prefix} {...common} />
          <span aria-hidden="true">–</span>
          <Counter value={to} suffix={suffix} {...common} />
        </>
      )}
    </span>
  );
}
