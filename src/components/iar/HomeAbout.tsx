import Link from "next/link";
import { ArrowRight, Check, History, MapPin, Phone, Wrench } from "lucide-react";
import { brandFont } from "@/lib/font";
import { contact, phoneHref } from "@/lib/contact";

/* Home page "About IAR" block — wording from IAR_Website_Wording_USA_Revised_6 (Home: Introduction,
   Service Area, Why Choose IAR, Legacy & Obsolete Equipment, Call to Action Band). */

const why = [
  "Fast servo motor repair: quick quotes and priority service when your line is down",
  "Affordable servo motor repair — the bill typically lands well below the price of new hardware",
  "Experienced servo motor rebuilders with factory-level test equipment, including a SINUMERIK 840D test bench",
  "Load tested on OEM-standard equipment, with a test report for every unit",
  "Free evaluation, one-year warranty and free return shipping",
];

export default function HomeAbout() {
  return (
    <section aria-labelledby="about-iar-heading" className={`${brandFont.className} bg-white py-12 lg:py-16`}>
      <div className="mx-auto max-w-360 px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B30E29] sm:text-[12px]">
              <span className="h-0.75 w-8 rounded-full bg-linear-to-r from-[#C8102E] to-[#FF3B55]" />
              About IAR
            </p>
            <h2 id="about-iar-heading" className="mt-3 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#131316] sm:text-[34px]">
              Servo Motor Repair Shop in{" "}
              <span className="bg-linear-to-r from-[#C8102E] to-[#FF3B55] bg-clip-text text-transparent">Grand Island, NY</span>
            </h2>
            <p className="mt-4 text-[15px] leading-[1.75] text-[#4A4A55]">
              Industrial Automation Repair Inc. (IAR) is a full-service servo motor repair shop and industrial automation repair
              center in Grand Island, New York. We provide industrial servo motor repair,{" "}
              <Link href="/services/servo-drive-repair" className="font-semibold text-[#A50D25] hover:underline">servo drive repair</Link> and{" "}
              <Link href="/services" className="font-semibold text-[#A50D25] hover:underline">industrial electronics repair</Link> for plant
              maintenance teams, OEMs and manufacturers. Plants in Buffalo and Niagara can drop units off at our Grand Island, NY
              repair center; manufacturers in every other state ship units in or book a pickup.
            </p>
            <div className="mt-5 flex gap-3 rounded-2xl border border-[#EAEAEC] bg-[#FAFAFB] p-4">
              <MapPin size={20} className="mt-0.5 flex-none text-[#C8102E]" aria-hidden="true" />
              <p className="text-[14.5px] leading-[1.7] text-[#4A4A55]">
                We offer <Link href="/services/servo-motor-repair" className="font-semibold text-[#A50D25] hover:underline">servo motor repair</Link>{" "}
                across the USA. Our nationwide servo repair service works the same in every state: free evaluation, written quote,
                load test and a one-year warranty, with free return shipping on completed repairs. For Western New York industrial
                repair, walk-in drop-off is available during business hours.
              </p>
            </div>
            <div className="mt-5 flex gap-3 rounded-2xl border border-[#EAEAEC] bg-[#FAFAFB] p-4">
              <History size={20} className="mt-0.5 flex-none text-[#C8102E]" aria-hidden="true" />
              <div>
                <p className="font-bold text-[#131316]">Legacy &amp; obsolete equipment</p>
                <p className="mt-1 text-[14.5px] leading-[1.7] text-[#4A4A55]">
                  Legacy automation equipment support is a big share of our bench time. When a manufacturer stops supporting a motor
                  or drive, repair is often the only option. We rebuild discontinued units, stock obsolete parts and offer{" "}
                  <Link href="/services/exchange" className="font-semibold text-[#A50D25] hover:underline">exchange units</Link> on many
                  models, so older CNC machines, robots and production lines keep running. From one board to complete industrial
                  control system repair and factory automation equipment repair, legacy units included.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="hexcard relative overflow-hidden rounded-[22px] p-6 text-white sm:p-7">
              <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF8A99]">Why choose IAR</p>
              <ul className="relative mt-4 space-y-3">
                {why.map((w) => (
                  <li key={w} className="flex items-start gap-2.5 text-[14.5px] leading-snug text-white/85">
                    <Check size={17} strokeWidth={2.5} className="mt-0.5 flex-none text-[#FF3B55]" aria-hidden="true" />{w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[22px] bg-linear-to-br from-[#C8102E] to-[#8E0B20] p-6 text-white shadow-[0_30px_60px_-35px_rgba(200,16,46,0.9)] sm:p-7">
              <p className="text-[20px] font-extrabold leading-tight">Machine down?</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-white/85">
                Our machine down repair service starts with one call: {contact.phone} (24/7), or request a quote online.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link href="/request-repair" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-[14px] font-semibold text-[#131316] transition hover:bg-[#131316] hover:text-white">
                  <Wrench size={16} aria-hidden="true" /> Request a Repair Quote <ArrowRight size={15} aria-hidden="true" />
                </Link>
                <a href={phoneHref(contact.phone)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/40 px-5 text-[14px] font-semibold transition hover:bg-white/10">
                  <Phone size={16} aria-hidden="true" /> {contact.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
