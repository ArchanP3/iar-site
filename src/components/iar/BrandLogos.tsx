import Image from "next/image";
import Link from "next/link";
import { brandFont } from "@/lib/font";

// Logo files live in /public/brands. To add or replace a logo, drop the file in that
// folder and add/edit a line here. Entries without `logo` render as a text wordmark.
type Brand = { name: string; logo?: string; href?: string };

const ALL = "/brands";
const B = (name: string, logo?: string, href = ALL): Brand => ({ name, logo: logo && `/brands/${logo}`, href });

const ROW_1: Brand[] = [
  B("Siemens", "siemens.svg", "/brands/siemens"),
  B("Allen-Bradley", "allen-bradley.svg", "/brands/allen-bradley"),
  B("FANUC", "fanuc.svg", "/brands/fanuc"),
  B("ABB", "abb.svg", "/brands/abb"),
  B("Bosch Rexroth", "bosch-rexroth.svg", "/brands/rexroth-indramat"),
  B("Yaskawa", "yaskawa.svg"),
  B("Mitsubishi Electric", "mitsubishi-electric.svg"),
  B("Kollmorgen", "kollmorgen.png"),
  B("Parker", "parker.svg"),
  B("Baldor", "baldor.svg"),
  B("Lenze", "lenze.svg"),
  B("Schneider Electric", "schneider.webp"),
  B("SEW-Eurodrive", "sew-eurodrive.svg"),
  B("Omron", "omron.svg"),
  B("Panasonic", "panasonic.svg"),
  B("Heidenhain", "heidenhain.svg"),
  B("Indramat", undefined, "/brands/rexroth-indramat"),
  B("KUKA", "kuka.svg"),
  B("B&R Automation", "b-and-r.png", "/brands/b-and-r"),
  B("AMK", "amk.png", "/brands/amk"),
  B("Elau", "elau.png", "/brands/elau"),
  B("Berger Lahr", "berger-lahr.png", "/brands/berger-lahr"),
  B("Pacific Scientific", "pacific-scientific.png", "/brands/pacific-scientific"),
  B("Sanyo Denki", "sanyo-denki.png", "/brands/sanyo-denki"),
  B("Elmo Motion Control", "elmo-motion-control.png", "/brands/elmo-motion-control"),
  B("Copley Controls", "copley-controls.png", "/brands/copley-controls"),
  B("Advanced Motion Controls", "advanced-motion-controls.png", "/brands/advanced-motion-controls"),
  B("Aerotech", "aerotech.png", "/brands/aerotech"),
];

const ROW_2: Brand[] = [
  B("Bosch", "bosch.webp"),
  B("Rockwell Automation", "rockwell.svg", "/brands/allen-bradley"),
  B("Control Techniques", "control-techniques.svg"),
  B("Baumüller", "baumuller.svg"),
  B("Beckhoff", "beckhoff.svg"),
  B("Eaton", "eaton.svg"),
  B("Acu-Rite"),
  B("Danfoss", "danfoss.svg"),
  B("Delta", "delta.svg"),
  B("Emerson", "emerson.svg"),
  B("Benshaw"),
  B("Fuji Electric", "fuji-electric.svg"),
  B("GE", "ge.svg"),
  B("Hitachi", "hitachi.svg"),
  B("Honeywell", "honeywell.svg"),
  B("KEB", "keb.svg"),
  B("Mazak", "mazak.svg"),
  B("Nidec", "nidec.svg"),
  B("Okuma", "okuma.svg"),
  B("TECO", "teco.svg"),
  B("Toshiba", "toshiba.svg"),
  B("Yokogawa", "yokogawa.svg"),
  B("NUM", "num.png", "/brands/num"),
  B("GE Fanuc", "ge-fanuc.png", "/brands/ge-fanuc"),
  B("Haas", "haas.png", "/brands/haas"),
  B("Fadal", "fadal.png", "/brands/fadal"),
  B("HSD", "hsd.png", "/brands/hsd"),
  B("Hengstler", "hengstler.png", "/brands/hengstler"),
  B("Kübler", "kubler.png", "/brands/kubler"),
  B("Dynapar", "dynapar.png", "/brands/dynapar"),
  B("BEI Kimco", "bei-kimco.png", "/brands/bei-kimco"),
  B("Bonfiglioli", "bonfiglioli.png", "/brands/bonfiglioli"),
];

function Row({ brands, reverse = false }: { brands: Brand[]; reverse?: boolean }) {
  return (
    <div className={`logo-track flex w-max items-center ${reverse ? "logo-track-rev" : ""}`}>
      {[...brands, ...brands].map((b, i) => {
        const dup = i >= brands.length;
        return (
          <Link
            key={i}
            href={b.href ?? ALL}
            aria-hidden={dup}
            tabIndex={dup ? -1 : 0}
            title={b.name}
            className="group mx-2 flex h-20 w-44 shrink-0 items-center justify-center rounded-lg px-4 transition hover:bg-[#F3F4F6] sm:mx-3 sm:w-48"
          >
            {b.logo ? (
              <span className="relative block h-11 w-full transition duration-300 group-hover:scale-110">
                <Image src={b.logo} alt={dup ? "" : `${b.name} logo`} fill unoptimized sizes="160px" className="object-contain" />
              </span>
            ) : (
              <span className="whitespace-nowrap font-display text-xl font-extrabold uppercase tracking-wide text-ink/80 transition duration-300 group-hover:scale-110 group-hover:text-brand">
                {b.name}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default function BrandLogos() {
  return (
    <section aria-label="Brands we repair" className={`${brandFont.className} relative overflow-hidden border-b border-line bg-white py-8`}>
      <p className="mb-4 text-center font-display text-xs font-bold uppercase tracking-[0.25em] text-ink/50">
        Siemens, Bosch Rexroth Indramat, Allen-Bradley and FANUC, plus <span className="text-brand">40+ more manufacturers</span> — current models and discontinued units
      </p>
      <div className="logo-marquee relative space-y-2">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
        <Row brands={ROW_1} />
        <Row brands={ROW_2} reverse />
      </div>
    </section>
  );
}
