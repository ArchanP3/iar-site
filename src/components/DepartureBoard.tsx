"use client";

import { useEffect, useRef, useState } from "react";
import { Plane } from "lucide-react";
import { destinations, origin } from "@/lib/globalRoutes";

/* Airport-style split-flap board: example air shipments leaving Grand Island, NY.
   Every few seconds one row flips to the next destination in src/lib/globalRoutes.ts.
   Illustrative only (no times or tracking): carrier and service rotate through what we really use. */

const CARRIERS = ["FEDEX", "UPS", "DHL"];
const ROWS = 6;
const EVERY = 2600;
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace";
const FLAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type Row = { city: string; country: string; via: string; service: string };

const CODE: Record<string, string> = { USA: "USA", Canada: "CAN", Mexico: "MEX", "United Kingdom": "GBR", France: "FRA", Germany: "DEU", Spain: "ESP", Italy: "ITA", Japan: "JPN", "South Korea": "KOR", India: "IND", Singapore: "SGP" };

const all: Row[] = destinations.map((d, i) => ({
  city: d.city.toUpperCase(),
  country: CODE[d.country] ?? d.country.slice(0, 3).toUpperCase(),
  via: CARRIERS[i % CARRIERS.length],
  service: d.country === "USA" || d.country === "Canada" ? "COURIER" : "AIR",
}));

/** One split-flap cell: on change, each letter flips through random characters before settling. */
function Flap({ text, width }: { text: string; width: number }) {
  const target = text.padEnd(width, " ").slice(0, width);
  const [shown, setShown] = useState(target);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let step = reduce ? 999 : 0;
    const id = setInterval(() => {
      step++;
      setShown(
        target
          .split("")
          .map((ch, i) => (step > 3 + i * 0.6 || ch === " " ? ch : FLAP[Math.floor(Math.random() * FLAP.length)]))
          .join(""),
      );
      if (step > 4 + width * 0.6) { clearInterval(id); setShown(target); }
    }, 55);
    return () => clearInterval(id);
  }, [target, width]);

  return (
    <span className="flex gap-0.5" aria-hidden="true" style={{ fontFamily: MONO }}>
      {shown.split("").map((ch, i) => (
        <span key={i} className="relative grid h-6.5 w-[1.15em] place-items-center overflow-hidden rounded-[3px] bg-[#1C1C21] text-[13px] font-bold text-[#F5F5F7] shadow-[inset_0_-1px_0_rgba(0,0,0,0.6)] sm:h-7.5 sm:text-[15px]">
          {ch === " " ? " " : ch}
          <span className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
        </span>
      ))}
    </span>
  );
}

export default function DepartureBoard() {
  const [rows, setRows] = useState<Row[]>(() => all.slice(0, ROWS));
  const next = useRef(ROWS);
  const slot = useRef(0);
  const [time, setTime] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      setRows((r) => {
        const copy = [...r];
        copy[slot.current] = all[next.current % all.length];
        next.current++;
        slot.current = (slot.current + 1) % ROWS;
        return copy;
      });
    }, EVERY);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/New_York" }).format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <figure className="m-0 overflow-hidden rounded-[22px] border border-white/10 bg-[#0B0B0E] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-linear-to-r from-[#C8102E] to-[#8E0B20] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <Plane size={20} className="-rotate-45" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-extrabold tracking-[0.18em] sm:text-[17px]">DEPARTURES</p>
            <p className="text-[11px] text-white/80">From {origin.city}</p>
          </div>
        </div>
        <p className="text-right text-[11px] leading-tight text-white/80">
          <span className="block text-[18px] font-bold tabular-nums text-white sm:text-[20px]">{time || " "}</span>ET
        </p>
      </div>

      <div className="overflow-x-auto px-3 py-3 sm:px-5 sm:py-4">
        <table className="w-full border-separate border-spacing-y-1.5">
          <caption className="sr-only">Example shipments from {origin.city}: {all.map((r) => `${r.city}, ${r.country}`).join("; ")}</caption>
          <thead>
            <tr className="text-left text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#FF8A99]">
              <th className="pb-1 pr-3 font-semibold">To</th>
              <th className="pb-1 pr-3 font-semibold max-sm:hidden">Ctry</th>
              <th className="pb-1 pr-3 font-semibold">Via</th>
              <th className="pb-1 font-semibold max-sm:hidden">Service</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="pr-3"><Flap text={r.city} width={11} /></td>
                <td className="pr-3 max-sm:hidden"><Flap text={r.country} width={3} /></td>
                <td className="pr-3"><Flap text={r.via} width={5} /></td>
                <td className="max-sm:hidden"><Flap text={r.service} width={7} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="border-t border-white/10 px-4 py-2.5 text-center text-[11.5px] text-white/55 sm:px-5">Example shipments, not live tracking.</figcaption>
    </figure>
  );
}
