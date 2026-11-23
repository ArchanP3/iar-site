"use client";

import { useActionState } from "react";
import { RotateCcw } from "lucide-react";
import { scanSite } from "@/app/admin/(app)/pages/actions";
import { b } from "./ui";

export default function ScanButton({ label = "Scan site now" }: { label?: string }) {
  const [state, action, pending] = useActionState(scanSite, undefined);
  return (
    <form action={action} className="flex items-center gap-2.5">
      {state?.ok && <span className="text-[12.5px] font-semibold text-[#067647]">{state.ok}</span>}
      {state?.error && <span className="text-[12.5px] font-semibold text-[#B42318]">{state.error}</span>}
      <button disabled={pending} className={b("primary")}>
        <RotateCcw size={15} className={pending ? "animate-spin" : ""} /> {pending ? "Scanning… (about a minute)" : label}
      </button>
    </form>
  );
}
