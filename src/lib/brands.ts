/* ------------------------------------------------------------------ */
/*  Brand repair pages. One entry = one page at /brands/<slug>.         */
/*  Confirmed facts only. Series lists = typical units; edit freely.   */
/* ------------------------------------------------------------------ */

export type Group = "drives" | "motors" | "cnc" | "controls" | "robots";
/* Manufacturer logos in /public/brands, by brand slug. Brands without one show their initials. */
const LOGOS: Record<string, string> = {
  siemens: "siemens.svg", "rexroth-indramat": "bosch-rexroth.svg", "allen-bradley": "allen-bradley.svg", fanuc: "fanuc.svg",
  yaskawa: "yaskawa.svg", mitsubishi: "mitsubishi-electric.svg", abb: "abb.svg", schneider: "schneider.webp", kollmorgen: "kollmorgen.png",
  beckhoff: "beckhoff.svg", parker: "parker.svg", lenze: "lenze.svg", "sew-eurodrive": "sew-eurodrive.svg", omron: "omron.svg",
  baldor: "baldor.svg", danfoss: "danfoss.svg", delta: "delta.svg", "fuji-electric": "fuji-electric.svg", hitachi: "hitachi.svg",
  aeg: "aeg.svg", toshiba: "toshiba.svg", keb: "keb.svg", "control-techniques": "control-techniques.svg", emerson: "emerson.svg",
  eaton: "eaton.svg", bosch: "bosch.webp", baumuller: "baumuller.svg", magnetek: "magnetek.svg", festo: "festo.svg",
  "leroy-somer": "leroy-somer.svg", heidenhain: "heidenhain.svg", panasonic: "panasonic.svg", "oriental-motor": "oriental-motor.svg",
  okuma: "okuma.svg", mazak: "mazak.svg", fagor: "fagor.svg", beijer: "beijer.svg", "phoenix-contact": "phoenix-contact.svg",
  honeywell: "honeywell.svg", yokogawa: "yokogawa.svg", idec: "idec.svg", kuka: "kuka.svg", kawasaki: "kawasaki.svg",
  keba: "keba.svg", teco: "teco.svg", renishaw: "renishaw.svg", wago: "wago.svg", hurco: "hurco.svg",
  moog: "moog.svg", bachmann: "bachmann.svg", "invertek-drives": "invertek-drives.svg", "reliance-electric": "reliance-electric.svg",
  sick: "sick.svg", "sieb-meyer": "sieb-meyer.svg",
};
/** Logo path for a brand, or undefined to show initials. */
export const brandLogo = (slug: string) => (LOGOS[slug] ? `/brands/${LOGOS[slug]}` : undefined);

export const groups: { key: Group; label: string }[] = [
  { key: "drives", label: "Drives & motion" },
  { key: "motors", label: "Motors & feedback" },
  { key: "cnc", label: "CNC & machine tools" },
  { key: "controls", label: "Controls, process & HMIs" },
  { key: "robots", label: "Robots" },
];

export type BrandLine = { t: string; series: string[]; service: string };
export type Brand = {
  slug: string;
  name: string;
  initials: string;
  color: string;
  card: string; // one line for cards
  intro: string;
  categories: string[]; // service slugs this brand actually makes
  lines: BrandLine[];
  faultLibrary?: { label: string; href: string; codes: { code: string; href: string }[]; more?: { label: string; href: string }[] };
  faqs?: { q: string; a: string }[];
  core?: boolean; // one of our main specialties
  group?: Group;
  makes?: string; // own wording for what the brand makes, when the standard words don't fit
};

const code = (b: string, s: string, c: string) => ({ code: c, href: `/fault-codes/${b}/${s}/${c.toLowerCase().replace(/\./g, "-")}` });

/* Plain-English list of what a brand makes, e.g. "HMIs, circuit boards and exchange units" */
const catWord: Record<string, string> = {
  "servo-drive-repair": "servo drives", "vfd-repair": "VFDs", "servo-motor-repair": "servo motors",
  "industrial-motor-repair": "spindle, AC and DC motors", "encoder-repair": "encoders", "plc-repair": "PLCs", "hmi-repair": "HMIs",
  "cnc-repair": "CNC controls", "power-supply-repair": "power supplies", "controller-card-repair": "circuit boards",
  "robotics-repair": "robots", exchange: "",
};
const makesOf = (categories: string[]) => {
  const w = categories.map((c) => catWord[c]).filter(Boolean);
  return w.length > 1 ? `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}` : w[0] ?? "";
};
export const brandMakes = (b: Brand) => b.makes ?? makesOf(b.categories);

/* Short brand page: intro written from what the brand makes */
function mk(slug: string, name: string, initials: string, color: string, group: Group, card: string, categories: string[], lines: BrandLine[]): Brand {
  const b: Brand = { slug, name, initials, color, group, card, categories, lines, intro: "" };
  b.intro = `We repair ${name} ${makesOf(categories)} at component level at our Mississauga, Ontario repair centre, including discontinued models.`;
  return b;
}

/* Own wording for what a brand makes */
function makes(b: Brand, words: string): Brand {
  b.makes = words;
  return b;
}

/* Adds a verified ownership/history line to a short page */
function note(b: Brand, line: string, replace = false): Brand {
  b.intro = replace ? line : `${b.intro} ${line}`;
  return b;
}

