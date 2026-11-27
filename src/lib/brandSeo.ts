/* ------------------------------------------------------------------ */
/*  SEO wording for the main brand pages (SEO Improvement Plan, Nov    */
/*  2026): page title, meta description, headline, intro and a short  */
/*  paragraph under each product line in "series we see most often".  */
/*  Brands not listed here use the standard wording in brands.ts.      */
/* ------------------------------------------------------------------ */

export type BrandSeo = {
  title: string;
  description: string;
  /** Headline: plain part, then the part shown in red */
  h1: [string, string];
  intro: string;
  /** Paragraph per product line, keyed by the line's title in brands.ts */
  lines?: Record<string, string>;
};

export const brandSeo: Record<string, BrandSeo> = {
  siemens: {
    title: "Siemens Servo Motor & Drive Repair | SINAMICS | IAR",
    description: "Siemens servo motor repair and Siemens drive repair: SINAMICS S120, SIMODRIVE 611, SINUMERIK 840D and 1FK7 motors. 1-year warranty.",
    h1: ["Siemens", "Servo Motor & Drive Repair"],
    intro: "We repair Siemens drives, motors and controls at component level in our Grand Island, NY repair center. Siemens servo motor repair, Siemens drive repair and SINUMERIK 840D repair are our core work, and every unit is tested on our own Siemens test benches, including a SINUMERIK 840D jig, before it ships.",
    lines: {
      "Servo & AC drives": "SINAMICS S120 repair covers motor modules, line modules and control units: we check the power stage, gate drivers and DC link, then run the module with a motor on our test bench. SIMODRIVE 611 repair covers 611D, 611U and 611A power modules, control cards and supply modules. These drives are discontinued, so repair is usually the fastest way to keep an older machine running.",
      "CNC controls": "SINUMERIK 840D repair and SINUMERIK 840C repair: NCU units, MMC and PCU operator panels and I/O. Every control is tested on our SINUMERIK 840D jig before it ships.",
    },
  },
  fanuc: {
    title: "FANUC Servo Motor, Amplifier & CNC Repair | IAR",
    description: "FANUC servo motor repair, FANUC amplifier repair and FANUC drive repair: αi and βi amplifiers, spindle motors and CNC controls.",
    h1: ["FANUC", "Servo Motor, Amplifier & CNC Repair"],
    intro: "We repair FANUC amplifiers, motors and controls for machine shops and plants across the USA. FANUC servo motor repair, FANUC amplifier repair, FANUC drive repair, FANUC spindle motor repair and FANUC CNC control repair all start with a free evaluation and end with a load test and a test report.",
    lines: {
      "Servo & spindle amplifiers": "FANUC amplifier repair for αi SVM servo and SPM spindle amplifiers and βi SVSP and SVU units. We load test every amplifier before it ships.",
      "Servo & spindle motors": "FANUC spindle motor repair for αi spindle motors, with bearing replacement and balancing, plus αi and βi servo motor repair.",
    },
  },
  "allen-bradley": {
    title: "Allen-Bradley Drive & Servo Motor Repair | Kinetix | IAR",
    description: "Allen-Bradley drive repair and Allen-Bradley servo motor repair: Kinetix, PowerFlex, MPL motors, SLC 500 PLCs and PanelView HMIs.",
    h1: ["Allen-Bradley", "Drive, Servo Motor & PLC Repair"],
    intro: "We repair Allen-Bradley drives, motors, PLCs and HMIs at component level. Allen-Bradley drive repair and Allen-Bradley servo motor repair cover Kinetix, Ultra and PowerFlex, and we also repair SLC 500 and ControlLogix modules and PanelView panels.",
    lines: {
      "Servo drives": "Kinetix drive repair for Kinetix 6000, 5500 and 2000 and Ultra 3000 drives. If your drive shows a fault code, look it up in our Kinetix 6000 fault code guide first.",
      "AC drives": "PowerFlex drive repair for PowerFlex 40, 525, 700 and 753 drives: power section, control board and I/O.",
      PLCs: "SLC 500 repair, plus ControlLogix and CompactLogix module repair: CPUs, I/O cards and power supplies.",
      HMIs: "PanelView repair for PanelView Plus, Standard and Component panels: touch screens, backlights and power boards.",
    },
  },
  "rexroth-indramat": {
    title: "Indramat Servo Drive & Motor Repair | DKC, IndraDrive | IAR",
    description: "Indramat servo drive repair and Indramat servo motor repair: DKC, IndraDrive and DIAX04 drives, MKD and MSK motors. 1-year warranty.",
    h1: ["Rexroth Indramat", "Servo Drive & Motor Repair"],
    intro: "Indramat is one of the brands we see most. Indramat servo drive repair and Indramat servo motor repair cover EcoDrive DKC, IndraDrive, DIAX03 and DIAX04 drives and MKD, MSK and MAC motors. We also handle Bosch Rexroth servo motor repair for current Rexroth models.",
    lines: {
      "Servo drives": "DKC drive repair for EcoDrive DKC01 to DKC03 drives, IndraDrive repair for HCS and HMS units, and Indramat DIAX04 repair for DDS drives. These are among the most common units on our bench.",
    },
  },
  yaskawa: {
    title: "Yaskawa Servopack & Servo Drive Repair | Sigma | IAR",
    description: "Yaskawa servo drive repair and Yaskawa Servopack repair: Sigma-II, Sigma-5 and Sigma-7 drives, SGM servo motors and A1000 drives.",
    h1: ["Yaskawa", "Servopack & Servo Motor Repair"],
    intro: "We repair Yaskawa drives, motors and robot controls. Yaskawa servo drive repair and Yaskawa Servopack repair cover Sigma-II SGDH, Sigma-5 SGDV and Sigma-7 SGD7S, and we repair SGMAH, SGMGH and SGM7 servo motors.",
    lines: {
      "Servo drives": "Yaskawa Servopack repair for SGDH, SGDV and SGD7S drives. Alarm codes such as A.10 and A.C9 are explained in our Yaskawa fault code guide.",
    },
  },
  mitsubishi: {
    title: "Mitsubishi Servo Amplifier Repair | MR-J4, MR-J3 | IAR",
    description: "Mitsubishi servo drive repair and Mitsubishi MR-J4 repair: MR-J3 and MR-J2S amplifiers, HF and HG motors, FR-A800 drives.",
    h1: ["Mitsubishi", "Servo Amplifier & Drive Repair"],
    intro: "We repair Mitsubishi Electric amplifiers, motors and drives. Mitsubishi servo drive repair covers the MR-J2S, MR-J3 and MR-J4 families, along with FR-A700 and FR-A800 drives and MELSEC PLCs.",
    lines: {
      "Servo amplifiers": "Mitsubishi MR-J4 repair for MR-J4-A and MR-J4-B amplifiers, plus MR-J3 and MR-J2S units.",
    },
  },
  abb: {
    title: "ABB Drive & Robot Motor Repair | ACS880, ACS800 | IAR",
    description: "ABB drive repair and ABB servo motor repair: ACS880, ACS800 and ACS355 drives, DCS800 DC drives and IRC5 robot motors.",
    h1: ["ABB", "Drive, Motor & Robot Repair"],
    intro: "We repair ABB AC and DC drives, servo drives and robot parts. ABB drive repair covers ACS355 through ABB ACS880 repair, and we handle ABB servo motor repair and ABB robot motor repair for IRC5 cells.",
    lines: {
      "AC drives": "ABB ACS880 repair and ACS800 repair: power modules, control boards and fans, tested under load.",
    },
  },
};

