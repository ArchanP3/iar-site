"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Info } from "lucide-react";
import { bulkIndex } from "@/app/admin/(app)/pages/actions";
import { b } from "./ui";

/* Tracks the row checkboxes inside it and offers bulk actions for the selected pages. */
export default function BulkBar({ children, paths }: { children: React.ReactNode; paths: string[] }) {
  const [sel, setSel] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const router = useRouter();
  const onChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const t = e.target as unknown as HTMLInputElement;
    if (t.name !== "sel") return;
    setSel((s) => (t.checked ? [...new Set([...s, t.value])] : s.filter((x) => x !== t.value)));
  };
  const run = (noindex: boolean) =>
    start(async () => {
      await bulkIndex(sel, noindex);
      setSel([]);
      document.querySelectorAll<HTMLInputElement>('input[name="sel"]').forEach((i) => (i.checked = false));
      router.refresh();
    });
  return (
    <div onChange={onChange}>
      {sel.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 border-b border-[#CFE0FF] bg-[#F0F6FF] px-4 py-2.5 text-[12.8px] text-[#0B3A8C]">
          <Info size={16} />
          <b>{sel.length} selected.</b>
          <span className="flex-1" />
          <button disabled={pending} onClick={() => run(true)} className={b("light", true)}><EyeOff size={13} /> Set noindex</button>
          <button disabled={pending} onClick={() => run(false)} className={b("light", true)}><Eye size={13} /> Set index</button>
          <button onClick={() => { setSel(paths.length === sel.length ? [] : paths); document.querySelectorAll<HTMLInputElement>('input[name="sel"]').forEach((i) => (i.checked = paths.length !== sel.length)); }} className={b("dark", true)}>{paths.length === sel.length ? "Clear" : `Select all ${paths.length}`}</button>
        </div>
      )}
      {children}
    </div>
  );
}