export const brands: Brand[] = [
  {
    slug: "siemens", categories: ["servo-drive-repair", "vfd-repair", "servo-motor-repair", "industrial-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "cnc-repair", "power-supply-repair", "controller-card-repair", "exchange"],
    name: "Siemens",
    initials: "S",
    color: "#D91C38",
    core: true,
    card: "SINAMICS drives, SIMODRIVE, SINUMERIK, 1FK7 motors",
    intro:
      "Siemens motion control is IAR’s core specialty. We repair SINAMICS and SIMODRIVE drives, 1FT5, 1FT6, 1FT7, 1FK6, 1FK7 and 1PH motors, SINUMERIK 840C and 840D controls, SIMATIC PLCs and panels and SITOP power supplies — and test them on working systems, including our own SINUMERIK 840D test setup.",
    lines: [
      { t: "Servo & AC drives", series: ["SINAMICS S120", "SIMODRIVE 611", "SINAMICS G120", "MICROMASTER", "SINAMICS V90"], service: "servo-drive-repair" },
      { t: "Servo & spindle motors", series: ["1FK7", "1FT6 / 1FT7", "1PH7 / 1PH8"], service: "servo-motor-repair" },
      { t: "CNC controls", series: ["SINUMERIK 840C", "SINUMERIK 840D", "SINUMERIK 810D", "SINUMERIK 828D"], service: "cnc-repair" },
      { t: "PLCs", series: ["SIMATIC S5", "S7-300", "S7-400", "S7-1200 / 1500"], service: "plc-repair" },
      { t: "HMIs & panels", series: ["SIMATIC MP", "SIMATIC TP", "SIMATIC OP"], service: "hmi-repair" },
      { t: "Power supplies & line modules", series: ["SITOP", "SINAMICS line modules", "611 supply modules"], service: "power-supply-repair" },
    ],
    faultLibrary: {
      label: "SINAMICS S120 fault codes",
      href: "/fault-codes/siemens/sinamics-s120",
      more: [{ label: "SIMODRIVE 611U fault codes", href: "/fault-codes/siemens/simodrive-611u" }, { label: "SINAMICS S210 fault codes", href: "/fault-codes/siemens/sinamics-s210" }],
      codes: ["F30001", "F30002", "F30003", "F30004", "F30005", "F30021", "F31885"].map((c) => code("siemens", "sinamics-s120", c)),
    },
    faqs: [
      { q: "Do you repair SINAMICS S120 drives?", a: "Yes. We repair SINAMICS S120 motor modules, line modules and control units at component level, and test them under power on our test benches." },
      { q: "Do you repair older Siemens equipment like the SIMODRIVE 611 or SINUMERIK 840C?", a: "Yes. We repair discontinued Siemens drives and controls, so proven machines keep running after Siemens stops support." },
      { q: "How long does a Siemens repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote. Exchange units usually ship within 1–2 business days of receiving your unit." },
      { q: "What warranty comes with a Siemens repair?", a: "Every repair comes with a 1-year warranty and a test report." },
    ],
  },
  {
    slug: "rexroth-indramat", categories: ["servo-drive-repair", "vfd-repair", "servo-motor-repair", "industrial-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "cnc-repair", "power-supply-repair", "controller-card-repair", "exchange"],
    name: "Rexroth Indramat",
    initials: "RI",
    color: "#E8354F",
    core: true,
    card: "IndraDrive, EcoDrive DKC, DIAX, MKD / MSK motors",
    intro:
      "IAR provides Indramat servo motor repair for legacy equipment, along with Bosch Rexroth drives and power supplies. Our work covers fault diagnosis, mechanical repair, winding assessment and feedback testing on MKD, MAC and MDD motors, DKC, DDS and IndraDrive drives, with the repair scope confirmed for each model.",
    lines: [
      { t: "Servo drives", series: ["EcoDrive DKC", "IndraDrive", "DIAX03 / DIAX04", "DDS / System 200"], service: "servo-drive-repair" },
      { t: "Servo motors", series: ["MKD", "MSK", "MAC", "MHD"], service: "servo-motor-repair" },
      { t: "Spindle motors", series: ["MAD", "MAF", "2AD"], service: "industrial-motor-repair" },
      { t: "Supply modules", series: ["HVE", "HVR", "KDV"], service: "power-supply-repair" },
      { t: "Controls", series: ["IndraControl", "CLC / PPC controls"], service: "cnc-repair" },
    ],
    faultLibrary: {
      label: "Indramat EcoDrive DKC fault codes",
      href: "/fault-codes/indramat/ecodrive-dkc",
      codes: [code("indramat", "ecodrive-dkc", "F860")],
    },
    faqs: [
      { q: "Do you repair obsolete Indramat drives?", a: "Yes. We repair discontinued Indramat drives such as DKC, DIAX and DDS units at component level." },
      { q: "Do you repair Indramat MKD motors?", a: "Yes. We repair MKD, MSK and MAC servo motors, including bearings, brakes, windings and feedback, with encoder alignment." },
      { q: "How long does an Indramat repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "What warranty comes with an Indramat repair?", a: "Every repair comes with a 1-year warranty and a test report." },
    ],
  },
  {
    slug: "allen-bradley", categories: ["servo-drive-repair", "vfd-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"],
    name: "Allen-Bradley",
    initials: "AB",
    color: "#FB7185",
    core: true,
    card: "Kinetix, PowerFlex, PanelView, SLC 500, ControlLogix",
    intro:
      "Allen-Bradley and Rockwell Automation motion systems are one of IAR’s core specialties. As experienced servo motor rebuilders, we repair and test Allen-Bradley servo motors from legacy 1326AB models to current MPL and MPF series, plus Kinetix, Ultra and 1394 drives, PanelView terminals and SLC 500 hardware.",
    lines: [
      { t: "Servo drives", series: ["Kinetix 6000", "Kinetix 5500", "Kinetix 2000", "Ultra 3000"], service: "servo-drive-repair" },
      { t: "AC drives", series: ["PowerFlex 40", "PowerFlex 525", "PowerFlex 700", "PowerFlex 753"], service: "vfd-repair" },
      { t: "Servo motors", series: ["MPL", "VPL", "TL Series"], service: "servo-motor-repair" },
      { t: "PLCs", series: ["SLC 500", "PLC-5", "ControlLogix", "CompactLogix"], service: "plc-repair" },
      { t: "HMIs", series: ["PanelView Plus", "PanelView Standard", "PanelView Component"], service: "hmi-repair" },
    ],
    faultLibrary: {
      label: "Kinetix 6000 fault codes",
      href: "/fault-codes/allen-bradley/kinetix-6000",
      more: [{ label: "PowerFlex 525 fault codes", href: "/fault-codes/allen-bradley/powerflex-525" }],
      codes: [code("allen-bradley", "kinetix-6000", "E05")],
    },
    faqs: [
      { q: "Do you repair Kinetix servo drives?", a: "Yes. We repair Kinetix servo drives at component level and test them with a motor on our test benches." },
      { q: "Do you repair PowerFlex drives?", a: "Yes. We repair PowerFlex AC drives, including power stage, DC bus and control board faults." },
      { q: "Do you repair obsolete Allen-Bradley PLCs?", a: "Yes. We repair discontinued platforms such as PLC-5 and SLC 500." },
      { q: "What warranty comes with an Allen-Bradley repair?", a: "Every repair comes with a 1-year warranty and a test report." },
    ],
  },
  {
    slug: "fanuc", categories: ["servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "encoder-repair", "cnc-repair", "power-supply-repair", "controller-card-repair", "robotics-repair", "exchange"],
    name: "Fanuc",
    initials: "F",
    color: "#FBBF24",
    core: true,
    card: "αi / βi amplifiers, spindle motors, CNC controls, robots",
    intro:
      "IAR repairs FANUC servo motors, spindle motors, CNC controls and robot teach pendants, and handles FANUC drive repair for alpha i and beta i amplifiers and power supplies. Our technicians refurbish and load test FANUC equipment to factory specification so it installs and runs exactly as it should.",
    lines: [
      { t: "Servo & spindle amplifiers", series: ["αi SVM", "αi SPM", "βi SVSP", "βi SVU"], service: "servo-drive-repair" },
      { t: "Power supply modules", series: ["αi PSM"], service: "power-supply-repair" },
      { t: "Servo & spindle motors", series: ["αi servo motors", "βi servo motors", "αi spindle motors"], service: "servo-motor-repair" },
      { t: "Pulsecoders", series: ["αi pulsecoders", "βi pulsecoders"], service: "encoder-repair" },
      { t: "CNC controls", series: ["Series 0i", "16i / 18i / 21i", "30i / 31i"], service: "cnc-repair" },
      { t: "Robots", series: ["R-30iA", "R-30iB", "iPendant"], service: "robotics-repair" },
    ],
    faultLibrary: {
      label: "Fanuc αi alarm codes",
      href: "/fault-codes/fanuc/alpha-i",
      codes: [code("fanuc", "alpha-i", "SV0449"), code("fanuc", "alpha-i", "SP9012")],
    },
    faqs: [
      { q: "Do you repair Fanuc αi amplifiers?", a: "Yes. We repair αi servo, spindle and power supply modules at component level and test them under power." },
      { q: "Do you repair Fanuc pulsecoders?", a: "Yes. We repair and replace pulsecoders and align them to the motor." },
      { q: "How long does a Fanuc repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "What warranty comes with a Fanuc repair?", a: "Every repair comes with a 1-year warranty and a test report." },
    ],
  },
  {
    slug: "yaskawa", categories: ["servo-drive-repair", "vfd-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "robotics-repair", "plc-repair", "cnc-repair", "exchange"],
    name: "Yaskawa",
    initials: "Y",
    color: "#A78BFA",
    core: true,
    card: "SERVOPACK drives, Sigma motors, A1000 / GA700 inverters",
    intro:
      "We repair Yaskawa Sigma SERVOPACK servo drives and servo motors, A1000, V1000 and GA700 inverters and Motoman robot controllers at component level, with a free evaluation and a 1-year warranty.",
    lines: [
      { t: "Servo drives", series: ["Sigma-II SGDH", "Sigma-5 SGDV", "Sigma-7 SGD7S"], service: "servo-drive-repair" },
      { t: "Servo motors", series: ["SGMAH", "SGMGH", "SGM7"], service: "servo-motor-repair" },
      { t: "AC drives", series: ["A1000", "V1000", "GA700"], service: "vfd-repair" },
      { t: "Robots", series: ["Motoman DX100", "YRC1000"], service: "robotics-repair" },
      { t: "Yasnac CNC controls", series: ["Yasnac MX3 / LX3", "Yasnac i80", "Yasnac J100", "JANCD boards"], service: "cnc-repair" },
    ],
    faultLibrary: {
      label: "Yaskawa SGDH alarm codes",
      href: "/fault-codes/yaskawa/sigma-ii-sgdh",
      codes: [code("yaskawa", "sigma-ii-sgdh", "A.10"), code("yaskawa", "sigma-ii-sgdh", "A.C9")],
    },
    faqs: [
      { q: "Do you repair Yaskawa SERVOPACK drives?", a: "Yes. We repair Sigma-II, Sigma-5 and Sigma-7 SERVOPACKs at component level and test them with a motor." },
      { q: "How long does a Yaskawa repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "What warranty comes with a Yaskawa repair?", a: "Every repair comes with a 1-year warranty and a test report." },
    ],
  },
  {
    slug: "mitsubishi", group: "drives", categories: ["servo-drive-repair", "vfd-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "cnc-repair", "power-supply-repair", "controller-card-repair", "robotics-repair", "exchange"], name: "Mitsubishi Electric", initials: "ME", color: "#F472B6",
    card: "MR-J amplifiers, FR inverters, MELSEC PLCs, GOT HMIs",
    intro: "We repair Mitsubishi Electric MR-J servo amplifiers, HF and HG servo motors, FR inverters, MELSEC PLCs, GOT HMIs and CNC controls at component level.",
    lines: [
      { t: "Servo amplifiers", series: ["MR-J2S", "MR-J3", "MR-J4"], service: "servo-drive-repair" },
      { t: "Servo motors", series: ["HF", "HG", "HC"], service: "servo-motor-repair" },
      { t: "AC drives", series: ["FR-A700", "FR-A800", "FR-E700"], service: "vfd-repair" },
      { t: "PLCs & HMIs", series: ["MELSEC", "GOT"], service: "plc-repair" },
    ],
  },
  {
    slug: "abb", group: "drives", categories: ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "plc-repair", "power-supply-repair", "controller-card-repair", "robotics-repair", "hmi-repair", "exchange"], name: "ABB", initials: "ABB", color: "#F87171",
    card: "ACS and DCS drives, motors, robot controllers",
    intro:
      "When an ABB robot axis or drive fails, the whole cell stops. IAR provides ABB robot motor repair, axis drive module repair and ACS and DCS drive repair, confirming the repair scope and test method for each model before work begins.",
    lines: [
      { t: "AC drives", series: ["ACS355", "ACS550", "ACS800", "ACS880"], service: "vfd-repair" },
      { t: "DC drives", series: ["DCS400", "DCS800"], service: "vfd-repair" },
      { t: "Servo drives", series: ["MicroFlex"], service: "servo-drive-repair" },
      { t: "Robots", series: ["IRC5", "FlexPendant"], service: "robotics-repair" },
    ],
  },
  {
    slug: "schneider", group: "drives", categories: ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], name: "Schneider Electric", initials: "SE", color: "#34D399",
    card: "Altivar drives, Lexium servos, Modicon PLCs",
    intro: "We repair Schneider Electric Altivar drives, Lexium servo drives and motors, Modicon PLCs and Magelis HMIs at component level.",
    lines: [
      { t: "AC drives", series: ["Altivar 312", "Altivar 71", "Altivar 630"], service: "vfd-repair" },
      { t: "Servo drives & motors", series: ["Lexium 32", "Lexium 05", "BMH / BSH motors"], service: "servo-drive-repair" },
      { t: "PLCs & HMIs", series: ["Modicon", "Magelis"], service: "plc-repair" },
    ],
  },
  {
    slug: "kollmorgen", group: "drives", categories: ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], name: "Kollmorgen", initials: "K", color: "#2DD4BF",
    card: "AKD drives, AKM and Goldline motors",
    intro: "We repair Kollmorgen AKD and S700 servo drives and AKM and Goldline servo motors at component level, with encoder alignment on every motor.",
    lines: [
      { t: "Servo drives", series: ["AKD", "S700", "S300", "ServoStar"], service: "servo-drive-repair" },
      { t: "Servo motors", series: ["AKM", "Goldline", "Cartridge DDR"], service: "servo-motor-repair" },
    ],
  },
  {
    slug: "beckhoff", group: "controls", categories: ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], name: "Beckhoff", initials: "B", color: "#FB923C",
    card: "AX5000 drives, AM servo motors, CX controllers",
    intro: "We repair Beckhoff AX5000 servo drives, AM servo motors, CX embedded controllers and panel PCs at component level.",
    lines: [
      { t: "Servo drives", series: ["AX5000", "AX2000"], service: "servo-drive-repair" },
      { t: "Servo motors", series: ["AM8000", "AM3000"], service: "servo-motor-repair" },
      { t: "Controllers & panels", series: ["CX series", "CP panel PCs"], service: "controller-card-repair" },
    ],
  },
  {
    slug: "parker", group: "drives", categories: ["servo-drive-repair", "vfd-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], name: "Parker", initials: "P", color: "#F28797",
    card: "Compax3, 590+ DC drives, AC890",
    intro: "We repair Parker (formerly SSD / Eurotherm) Compax3 servo drives, 590+ DC drives and AC690 / AC890 drives at component level.",
    lines: [
      { t: "Servo drives", series: ["Compax3", "SLVD"], service: "servo-drive-repair" },
      { t: "DC & AC drives", series: ["590+", "514C", "AC690", "AC890"], service: "vfd-repair" },
      { t: "SSD / Eurotherm legacy drives", series: ["590 / 590P", "591", "512C", "620 Vector", "650 / 650V", "631 / 635 servo"], service: "vfd-repair" },
    ],
  },
  {
    slug: "moog", group: "drives", categories: ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], name: "Moog", initials: "M", color: "#A3E635",
    card: "Servo drives, servo motors",
    intro: "We repair Moog servo drives and servo motors at component level, with encoder and resolver alignment on every motor.",
    lines: [
      { t: "Servo drives", series: ["DS2000", "DS2100", "MSD"], service: "servo-drive-repair" },
      { t: "Servo motors", series: ["FAS", "G400 series"], service: "servo-motor-repair" },
    ],
  },
  {
    slug: "lenze", group: "drives", categories: ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "encoder-repair", "controller-card-repair", "plc-repair", "hmi-repair", "exchange"], name: "Lenze", initials: "L", color: "#FF5A6E",
    card: "9400 and 8200 inverters, servo motors",
    intro: "We repair Lenze 9400, 9300, 8400 and 8200 drives and Lenze servo motors at component level.",
    lines: [
      { t: "Servo & AC drives", series: ["9400", "9300", "8400", "8200 vector"], service: "vfd-repair" },
      { t: "Motors", series: ["MCS servo motors", "MDFQA"], service: "servo-motor-repair" },
    ],
  },
  {
    slug: "sew-eurodrive", group: "drives", categories: ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "encoder-repair", "controller-card-repair", "plc-repair", "exchange"], name: "SEW-Eurodrive", initials: "SEW", color: "#F59E0B",
    card: "MOVIDRIVE, MOVITRAC, gearmotors",
    intro: "We repair SEW-Eurodrive MOVIDRIVE and MOVITRAC drives, MOVIMOT units and servo and gearmotors at component level.",
    lines: [
      { t: "Drives", series: ["MOVIDRIVE B", "MOVITRAC", "MOVIMOT"], service: "vfd-repair" },
      { t: "Motors", series: ["CMP servo motors", "DR gearmotors"], service: "industrial-motor-repair" },
    ],
  },
  {
    slug: "omron", group: "controls", categories: ["servo-drive-repair", "vfd-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "robotics-repair", "exchange"], name: "Omron", initials: "O", color: "#E879F9",
    card: "G5 servos, Sysmac PLCs, NS HMIs",
    intro: "We repair Omron G5 and 1S servo drives, MX2 inverters, Sysmac and CJ PLCs and NS HMIs at component level.",
    lines: [
      { t: "Servo drives & inverters", series: ["G5 / Accurax", "1S", "MX2"], service: "servo-drive-repair" },
      { t: "PLCs & HMIs", series: ["Sysmac NJ", "CJ / CS", "NS HMIs"], service: "plc-repair" },
    ],
  },
  {
    slug: "baldor", group: "motors", categories: ["industrial-motor-repair", "servo-motor-repair", "vfd-repair", "servo-drive-repair", "encoder-repair", "controller-card-repair", "exchange"], name: "Baldor", initials: "B", color: "#4ADE80",
    card: "AC and DC motors, BSM servo motors, drives",
    intro: "We repair Baldor AC and DC motors, BSM servo motors and Baldor drives at component level, including rewinding.",
    lines: [
      { t: "Motors", series: ["AC induction", "DC motors", "BSM servo motors"], service: "industrial-motor-repair" },
      { t: "Drives", series: ["MicroFlex", "H2 / VS1 drives"], service: "vfd-repair" },
    ],
  },
  {
    slug: "pro-face", group: "controls", categories: ["hmi-repair", "controller-card-repair", "exchange"], name: "Pro-face", initials: "PF", color: "#C084FC",
    card: "GP HMIs and operator panels",
    intro: "We repair Pro-face GP and GP-Pro HMIs and operator panels, including touchscreens, displays, backlights and boards.",
    lines: [{ t: "HMIs", series: ["GP3000", "GP4000", "GP2000"], service: "hmi-repair" }],
  },

  /* ---- more brands (short pages) ---- */
  mk("danfoss", "Danfoss", "D", "#D91C38", "drives", "VLT and VACON drives", ["vfd-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["VLT FC 302", "VLT FC 202", "VLT Micro"], service: "vfd-repair" }, { t: "VACON drives", series: ["VACON NXS / NXP", "VACON NXL", "VACON 10 / 20", "VACON 100", "VACON CX"], service: "vfd-repair" }]),
  mk("delta", "Delta Electronics", "DE", "#E8354F", "drives", "VFD drives, ASDA servos, PLCs, HMIs", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["VFD-E", "VFD-C2000", "VFD-M"], service: "vfd-repair" }, { t: "Servo drives & motors", series: ["ASDA-A2", "ASDA-B2", "ECMA motors"], service: "servo-drive-repair" }, { t: "PLCs & HMIs", series: ["DVP PLCs", "DOP HMIs"], service: "plc-repair" }]),
  mk("fuji-electric", "Fuji Electric", "FE", "#A78BFA", "drives", "FRENIC drives, ALPHA servos", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["FRENIC-MEGA", "FRENIC-Multi", "FRENIC-Eco"], service: "vfd-repair" }, { t: "Servo systems", series: ["ALPHA5", "ALPHA7"], service: "servo-drive-repair" }]),
  mk("hitachi", "Hitachi", "H", "#34D399", "drives", "SJ and WJ inverters, PLCs", ["vfd-repair", "servo-drive-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["SJ700", "SJ-P1", "WJ200"], service: "vfd-repair" }, { t: "PLCs", series: ["EH-150", "MICRO-EH"], service: "plc-repair" }]),
  mk("aeg", "AEG", "AEG", "#F87171", "controls", "Modicon PLCs, Multiverter and Thyrovert drives", ["plc-repair", "vfd-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "PLCs", series: ["Modicon A120", "Modicon A250", "Modicon Micro"], service: "plc-repair" }, { t: "Drives", series: ["Multiverter", "Thyrovert"], service: "vfd-repair" }, { t: "Power supplies & boards", series: ["Power supplies", "Control boards"], service: "power-supply-repair" }]),
  mk("gettys", "Gettys", "G", "#FB923C", "motors", "DC servo motors, SCR servo drives, spindle amplifiers", ["servo-motor-repair", "servo-drive-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "DC servo motors", series: ["M-Series permanent magnet DC servo motors"], service: "servo-motor-repair" }, { t: "Servo drives & amplifiers", series: ["SCR servo drives", "Spindle amplifiers"], service: "servo-drive-repair" }]),
  mk("toshiba", "Toshiba", "T", "#FBBF24", "drives", "VF-S and AS3 drives, motors", ["vfd-repair", "industrial-motor-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["VF-S15", "VF-AS3", "VF-nC3"], service: "vfd-repair" }, { t: "Motors", series: ["EQP Global motors"], service: "industrial-motor-repair" }]),
  mk("weg", "WEG", "W", "#FB7185", "drives", "CFW drives, industrial motors", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["CFW500", "CFW11", "CFW700"], service: "vfd-repair" }, { t: "Motors", series: ["W22", "SWA servo motors"], service: "industrial-motor-repair" }]),
  mk("keb", "KEB", "K", "#2DD4BF", "drives", "COMBIVERT drives, servo motors", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "Drives", series: ["COMBIVERT F5", "COMBIVERT F6", "COMBIVERT S6"], service: "vfd-repair" }]),
  mk("control-techniques", "Nidec / Control Techniques", "CT", "#F28797", "drives", "Unidrive, Commander, Digitax drives", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "Drives", series: ["Unidrive SP", "Unidrive M", "Commander SK", "Digitax ST"], service: "vfd-repair" }, { t: "Servo motors", series: ["Unimotor fm", "Unimotor hd"], service: "servo-motor-repair" }]),
  mk("emerson", "Emerson", "E", "#FB923C", "drives", "Drives, motion and process controls", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "Drives & motion", series: ["Emerson EZMotion", "Emerson MX / FX"], service: "servo-drive-repair" }]),
  mk("eaton", "Eaton", "EA", "#A3E635", "drives", "PowerXL drives, PLCs, HMIs, power", ["vfd-repair", "plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["PowerXL DG1", "PowerXL DC1", "SVX9000"], service: "vfd-repair" }, { t: "Controls", series: ["XC PLCs", "XV HMIs", "easyE4"], service: "plc-repair" }]),
  mk("bosch", "Bosch", "B", "#F472B6", "drives", "Servo drives, controls and motors", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "cnc-repair", "controller-card-repair", "exchange"], [{ t: "Drives & controls", series: ["Bosch servodyn", "Bosch CNC Typ 3 / 520"], service: "servo-drive-repair" }]),
  mk("baumuller", "Baumüller", "BA", "#FF5A6E", "drives", "b maXX drives, servo motors", ["servo-drive-repair", "vfd-repair", "servo-motor-repair", "industrial-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "Drives", series: ["b maXX 2400", "b maXX 3300", "b maXX 4400"], service: "servo-drive-repair" }, { t: "Motors", series: ["DS / DSD servo motors", "DA motors"], service: "servo-motor-repair" }]),
  mk("stober", "Stöber", "ST", "#D91C38", "drives", "POSIDRIVE / SD6 drives, servo motors", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "Drives", series: ["SD6", "SC6", "POSIDRIVE MDS 5000"], service: "servo-drive-repair" }, { t: "Servo motors", series: ["EZ series", "ED / EK"], service: "servo-motor-repair" }]),
  mk("num", "NUM", "N", "#E8354F", "cnc", "Flexium CNC, NUMDrive", ["servo-drive-repair", "servo-motor-repair", "cnc-repair", "controller-card-repair", "exchange"], [{ t: "CNC & drives", series: ["Flexium+", "NUM 1060", "NUMDrive X"], service: "cnc-repair" }]),
  mk("pacific-scientific", "Pacific Scientific", "PS", "#A78BFA", "drives", "SC servo drives, motors", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "Servo drives & motors", series: ["SC900", "SC750", "PMA motors"], service: "servo-drive-repair" }]),
  mk("servotronix", "Servotronix", "SX", "#34D399", "drives", "CDHD servo drives", ["servo-drive-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "Servo drives", series: ["CDHD", "CDHD2"], service: "servo-drive-repair" }]),
  mk("magnetek", "Magnetek", "MG", "#FBBF24", "drives", "Crane and hoist drives", ["vfd-repair", "controller-card-repair", "exchange"], [{ t: "Crane & hoist drives", series: ["IMPULSE G+", "IMPULSE VG+", "Quattro DC elevator drives"], service: "vfd-repair" }]),
  mk("festo", "Festo", "FS", "#FB7185", "drives", "CMMT servo drives, motion controllers", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "Servo drives & motors", series: ["CMMT-AS", "CMMP-AS", "EMMT motors"], service: "servo-drive-repair" }, { t: "Controllers", series: ["CPX", "CECC"], service: "plc-repair" }]),
  mk("b-and-r", "B&R Automation", "BR", "#2DD4BF", "drives", "ACOPOS drives, X20 PLCs, panels", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "Servo drives", series: ["ACOPOS", "ACOPOSmulti", "ACOPOS P3"], service: "servo-drive-repair" }, { t: "Controls & HMIs", series: ["X20 PLCs", "Power Panel", "Automation PC"], service: "plc-repair" }]),
  mk("reliance-electric", "Reliance Electric", "RE", "#F28797", "motors", "DC motors, FlexPak and GV drives", ["industrial-motor-repair", "vfd-repair", "controller-card-repair", "exchange"], [{ t: "Motors", series: ["Reliance DC motors", "AC motors"], service: "industrial-motor-repair" }, { t: "Drives", series: ["FlexPak 3000", "GV3000", "MaxPak"], service: "vfd-repair" }]),
  mk("leroy-somer", "Leroy-Somer", "LS", "#FB923C", "motors", "Industrial motors, drives", ["industrial-motor-repair", "vfd-repair", "controller-card-repair", "exchange"], [{ t: "Motors & drives", series: ["LSES / PLS motors", "Powerdrive"], service: "industrial-motor-repair" }]),
  mk("heidenhain", "Heidenhain", "HE", "#A3E635", "cnc", "TNC controls, encoders, motors", ["cnc-repair", "encoder-repair", "servo-motor-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "CNC controls", series: ["TNC 426 / 430", "iTNC 530", "TNC 640"], service: "cnc-repair" }, { t: "Encoders", series: ["EQN", "ECN", "ERN"], service: "encoder-repair" }, { t: "Motors & power", series: ["QSY motors", "UV / UE supply units"], service: "servo-motor-repair" }]),
  mk("sanyo-denki", "Sanyo Denki", "SD", "#F472B6", "motors", "SANMOTION servos and motors", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "Servo systems", series: ["SANMOTION R", "SANMOTION G", "Q series"], service: "servo-motor-repair" }]),
  mk("panasonic", "Panasonic", "PA", "#FF5A6E", "motors", "MINAS servo drives and motors", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "Servo systems", series: ["MINAS A5", "MINAS A6", "MINAS A4"], service: "servo-drive-repair" }]),
  mk("oriental-motor", "Oriental Motor", "OM", "#D91C38", "motors", "Stepper, AC and brushless motors", ["servo-motor-repair", "industrial-motor-repair", "servo-drive-repair", "controller-card-repair", "exchange"], [{ t: "Motors & drivers", series: ["AlphaStep AZ", "BLE brushless", "Vexta steppers"], service: "servo-motor-repair" }]),
  mk("tamagawa", "Tamagawa", "TG", "#E8354F", "motors", "Encoders, resolvers, servo motors", ["encoder-repair", "servo-motor-repair", "exchange"], [{ t: "Feedback", series: ["Smartcoder", "Singlsyn resolvers"], service: "encoder-repair" }]),
  mk("sick", "SICK", "SK", "#A78BFA", "motors", "Encoders, motor feedback, safety", ["encoder-repair", "controller-card-repair", "exchange"], [{ t: "Encoders & feedback", series: ["Stegmann SRS / SRM", "Stegmann SKS / SKM36", "Stegmann DG60", "DFS60", "Hiperface DSL"], service: "encoder-repair" }]),
  mk("okuma", "Okuma", "OK", "#34D399", "cnc", "OSP controls, spindle and servo drives", ["cnc-repair", "servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "CNC controls", series: ["OSP-P300", "OSP-P200", "OSP-U100"], service: "cnc-repair" }, { t: "Drives", series: ["MIV / MIII servo", "VAC spindle"], service: "servo-drive-repair" }]),
  mk("mazak", "Mazak", "MZ", "#FBBF24", "cnc", "Mazatrol controls, drives, motors", ["cnc-repair", "servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "power-supply-repair", "hmi-repair", "controller-card-repair", "exchange"], [{ t: "CNC controls", series: ["Mazatrol SmoothX", "Mazatrol Matrix", "Mazatrol Fusion 640"], service: "cnc-repair" }]),
  mk("haas", "Haas", "HA", "#FB7185", "cnc", "Haas CNC controls, drives, boards", ["cnc-repair", "servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "CNC & boards", series: ["Haas control boards", "Haas vector drives", "Haas servo motors"], service: "cnc-repair" }]),
  mk("fagor", "Fagor", "FA", "#2DD4BF", "cnc", "Fagor CNC, drives, motors", ["cnc-repair", "servo-drive-repair", "servo-motor-repair", "encoder-repair", "controller-card-repair", "exchange"], [{ t: "CNC & drives", series: ["CNC 8055", "CNC 8070", "AXD / SPD drives"], service: "cnc-repair" }]),
  mk("ge-fanuc", "GE Fanuc / Emerson PAC", "GE", "#F28797", "controls", "Series 90-30, RX3i PLCs, QuickPanel", ["plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "PLCs", series: ["Series 90-30", "Series 90-70", "PACSystems RX3i", "VersaMax"], service: "plc-repair" }, { t: "HMIs", series: ["QuickPanel"], service: "hmi-repair" }]),
  mk("beijer", "Beijer Electronics", "BE", "#FB923C", "controls", "iX and X2 HMIs", ["hmi-repair", "controller-card-repair", "exchange"], [{ t: "HMIs", series: ["X2 series", "iX panels", "E1000"], service: "hmi-repair" }]),
  mk("phoenix-contact", "Phoenix Contact", "PC", "#A3E635", "controls", "QUINT power supplies, PLCs", ["power-supply-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "Power & control", series: ["QUINT power", "TRIO power", "PLCnext / ILC"], service: "power-supply-repair" }]),
  mk("pilz", "Pilz", "PZ", "#F472B6", "controls", "PNOZ safety relays, PSS controllers", ["plc-repair", "controller-card-repair", "exchange"], [{ t: "Safety controls", series: ["PNOZ", "PNOZmulti", "PSS 4000"], service: "plc-repair" }]),
  mk("honeywell", "Honeywell", "HW", "#FF5A6E", "controls", "Process controllers and I/O", ["plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "Process controls", series: ["Experion", "C200 / C300", "UDC controllers"], service: "plc-repair" }]),
  mk("yokogawa", "Yokogawa", "YO", "#D91C38", "controls", "Process controllers and recorders", ["plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "Process controls", series: ["CENTUM", "STARDOM", "UT controllers"], service: "plc-repair" }]),
  mk("idec", "IDEC", "ID", "#E8354F", "controls", "PLCs, HMIs, relays", ["plc-repair", "hmi-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "PLCs & HMIs", series: ["FC6A MicroSmart", "HG HMIs", "PS5R power supplies"], service: "plc-repair" }]),
  mk("advantech", "Advantech", "AD", "#A78BFA", "controls", "Industrial PCs and panel PCs", ["hmi-repair", "controller-card-repair", "power-supply-repair", "exchange"], [{ t: "Industrial computers", series: ["Panel PCs", "IPC chassis", "ADAM I/O"], service: "hmi-repair" }]),
  mk("kuka", "KUKA", "KU", "#34D399", "robots", "KR C robot controllers, smartPAD", ["robotics-repair", "servo-drive-repair", "servo-motor-repair", "controller-card-repair", "power-supply-repair", "exchange"], [{ t: "Robot controls", series: ["KR C2", "KR C4", "smartPAD"], service: "robotics-repair" }, { t: "Robot drives & motors", series: ["KSD / KPP", "KUKA servo motors"], service: "servo-motor-repair" }]),
  mk("kawasaki", "Kawasaki Robotics", "KW", "#FBBF24", "robots", "E / F controllers, teach pendants", ["robotics-repair", "servo-motor-repair", "controller-card-repair", "power-supply-repair", "exchange"], [{ t: "Robot controls", series: ["E controller", "F controller", "Teach pendants"], service: "robotics-repair" }]),
  mk("nachi", "Nachi", "NA", "#FB7185", "robots", "FD / AX controllers, teach pendants", ["robotics-repair", "servo-motor-repair", "controller-card-repair", "power-supply-repair", "exchange"], [{ t: "Robot controls", series: ["FD11", "AX21", "Teach pendants"], service: "robotics-repair" }]),
  /* ---- added brands ---- */
  note(mk("elau", "Elau", "EL", "#D91C38", "drives", "PacDrive C400/C600, MC-4, MAX-4, SH motors", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "PacDrive controllers", series: ["PacDrive C200", "PacDrive C400", "PacDrive C600", "PacDrive M"], service: "plc-repair" }, { t: "Servo drives", series: ["MC-4", "MAX-4", "Lexium 62 (successor)"], service: "servo-drive-repair" }, { t: "Servo motors", series: ["SH070", "SH100"], service: "servo-motor-repair" }]), "Elau is now part of Schneider Electric, and its PacDrive line continues as PacDrive 3 and Lexium 62."),
  note(mk("amk", "AMK / AMKmotion", "AMK", "#E8354F", "drives", "KE/KW drives, iX/iC, DT/DD/DV motors, iDT5", ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "Servo drives", series: ["KE / KW modular drives", "iX / iC decentralized drives"], service: "servo-drive-repair" }, { t: "Servo motors", series: ["DT / DP", "DYNASYN", "DD", "DV / DH / DW", "iDT5"], service: "servo-motor-repair" }, { t: "Controllers", series: ["A series", "AS / iSA"], service: "plc-repair" }]), "AMK Arnold Müller now trades as AMKmotion."),
  note(mk("elmo-motion-control", "Elmo Motion Control", "EMC", "#A78BFA", "drives", "Gold Twitter/Lion, Platinum, Titanium, Maestro", ["servo-drive-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "Servo drives", series: ["Gold Twitter", "Gold Lion", "Platinum", "Titanium"], service: "servo-drive-repair" }, { t: "Motion controllers", series: ["Gold Maestro", "Platinum Maestro", "Titanium Maestro"], service: "plc-repair" }]), "Elmo has been a Bosch Rexroth company since 2022."),
  mk("sieb-meyer", "SIEB & MEYER", "SM", "#34D399", "drives", "SD2/SD2S, SD3, SD4 spindle drives, CNC 95.00", ["servo-drive-repair", "vfd-repair", "cnc-repair", "controller-card-repair", "exchange"], [{ t: "Spindle & servo drives", series: ["SD2 / SD2S / SD2M", "SD3 servo amplifiers", "SD4S / SD4M / SD4B"], service: "servo-drive-repair" }, { t: "CNC controls", series: ["CNC 95.00"], service: "cnc-repair" }]),
  mk("inovance", "Inovance", "IN", "#FBBF24", "drives", "MD290/MD500, SV660, IS620, H3U/H5U PLCs, IT6000", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "encoder-repair", "plc-repair", "hmi-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["MD200", "MD290", "MD310", "MD500-PLUS", "MD520"], service: "vfd-repair" }, { t: "Servo drives & motors", series: ["IS620N", "SV630", "SV660 / SV670", "SV680", "MS1 motors"], service: "servo-drive-repair" }, { t: "PLCs", series: ["H1U / H3U", "H5U", "AM600", "AM300 / AM500"], service: "plc-repair" }, { t: "HMIs", series: ["IT6000", "IT7000"], service: "hmi-repair" }]),
  note(mk("keba", "KEBA", "KE", "#FB7185", "controls", "KeControl C5, KeTop pendants, KeDrive D3, ServoOne", ["plc-repair", "hmi-repair", "servo-drive-repair", "servo-motor-repair", "controller-card-repair", "exchange"], [{ t: "Controllers", series: ["KeControl C5", "KeControl C1", "KeConnect C5 I/O"], service: "plc-repair" }, { t: "HMIs & pendants", series: ["KeTop T15x", "KeTop handhelds"], service: "hmi-repair" }, { t: "Servo drives & motors", series: ["KeDrive D3", "KeDrive D5", "ServoOne", "KeDrive DMS2 motors"], service: "servo-drive-repair" }]), "KEBA took over LTI Motion (formerly LUST) in 2018."),
  note(mk("lust-lti", "LUST / LTI Motion", "LT", "#2DD4BF", "drives", "CDA3000, CDD3000, CDE/CDS, ServoOne, VF1000", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "controller-card-repair", "exchange"], [{ t: "Inverters", series: ["CDA3000", "CDD3000", "CDE / CDS", "VF1000 (VF1202 / VF1402)"], service: "vfd-repair" }, { t: "Servo drives", series: ["ServoOne (SO22)"], service: "servo-drive-repair" }]), "LUST became LTI Motion and has been part of KEBA since 2018."),
  note(mk("berger-lahr", "Berger Lahr", "BL", "#F28797", "drives", "WDP3/WDM3, Twin Line TLC, SD3, VRDM motors", ["servo-drive-repair", "servo-motor-repair", "controller-card-repair", "exchange"], [{ t: "Stepper & servo drives", series: ["WDP3", "WDM3", "SD3 (SD326 / SD328)", "Twin Line TLC532"], service: "servo-drive-repair" }, { t: "Motors", series: ["VRDM stepper motors", "DSM servo motors"], service: "servo-motor-repair" }]), "Berger Lahr is now part of Schneider Electric, with its products in the Lexium range."),
  mk("sprint-electric", "Sprint Electric", "SE", "#FB923C", "drives", "PL/X, PLXD and JL/X DC drives", ["vfd-repair", "controller-card-repair", "exchange"], [{ t: "DC drives", series: ["PL / PLX", "PLXD stack controller", "PLA module"], service: "vfd-repair" }, { t: "Slip-ring motor drives", series: ["JL/X", "JL/XHD"], service: "vfd-repair" }]),
  mk("advanced-motion-controls", "Advanced Motion Controls", "AMC", "#A3E635", "drives", "AxCent analog, DigiFlex Performance, FlexPro", ["servo-drive-repair", "controller-card-repair", "exchange"], [{ t: "Servo drives", series: ["AxCent analog", "DigiFlex Performance", "FlexPro"], service: "servo-drive-repair" }]),
  mk("copley-controls", "Copley Controls", "CC", "#F472B6", "drives", "Xenus, Accelnet, Accelus, Junus, Stepnet", ["servo-drive-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "Digital servo drives", series: ["Xenus / Xenus Plus", "Accelnet / Accelnet Plus", "Stepnet", "Xenus XTL"], service: "servo-drive-repair" }, { t: "Analog & older drives", series: ["Accelus", "Junus", "7225 DC servo amps"], service: "servo-drive-repair" }, { t: "Power supplies", series: ["PST power supplies"], service: "power-supply-repair" }]),
  mk("aerotech", "Aerotech", "AE", "#FF5A6E", "drives", "Automation1, A3200, Ensemble, Soloist, Ndrive", ["servo-drive-repair", "cnc-repair", "controller-card-repair", "exchange"], [{ t: "Motion controllers", series: ["Automation1 iSMC", "A3200", "Ensemble", "U500 cards"], service: "cnc-repair" }, { t: "Servo drives", series: ["Automation1 XA4", "Soloist CP / HPe", "Ndrive HPe", "DR drive racks"], service: "servo-drive-repair" }]),
  mk("glentek", "Glentek", "GL", "#D91C38", "drives", "SMA, GA analog, Gamma, Alpha amps; GM motors", ["servo-drive-repair", "servo-motor-repair", "controller-card-repair", "exchange"], [{ t: "Servo amplifiers", series: ["SMA series", "GA analog series", "Gamma", "Alpha"], service: "servo-drive-repair" }, { t: "Servo motors", series: ["GM", "GMBM", "GMR"], service: "servo-motor-repair" }]),
  mk("bonfiglioli", "Bonfiglioli", "BF", "#E8354F", "drives", "Active Cube, Agile, Vectron drives; gearmotors", ["vfd-repair", "servo-drive-repair", "industrial-motor-repair", "servo-motor-repair", "controller-card-repair", "exchange"], [{ t: "Inverters", series: ["Active Cube", "Agile", "Vectron Active (ACT)", "S2U"], service: "vfd-repair" }, { t: "Gearmotors & motors", series: ["A / C / F gearmotors", "VF/W", "BN / BX motors", "BMD servo motors"], service: "industrial-motor-repair" }]),
  note(mk("invertek-drives", "Invertek Drives", "ID", "#A78BFA", "drives", "Optidrive E3, P2, Eco, Elevator, Plus 3GV", ["vfd-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["Optidrive E3", "Optidrive P2", "Optidrive Eco", "Optidrive Elevator", "Optidrive Plus 3GV"], service: "vfd-repair" }]), "Invertek has been part of Sumitomo Heavy Industries since 2019."),
  note(mk("ls-electric", "LS Electric", "LS", "#34D399", "drives", "iG5A, iS7, S100 drives, XGT PLCs, L7 servos", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "plc-repair", "hmi-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["iG5A", "iS7", "S100", "H100", "iS5 / iC5"], service: "vfd-repair" }, { t: "Servo systems", series: ["L7NH", "L7P", "L7C"], service: "servo-drive-repair" }, { t: "PLCs", series: ["XGT (XGK / XGI)", "XGB"], service: "plc-repair" }, { t: "HMIs", series: ["iXP", "eXP", "XGT Panel"], service: "hmi-repair" }]), "LS Electric was formerly LS Industrial Systems (LSIS) and LG Industrial Systems."),
  mk("teco", "TECO-Westinghouse", "TE", "#FBBF24", "drives", "E510, A510, F510 drives, JSD servos, motors", ["vfd-repair", "servo-drive-repair", "servo-motor-repair", "industrial-motor-repair", "controller-card-repair", "exchange"], [{ t: "AC drives", series: ["E510", "A510", "F510"], service: "vfd-repair" }, { t: "Servo drives", series: ["JSDG2S", "JSDAP", "JSDEP", "JSDE2"], service: "servo-drive-repair" }, { t: "Motors", series: ["TECO-Westinghouse AC motors"], service: "industrial-motor-repair" }]),
  mk("nord-drivesystems", "NORD Drivesystems", "NO", "#FB7185", "drives", "NORDAC SK 500E, SK 200E, SK 250E; gearmotors", ["vfd-repair", "industrial-motor-repair", "controller-card-repair", "exchange"], [{ t: "Frequency inverters", series: ["NORDAC PRO SK 500E", "NORDAC FLEX SK 200E", "NORDAC LINK SK 250E", "NORDAC BASE SK 180E"], service: "vfd-repair" }, { t: "Gearmotors", series: ["Helical gearmotors", "Bevel gearmotors", "Worm gearmotors"], service: "industrial-motor-repair" }]),
  makes(note(mk("baumer-hubner", "Baumer Hübner", "BH", "#2DD4BF", "motors", "Hübner DC tachos, HOG/POG heavy-duty encoders", ["encoder-repair", "exchange"], [{ t: "Tachogenerators", series: ["TDP0,2", "TDP0,09", "TDP13", "GT5 / GT7 / GT9"], service: "encoder-repair" }, { t: "Heavy-duty encoders", series: ["HOG 10", "HOG 86", "POG 10", "HMG 10 / PMG 10"], service: "encoder-repair" }]), "We repair Baumer Hübner DC tachogenerators and heavy-duty encoders at component level at our Mississauga, Ontario repair centre, including discontinued models. Hübner Berlin is now Baumer Hübner.", true), "DC tachogenerators and heavy-duty encoders"),
  mk("kubler", "Kübler", "KÜ", "#F28797", "motors", "Sendix encoders, Limes linear, Codix counters", ["encoder-repair", "controller-card-repair", "exchange"], [{ t: "Encoders", series: ["Sendix 5000", "Sendix 5020", "Sendix F58"], service: "encoder-repair" }, { t: "Linear measuring", series: ["Limes LI20", "Limes LI50"], service: "encoder-repair" }, { t: "Counters & displays", series: ["Codix 130", "Codix 560"], service: "controller-card-repair" }]),
  note(mk("hengstler", "Hengstler", "HG", "#FB923C", "motors", "ACURO encoders, counters and relays", ["encoder-repair", "controller-card-repair", "exchange"], [{ t: "Encoders", series: ["ACURO AC58", "Incremental encoders"], service: "encoder-repair" }, { t: "Counters", series: ["Electronic counters", "Mechanical counters"], service: "controller-card-repair" }]), "Hengstler is part of Hengstler-Dynapar."),
  note(mk("dynapar", "Dynapar", "DY", "#A3E635", "motors", "HS35R, AI25, NorthStar RIM Tach and SLIM Tach", ["encoder-repair", "exchange"], [{ t: "Encoders", series: ["HS35R", "HSD35", "HC25 / HA25", "AI25 absolute"], service: "encoder-repair" }, { t: "NorthStar heavy duty", series: ["RIM Tach RT8", "SLIM Tach ST56 / ST85", "HT85"], service: "encoder-repair" }, { t: "Legacy", series: ["HS35", "RIM Tach 8500", "Rotopulser"], service: "encoder-repair" }]), "Dynapar and NorthStar are part of Hengstler-Dynapar."),
  note(mk("bei-sensors", "BEI Sensors", "BEI", "#F472B6", "motors", "H20, H25 and HS35 optical encoders", ["encoder-repair", "exchange"], [{ t: "Encoders", series: ["H20", "H25", "HS35", "H25 absolute"], service: "encoder-repair" }]), "BEI Sensors is part of Sensata."),
  mk("renishaw", "Renishaw", "RN", "#FF5A6E", "motors", "RESOLUTE, TONiC, VIONiC, FORTiS encoders", ["encoder-repair", "exchange"], [{ t: "Absolute encoders", series: ["RESOLUTE", "EVOLUTE", "FORTiS"], service: "encoder-repair" }, { t: "Incremental encoders", series: ["TONiC", "VIONiC", "QUANTiC", "ATOM"], service: "encoder-repair" }]),
  note(mk("leine-linde", "Leine Linde", "LL", "#D91C38", "motors", "600 and 800 series heavy-duty encoders", ["encoder-repair", "exchange"], [{ t: "Encoders", series: ["500 series", "600 series", "800 series (865 Duo)", "1000 series"], service: "encoder-repair" }]), "Leine Linde is part of the HEIDENHAIN group."),
  mk("tr-electronic", "TR-Electronic", "TR", "#E8354F", "motors", "CEV58/CEV65 absolute encoders, LMC linear", ["encoder-repair", "exchange"], [{ t: "Rotary encoders", series: ["CEV58M", "CEH58M", "CEV65M", "CMV36M"], service: "encoder-repair" }, { t: "Linear encoders", series: ["LMC"], service: "encoder-repair" }]),
  makes(note(mk("bei-kimco", "BEI Kimco", "BK", "#A78BFA", "motors", "Voice coil actuators and brushless DC motors", ["servo-motor-repair", "exchange"], [{ t: "Actuators & motors", series: ["LA15-16 / LA16-16 voice coil actuators", "Brushless DC motors"], service: "servo-motor-repair" }]), "We repair BEI Kimco voice coil actuators and brushless DC motors at our Mississauga, Ontario repair centre. BEI Kimco is sold by Sensata.", true), "voice coil actuators and brushless DC motors"),
  mk("keyence", "Keyence", "KY", "#34D399", "controls", "KV PLCs, VT HMIs, SV servos, CV-X vision", ["plc-repair", "hmi-repair", "servo-drive-repair", "controller-card-repair", "exchange"], [{ t: "PLCs", series: ["KV-8000", "KV-7000", "KV-5500", "KV Nano"], service: "plc-repair" }, { t: "HMIs", series: ["VT5", "VT series"], service: "hmi-repair" }, { t: "Servo & vision", series: ["SV servo series", "CV-X vision", "XG-X vision"], service: "controller-card-repair" }]),
  mk("red-lion", "Red Lion", "RL", "#FBBF24", "controls", "G3, Graphite, CR3000 HMIs, PAX meters", ["hmi-repair", "controller-card-repair", "exchange"], [{ t: "HMIs", series: ["G3 / G3 Kadet", "Graphite", "CR3000", "CR1000"], service: "hmi-repair" }, { t: "Panel meters & displays", series: ["PAX", "CUB", "PM-50", "LD2 / LD4"], service: "controller-card-repair" }]),
  mk("weintek", "Weintek", "WT", "#FB7185", "controls", "MT8000, cMT and cMT X touchscreen HMIs", ["hmi-repair", "controller-card-repair", "exchange"], [{ t: "HMIs", series: ["MT6000", "MT8000iE", "MT8000iP", "cMT3000", "cMT X"], service: "hmi-repair" }]),
  mk("maple-systems", "Maple Systems", "MS", "#2DD4BF", "controls", "cMT and HMI5000 HMIs, OITs, HMC units", ["hmi-repair", "plc-repair", "controller-card-repair", "exchange"], [{ t: "HMIs", series: ["HMI5000", "HMI5056N / HMI5100T", "cMT series"], service: "hmi-repair" }, { t: "Operator terminals & combos", series: ["Alphanumeric OITs", "HMC HMI+PLC"], service: "plc-repair" }]),
  mk("unitronics", "Unitronics", "UN", "#F28797", "controls", "Vision, UniStream, Jazz PLC+HMIs, servo, VFDs", ["plc-repair", "hmi-repair", "servo-drive-repair", "vfd-repair", "controller-card-repair", "exchange"], [{ t: "PLC + HMI controllers", series: ["Vision", "UniStream", "Samba", "Jazz", "M91"], service: "plc-repair" }, { t: "Drives", series: ["Servo drives 3-B / 3-E", "UMI VFDs"], service: "servo-drive-repair" }]),
  mk("wago", "WAGO", "WA", "#FB923C", "controls", "750 I/O, PFC100/PFC200 and CC100 controllers", ["plc-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "Controllers & I/O", series: ["PFC100", "PFC200", "Compact Controller CC100", "750 / 753 I/O"], service: "plc-repair" }]),
  mk("bachmann", "Bachmann", "BC", "#A3E635", "controls", "M1 controllers: MC200, MH200, MX200 CPUs", ["plc-repair", "hmi-repair", "controller-card-repair", "exchange"], [{ t: "M1 controllers", series: ["MC200", "MH200", "MX200", "GIO / AIO I/O"], service: "plc-repair" }]),
  mk("bwo-elektronik", "BWO Elektronik", "BW", "#F472B6", "cnc", "System 900, CNC 902–905 controls, axis cards", ["cnc-repair", "power-supply-repair", "controller-card-repair", "exchange"], [{ t: "CNC controls", series: ["Control System 900", "CNC 902 / 903 / 904 / 905", "Vektor C / CT"], service: "cnc-repair" }, { t: "Panels & cards", series: ["CNC 910 / 920 / 930 panels", "AAZ / ASM axis cards", "NG8 / NG16 power supplies"], service: "controller-card-repair" }]),
  mk("fadal", "Fadal", "FD", "#FF5A6E", "cnc", "CNC 88, 88HS and 32MP controls, boards", ["cnc-repair", "servo-drive-repair", "controller-card-repair", "exchange"], [{ t: "CNC controls", series: ["CNC 88", "CNC 88HS", "32MP"], service: "cnc-repair" }, { t: "Boards & amplifiers", series: ["1400-series CPU boards", "Axis amplifiers"], service: "controller-card-repair" }]),
  mk("hurco", "Hurco", "HU", "#D91C38", "cnc", "UltiMax, MAX and WinMax CNC controls", ["cnc-repair", "hmi-repair", "controller-card-repair", "exchange"], [{ t: "CNC controls", series: ["UltiMax 2 / 3 / 4", "MAX", "MAX5", "WinMax"], service: "cnc-repair" }]),
  makes(note(mk("hsd", "HSD", "HSD", "#FB923C", "motors", "ES919, ES929, ES951 electrospindles, 2-axis heads", ["industrial-motor-repair", "servo-motor-repair", "controller-card-repair", "exchange"], [{ t: "Electrospindles (CNC router spindles)", series: ["ES919", "ES929", "ES779", "ES920", "ES884"], service: "industrial-motor-repair" }, { t: "Machining spindles", series: ["ES950", "ES951", "ES510", "ES368", "ES789"], service: "industrial-motor-repair" }, { t: "Heads & motors", series: ["HST610 / HST810 direct drive heads", "Boring heads", "Servomotors with integrated drive"], service: "servo-motor-repair" }]), "We repair HSD electrospindles, 2-axis and boring heads and HSD servomotors at our Mississauga, Ontario repair centre, including discontinued models. HSD is the Biesse Group's mechatronics company, based in Gradara, Italy.", true), "electrospindles, machining heads and servomotors"),
];

export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);
export const brandUrl = (slug: string) => `/brands/${slug}`;

/* Generic FAQ for brands without their own list (all confirmed facts) */
const an = (name: string) => (/^[AEIO]/i.test(name) ? "an" : "a");
export const brandFaqs = (name: string) => [
  { q: `Do you repair ${name} equipment?`, a: `Yes. We repair ${name} equipment at component level at our Mississauga, Ontario repair centre, with a free evaluation first.` },
  { q: `How long does ${an(name)} ${name} repair take?`, a: "Typical turnaround is 24–72 hours once you approve the quote. Exchange units usually ship within 1–2 business days of receiving your unit." },
  { q: `What warranty comes with ${an(name)} ${name} repair?`, a: "Every repair comes with a 1-year warranty and a test report." },
];