/** Paragraphs under product lines for brands that keep the standard page wording */
export const seriesNotes: Record<string, Record<string, string>> = {
  schneider: { "Servo drives & motors": "Lexium servo drive repair for Lexium 32 and Lexium 05 drives, plus BMH and BSH servo motors." },
  kollmorgen: { "Servo drives": "Kollmorgen AKD repair for AKD and S700 servo drives, plus S300 and ServoStar units." },
};

export const lineNote = (slug: string, line: string) => brandSeo[slug]?.lines?.[line] ?? seriesNotes[slug]?.[line];

/** Keyword headings for product-line cards in "series we see most often" (default: "<Brand> <line>") */
const lineHeads: Record<string, Record<string, string>> = {
  siemens: { "Servo & AC drives": "SINAMICS S120 Repair & SIMODRIVE 611 Repair", "CNC controls": "SINUMERIK 840D Repair & SINUMERIK 840C Repair" },
  fanuc: { "Servo & spindle amplifiers": "FANUC Amplifier Repair", "Servo & spindle motors": "FANUC Spindle Motor Repair & Servo Motors", "CNC controls": "FANUC CNC Control Repair" },
  "allen-bradley": { "Servo drives": "Kinetix Drive Repair", "AC drives": "PowerFlex Drive Repair", PLCs: "SLC 500 Repair & ControlLogix PLCs", HMIs: "PanelView Repair" },
  "rexroth-indramat": { "Servo drives": "DKC Drive Repair, IndraDrive Repair & Indramat DIAX04 Repair", "Servo motors": "Bosch Rexroth Servo Motor Repair: MKD, MSK, MAC" },
  yaskawa: { "Servo drives": "Yaskawa Servopack Repair", "Servo motors": "Yaskawa Servo Motor Repair" },
  mitsubishi: { "Servo amplifiers": "Mitsubishi MR-J4 Repair & MR-J3 Amplifiers", "Servo motors": "Mitsubishi Servo Motor Repair" },
  abb: { "AC drives": "ABB ACS880 Repair & ACS800 Drives", Robots: "ABB Robot Motor Repair & IRC5" },
  schneider: { "Servo drives & motors": "Lexium Servo Drive Repair" },
  kollmorgen: { "Servo drives": "Kollmorgen AKD Repair" },
};

export const lineHeading = (slug: string, line: string) => lineHeads[slug]?.[line];
