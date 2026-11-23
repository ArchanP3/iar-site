"use client";

import { useEffect, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { mediaForPicker } from "@/app/admin/(app)/blog/actions";

/* Pick an image from the Media Library. */
export default function MediaPicker({ onPick, onClose }: { onPick: (m: { url: string; alt: string }) => void; onClose: () => void }) {
  const [items, setItems] = useState<{ filename: string; alt: string }[] | null>(null);
  useEffect(() => { mediaForPicker().then(setItems).catch(() => setItems([])); }, []);
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-215 overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center border-b border-[#E3EAF3] px-5 py-3.5"><b>Choose an image</b><span className="ml-2 text-[12.5px] text-[#8494AB]">Upload new images in Media Library</span><button type="button" onClick={onClose} className="ml-auto text-[#8494AB]"><X size={18} /></button></div>
        <div className="grid max-h-[65vh] grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-4">
          {items === null && <p className="col-span-full p-6 text-center text-[#8494AB]">Loading…</p>}
          {items?.length === 0 && <p className="col-span-full flex flex-col items-center gap-2 p-8 text-center text-[#8494AB]"><ImageIcon size={28} />No images yet. Upload some in Media Library.</p>}
          {items?.map((m) => (
            <button type="button" key={m.filename} onClick={() => onPick({ url: `/media/${m.filename}`, alt: m.alt })} className="overflow-hidden rounded-xl border border-[#E3EAF3] text-left hover:border-[#0066FF]">
              <div className="flex h-24 items-center justify-center bg-[#EEF4FB]">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={`/media/${m.filename}`} alt="" className="max-h-[80%] max-w-[80%] object-contain" /></div>
              <div className="truncate px-2 py-1.5 font-mono text-[11px]">{m.filename}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
