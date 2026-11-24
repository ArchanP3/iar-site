import { CreditCard, Phone, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import { brandFont } from "@/lib/font";

/* Trust strip under the home hero. Wording from the IAR website wording document. */
const TRUST: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: "Free Return Shipping", text: "We cover return shipping on completed repairs and outbound shipping on in-stock orders." },
  { icon: ShieldCheck, title: "One-Year Warranty", text: "Every repair and every part is covered for a full year." },
  { icon: Phone, title: "24/7 Servo Motor Repair Support", text: "Need emergency servo motor repair? Call 1-877-904-6155 any time." },
  { icon: CreditCard, title: "Secure Payment", text: "Visa, Mastercard, American Express, Discover and PayPal." },
];

export default function TrustStrip() {
  return (
    <section aria-label="Why IAR" className={`${brandFont.className} border-t border-white/10 bg-[#1c1e23] text-white`}>
      <ul className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-10 2xl:px-16">
        {TRUST.map(({ icon: I, title, text }, i) => (
          <li key={title} className="iar-fade-up flex items-center gap-3" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
            <span className="hex-tile grid h-12 w-12 shrink-0 place-items-center bg-brand text-white"><I className="h-5 w-5" strokeWidth={2} aria-hidden /></span>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wide">{title}</p>
              <p className="text-xs text-white/60">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
