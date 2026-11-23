import Image from "next/image";
import { SearchCheck, ShieldCheck, Zap } from "lucide-react";

/* Sign-in, first setup and two-step screens share this split layout. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const feats = [
    { icon: SearchCheck, t: "SEO built into every page", d: "Titles, descriptions, slugs, schema and redirects, with live checks." },
    { icon: Zap, t: "Changes go live in seconds", d: "No developer, no rebuild. Every change is saved and can be undone." },
    { icon: ShieldCheck, t: "Roles and a full activity log", d: "Each person gets only the access they need." },
  ];
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col overflow-hidden bg-[#171719] px-16 py-14 text-white lg:flex">
        <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_10%,rgba(200,16,46,0.45),transparent_60%),radial-gradient(70%_60%_at_90%_90%,rgba(255,59,85,0.25),transparent_60%)]" />
        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(80%_70%_at_40%_40%,#000,transparent)]" />
        <div className="relative flex items-center gap-3">
          <a href="/" title="Go to the website" className="transition hover:opacity-85">
            <Image src="/iar-logo-white.png" alt="IAR — go to the website" width={88} height={40} className="h-10 w-auto" priority />
          </a>
          <span className="rounded-md border border-[#FF8A99]/35 px-1.5 py-0.5 text-[10px] font-bold tracking-[0.14em] text-[#FF8A99]">CMS</span>
        </div>
        <div className="relative mt-auto max-w-130">
          <p className="text-[12px] font-bold tracking-[0.24em] text-[#FF8A99]">CONTENT &amp; SEO STUDIO</p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.1] tracking-[-0.02em]">
            Manage every page,
            <br />
            <span className="bg-linear-to-r from-[#E8354F] to-[#FF8A99] bg-clip-text text-transparent">rank on every search.</span>
          </h1>
          {feats.map((f) => (
            <div key={f.t} className="mt-4.5 flex items-start gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-white/12 bg-white/8 text-[#FF8A99]"><f.icon size={18} /></div>
              <div>
                <b>{f.t}</b>
                <div className="mt-0.5 text-[13px] text-[#B4B4BC]">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-10">
        <a href="/" title="Go to the website" className="mb-7 transition hover:opacity-85 lg:hidden">
          <Image src="/iar-logo.png" alt="IAR — go to the website" width={75} height={34} className="h-8.5 w-auto" />
        </a>
        {children}
      </div>
    </div>
  );
}
