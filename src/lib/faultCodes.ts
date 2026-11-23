import sinamics from "@/data/fault-codes/sinamics.json";
import fanuc from "@/data/fault-codes/fanuc.json";
import indramat from "@/data/fault-codes/indramat.json";
import kinetix from "@/data/fault-codes/kinetix.json";
import yaskawa from "@/data/fault-codes/yaskawa.json";
import powerflex525 from "@/data/fault-codes/powerflex525.json";
import simodrive611u from "@/data/fault-codes/simodrive611u.json";
import sinamicsS210 from "@/data/fault-codes/sinamics-s210.json";

export type FaultCode = {
  code: string;
  slug: string;
  type: string;
  name: string;
  area: string;
  also?: string;
  meaning?: string;
  symptoms?: string;
  causes?: string;
  checks?: string;
  repairable?: string;
  service?: string;
};

export type Family = {
  brand: string;
  brandSlug: string;
  initials: string;
  series: string;
  seriesSlug: string;
  short: string;
  equipment: string;
  intro: string;
  repairLabel: string;
  source: string;
  codes: FaultCode[];
};

/* ------------------------------------------------------------------ */
/*  One entry per drive family. Add new families here.                 */
/* ------------------------------------------------------------------ */
export const families: Family[] = [
  {
    brand: "Siemens",
    brandSlug: "siemens",
    initials: "S",
    series: "SINAMICS S120 / S150",
    seriesSlug: "sinamics-s120",
    short: "SINAMICS S120",
    equipment: "Servo drives, Motor Modules and Line Modules",
    intro:
      "SINAMICS S120 and S150 faults (F), alarms (A) and safety messages (C), with plain-English guides for the faults that most often mean a repair: power unit, infeed, motor and encoder faults.",
    repairLabel: "Motor Module or Line Module faulted?",
    source: "SINAMICS S120/S150 List Manual",
    codes: sinamics as FaultCode[],
  },
  {
    brand: "Siemens",
    brandSlug: "siemens",
    initials: "S",
    series: "SINAMICS S210",
    seriesSlug: "sinamics-s210",
    short: "SINAMICS S210",
    equipment: "S210 servo converters (1 AC and 3 AC) with 1FK2 servo motors",
    intro:
      "SINAMICS S210 faults (F) and alarms (A), with plain-English guides for the faults that most often mean a repair: overcurrent, DC link, overheating, brake and encoder faults on the converter and its 1FK2 motor.",
    repairLabel: "S210 converter or 1FK2 motor faulted?",
    source: "SINAMICS S210 servo drive system Operating Instructions (09/2019)",
    codes: sinamicsS210 as FaultCode[],
  },
  {
    brand: "Siemens",
    brandSlug: "siemens",
    initials: "S",
    series: "SIMODRIVE 611 universal (611U)",
    seriesSlug: "simodrive-611u",
    short: "SIMODRIVE 611U",
    equipment: "611U closed-loop control modules, power modules and supply modules",
    intro:
      "SIMODRIVE 611 universal fault numbers 001 to 757: control module, encoder, power section, PROFIBUS and positioning faults, with guides for the faults that most often mean a repair.",
    repairLabel: "SIMODRIVE 611U axis faulted?",
    source: "SIMODRIVE 611 universal Function Manual",
    codes: simodrive611u as FaultCode[],
  },
  {
    brand: "Fanuc",
    brandSlug: "fanuc",
    initials: "F",
    series: "αi PSM · SVM · SPM amplifiers",
    seriesSlug: "alpha-i",
    short: "Fanuc αi",
    equipment: "Servo amplifiers, spindle amplifiers and power supplies",
    intro:
      "Fanuc αi servo (SV) and spindle (SP) alarms for Series 30i, 31i, 32i and 0i-D, with the matching amplifier display code and the 16i / 18i / 21i / 0i alarm number.",
    repairLabel: "Fanuc amplifier showing an alarm?",
    source: "FANUC αi series Maintenance Manual",
    codes: fanuc as FaultCode[],
  },
  {
    brand: "Rexroth Indramat",
    brandSlug: "indramat",
    initials: "R",
    series: "ECODRIVE DKC x.1 / x.3",
    seriesSlug: "ecodrive-dkc",
    short: "Indramat DKC",
    equipment: "ECODRIVE servo drives",
    intro:
      "Rexroth Indramat ECODRIVE DKC x.1 and DKC x.3 (ECODRIVE03) fault (F), warning (E) and command error (C) messages, in one list.",
    repairLabel: "Indramat DKC drive faulted?",
    source: "ECODRIVE DKC and ECODRIVE03 diagnostic descriptions",
    codes: indramat as FaultCode[],
  },
  {
    brand: "Allen-Bradley",
    brandSlug: "allen-bradley",
    initials: "AB",
    series: "Kinetix 6000",
    seriesSlug: "kinetix-6000",
    short: "Kinetix 6000",
    equipment: "2094 IAM and AM servo drive modules",
    intro:
      "Allen-Bradley Kinetix 6000 seven-segment error codes (E00 to E95) with the matching Logix Designer fault message.",
    repairLabel: "Kinetix 6000 module faulted?",
    source: "Kinetix 6000 Multi-axis Servo Drives User Manual",
    codes: kinetix as FaultCode[],
  },
  {
    brand: "Allen-Bradley",
    brandSlug: "allen-bradley",
    initials: "AB",
    series: "PowerFlex 523 / 525",
    seriesSlug: "powerflex-525",
    short: "PowerFlex 525",
    equipment: "PowerFlex 520-series AC drives",
    intro:
      "PowerFlex 523 and 525 fault codes F002 to F127. Type 1 faults can reset automatically; Type 2 faults need a manual reset.",
    repairLabel: "PowerFlex drive faulted?",
    source: "PowerFlex 520-Series Adjustable Frequency AC Drive User Manual",
    codes: powerflex525 as FaultCode[],
  },
  {
    brand: "Yaskawa",
    brandSlug: "yaskawa",
    initials: "Y",
    series: "Sigma-II SGDH",
    seriesSlug: "sigma-ii-sgdh",
    short: "Yaskawa SGDH",
    equipment: "Sigma-II SGDH SERVOPACKs",
    intro: "Yaskawa Sigma-II SGDH SERVOPACK alarm (A.xx and CPF) and warning displays.",
    repairLabel: "SGDH SERVOPACK showing an alarm?",
    source: "Yaskawa SGDH SERVOPACK manual",
    codes: yaskawa as FaultCode[],
  },
];

export const familyUrl = (f: Family) => `/fault-codes/${f.brandSlug}/${f.seriesSlug}`;
export const codeUrl = (f: Family, c: FaultCode) => `${familyUrl(f)}/${c.slug}`;
export const hasGuide = (c: FaultCode) => Boolean(c.meaning);

export const getFamily = (brand: string, series: string) =>
  families.find((f) => f.brandSlug === brand && f.seriesSlug === series);

export const totalCodes = families.reduce((n, f) => n + f.codes.length, 0);
export const totalGuides = families.reduce((n, f) => n + f.codes.filter(hasGuide).length, 0);

/* "a; b; c." -> ["A", "B", "C"] */
export const toList = (s = "") =>
  s
    .split(/;\s*/)
    .map((x) => x.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1));

/* Guides that bring in the most repair work, shown as "most searched" */
const popular: [string, string][] = [
  ["sinamics-s120", "F30001"],
  ["alpha-i", "SV0449"],
  ["ecodrive-dkc", "F860"],
  ["kinetix-6000", "E05"],
  ["sigma-ii-sgdh", "A.10"],
  ["sinamics-s120", "F30021"],
  ["alpha-i", "SP9012"],
  ["sigma-ii-sgdh", "A.C9"],
  ["powerflex-525", "F012"],
  ["simodrive-611u", "504"],
  ["powerflex-525", "F013"],
  ["simodrive-611u", "613"],
];

export const popularEntries = () =>
  popular
    .map(([s, code]) => {
      const f = families.find((x) => x.seriesSlug === s)!;
      const c = f.codes.find((x) => x.code === code)!;
      return { f, c };
    })
    .filter((x) => x.c);
