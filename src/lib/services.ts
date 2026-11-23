/* ------------------------------------------------------------------ */
/*  Repair service pages. One entry = one page at /services/<slug>.     */
/*  Only facts IAR has confirmed. No invented numbers.             */
/* ------------------------------------------------------------------ */

export type Fault = { symptom: string; cause: string; codes?: { code: string; href: string }[] };
export type Service = {
  slug: string;
  noun: string; // used in headings: "What we repair on a <noun>"
  title: string; // card + breadcrumb
  short: string; // card text
  icon: string; // photo path, or "" to use the lucide icon below
  lucide?: string;
  group?: string; // section on /services (main 12 have none)
  kind?: "repair" | "service" | "cable";
  facts?: string[];
  color: string; // card metal tint on /services
  h1: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  answerQ: string; // the question this page answers first (AEO)
  answer: string; // 40–70 words, quotable
  repairs?: { t: string; d: string }[];
  repairsTitle?: string;
  testingTitle?: string;
  faults?: Fault[];
  testing?: string[];
  brands?: { name: string; series: string[] }[];
  faqs?: { q: string; a: string }[];
  related?: string[];
};

const fc = (brand: string, series: string, code: string, slug = code.toLowerCase().replace(/\./g, "-")) => ({
  code,
  href: `/fault-codes/${brand}/${series}/${slug}`,
});

export const services: Service[] = [
  {
    slug: "servo-drive-repair",
    noun: "servo drive",
    title: "Servo Drive Repair",
    short: "Component-level servo drive and servo amplifier repair, tested with a motor under load.",
    icon: "/services/servo-drive.webp",
    color: "#E8354F",
    h1: "Servo Drive Repair",
    tagline: "Component-level servo amplifier repair from our Mississauga repair centre",
    metaTitle: "Servo Drive Repair | Siemens, Indramat, Kinetix, Fanuc | IAR",
    metaDescription:
      "Servo drive and servo amplifier repair at component level. IAR load tests every drive with a motor, ships a test report and backs it with a one-year warranty.",
    answerQ: "Can a servo drive be repaired?",
    answer:
      "Usually, yes. A failed servo drive can stop a machine as fast as a failed motor, and most drives are repairable at component level. We find why it failed, replace the faulty parts and test the drive with a motor under load. It ships back with a test report and our one-year warranty.",
    repairs: [
      { t: "Power stage & IGBTs", d: "Shorted IGBT and IPM modules, gate drivers and snubber parts replaced, then the stage is tested under power." },
      { t: "DC bus & capacitors", d: "Aged or leaking bus capacitors, pre-charge circuits and braking transistors." },
      { t: "Control & regulator boards", d: "Processor, memory and regulator board faults diagnosed and repaired at component level." },
      { t: "Feedback interface", d: "Encoder and resolver input circuits behind feedback, position and overspeed faults." },
      { t: "Internal power supply", d: "Switch-mode supplies that leave a drive dead, rebooting or with a blank display." },
      { t: "Communication & I/O", d: "Fieldbus, DRIVE-CLiQ, SERCOS and I/O interface faults." },
    ],
    faults: [
      {
        symptom: "Trips on overcurrent as soon as the axis is enabled",
        cause: "Shorted IGBT or IPM module, failed gate driver, or a damaged motor cable",
        codes: [fc("siemens", "sinamics-s120", "F30001"), fc("fanuc", "alpha-i", "SV0449"), fc("indramat", "ecodrive-dkc", "F860"), fc("allen-bradley", "kinetix-6000", "E05"), fc("yaskawa", "sigma-ii-sgdh", "A.10")],
      },
      {
        symptom: "DC bus overvoltage when the axis decelerates",
        cause: "Failed braking transistor or resistor circuit, or bus voltage sensing fault",
        codes: [fc("siemens", "sinamics-s120", "F30002")],
      },
      {
        symptom: "Undervoltage or pre-charge fault at power-up",
        cause: "Pre-charge circuit, bus capacitors or the incoming line supply",
        codes: [fc("siemens", "sinamics-s120", "F30003"), fc("siemens", "sinamics-s120", "F30027")],
      },
      {
        symptom: "Overtemperature or overload after running a while",
        cause: "Failed cooling fan, clogged heat sink or degraded power devices",
        codes: [fc("siemens", "sinamics-s120", "F30004"), fc("siemens", "sinamics-s120", "F30005")],
      },
      {
        symptom: "Encoder or feedback errors with a known-good motor",
        cause: "Damaged feedback input circuit or communication interface on the drive",
        codes: [fc("siemens", "sinamics-s120", "F31885"), fc("yaskawa", "sigma-ii-sgdh", "A.C9")],
      },
      { symptom: "No display, dead or rebooting", cause: "Internal switch-mode power supply or control board failure" },
    ],
    testing: [
      "Inspection and failure analysis when the drive arrives",
      "Written quote with cost and lead time before any work",
      "Run under power with a motor on our test benches",
      "Test report ships with every repaired drive",
    ],
    brands: [
      { name: "Siemens", series: ["SINAMICS S120", "SIMODRIVE 611", "SINAMICS V90"] },
      { name: "Rexroth Indramat", series: ["EcoDrive DKC", "IndraDrive", "DIAX04"] },
      { name: "Allen-Bradley", series: ["Kinetix 6000", "Kinetix 5500", "Ultra 3000"] },
      { name: "Fanuc", series: ["αi servo amplifiers", "βi servo amplifiers"] },
      { name: "Yaskawa", series: ["Sigma-II SGDH", "Sigma-5 SGDV", "Sigma-7"] },
      { name: "And more", series: ["Mitsubishi MR-J", "Kollmorgen", "Schneider Lexium", "Omron", "ABB"] },
    ],
    faqs: [
      { q: "How long does a servo drive repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote. Exchange units usually ship within 1–2 business days of receiving your unit." },
      { q: "Is the evaluation free?", a: "Yes. We power up and test the drive, find the root cause and send a written quote. No work starts without your approval." },
      { q: "How do you test a repaired servo drive?", a: "Every repaired drive is run under power with a motor on our test benches, and a test report ships with the unit." },
      { q: "Do you repair obsolete servo drives?", a: "Yes. We repair discontinued drives at component level, so proven machines keep running after the manufacturer stops support." },
      { q: "What warranty comes with the repair?", a: "Every servo drive repair comes with a 1-year warranty." },
    ],
    related: ["servo-motor-repair", "encoder-repair", "power-supply-repair", "exchange"],
  },
  {
    slug: "vfd-repair",
    noun: "VFD",
    title: "VFD & AC/DC Drive Repair",
    short: "VFD repair service for AC drives, inverters and DC drives — PowerFlex, ACS, Altivar and more.",
    icon: "/services/vfd-drive.webp",
    color: "#D91C38",
    h1: "VFD & AC/DC Drive Repair",
    tagline: "AC drive, VFD and DC drive repair at component level",
    metaTitle: "VFD & AC/DC Drive Repair | PowerFlex, ACS, Altivar | IAR",
    metaDescription:
      "VFD and AC drive repair, inverter repair and DC drive repair in Mississauga. Free evaluation, load tested, one-year warranty. Canada & USA.",
    answerQ: "Can a VFD be repaired?",
    answer:
      "Yes. Our VFD repair service covers power modules, DC bus capacitors, control boards and cooling on AC drives, plus analog and digital DC drives. Each drive is load tested before it leaves our bench and comes back with a test report and a one-year warranty.",
    repairs: [
      { t: "IGBT power stage", d: "Shorted IGBT modules, gate drivers and snubber components replaced and tested under power." },
      { t: "DC bus & capacitors", d: "Aged or bulging bus capacitors, pre-charge resistors and contactors, and braking circuits." },
      { t: "Rectifier input", d: "Input diode bridges, SCR front ends and line-side protection that fail after power surges." },
      { t: "Control boards", d: "Main control, keypad and I/O board faults diagnosed and repaired at component level." },
      { t: "DC drive armature & field", d: "Thyristor stacks, armature and field controllers and regulator cards on DC drives." },
      { t: "Cooling & sensing", d: "Cooling fans, heat sink sensors and current sensors that cause overtemperature and false trips." },
    ],
    faults: [
      { symptom: "Overcurrent trip on start or under load", cause: "Shorted IGBT, failed gate driver, current sensor fault or a motor or cable problem" },
      { symptom: "DC bus overvoltage during deceleration", cause: "Braking transistor or resistor failure, or bus voltage sensing fault" },
      { symptom: "Undervoltage or pre-charge fault at power-up", cause: "Pre-charge circuit, rectifier bridge or bus capacitors" },
      { symptom: "Overheat alarm after running a while", cause: "Failed cooling fan, blocked heat sink or degraded power devices" },
      { symptom: "Ground fault trip", cause: "Output stage leakage, current sensing fault, or motor insulation breakdown" },
      { symptom: "Dead drive, no keypad display", cause: "Internal switch-mode power supply or control board failure" },
    ],
    testing: [
      "Inspection and failure analysis when the drive arrives",
      "Root cause found before we quote",
      "Run under power on our test benches",
      "Test report ships with every repaired drive",
    ],
    brands: [
      { name: "Allen-Bradley", series: ["PowerFlex 40", "PowerFlex 525", "PowerFlex 700", "PowerFlex 753"] },
      { name: "ABB", series: ["ACS355", "ACS550", "ACS880", "DCS800"] },
      { name: "Siemens", series: ["SINAMICS G120", "MICROMASTER 440", "SIMOREG DC Master"] },
      { name: "Schneider Electric", series: ["Altivar 71", "Altivar 312", "Altivar 630"] },
      { name: "Yaskawa", series: ["A1000", "V1000", "GA700"] },
      { name: "And more", series: ["Danfoss VLT", "Mitsubishi FR", "Parker 590+", "Lenze", "Delta"] },
    ],
    faqs: [
      { q: "How long does a VFD repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote. Exchange units usually ship within 1–2 business days of receiving your unit." },
      { q: "Do you repair DC drives as well as AC drives?", a: "Yes. We repair DC drives, including thyristor stacks, armature and field controllers and regulator cards, as well as AC variable frequency drives." },
      { q: "Is it worth repairing a VFD instead of buying new?", a: "In most cases, yes. A component-level repair usually costs a fraction of a new drive, and you keep the same unit, so there is no rewiring or reprogramming." },
      { q: "Is the evaluation free?", a: "Yes. We test the drive, find the root cause and send a written quote. No work starts without your approval." },
      { q: "What warranty comes with a VFD repair?", a: "Every drive repair comes with a 1-year warranty." },
    ],
    related: ["servo-drive-repair", "power-supply-repair", "controller-card-repair", "industrial-motor-repair"],
  },
  {
    slug: "servo-motor-repair",
    noun: "servo motor",
    title: "Servo Motor Repair",
    short: "AC and DC servo motor repair and rebuilding — bearings, windings, brakes and feedback.",
    icon: "/services/servo-motor.webp",
    color: "#A78BFA",
    h1: "Servo Motor Repair",
    tagline: "Servo motor repair and rebuilding by experienced servo motor rebuilders",
    metaTitle: "Servo Motor Repair & Rebuilds | 1FK7, MKD, Fanuc αi | IAR",
    metaDescription:
      "AC and DC servo motor repair and rebuilding: bearings, windings, brakes and encoder alignment. Free evaluation, load tested, one-year warranty. Canada & USA.",
    answerQ: "Can a servo motor be repaired?",
    answer:
      "Yes. As experienced servo motor rebuilders we replace bearings and seals, test and rewind windings, rebuild brakes and align feedback to factory specification. Every motor finishes with a run test under load, a test report and a one-year warranty — usually far below the price of a new motor.",
    repairs: [
      { t: "Bearings & seals", d: "Worn or noisy bearings and leaking shaft seals replaced to stop vibration and contamination." },
      { t: "Holding brakes", d: "Brakes that drag, slip or will not release, repaired or replaced and tested." },
      { t: "Windings & insulation", d: "Shorted, grounded or open windings, insulation testing and rewinding where needed." },
      { t: "Encoder & resolver", d: "Feedback devices repaired or replaced, then aligned to the motor's commutation offset." },
      { t: "Shafts & keyways", d: "Damaged shafts, keyways and couplings repaired so the motor runs true." },
      { t: "Connectors & cables", d: "Power and feedback connectors and internal leads that cause intermittent faults." },
    ],
    faults: [
      { symptom: "Noise, vibration or heat while running", cause: "Worn bearings, shaft damage or a dragging brake" },
      { symptom: "Overcurrent or ground fault on the drive", cause: "Shorted or grounded winding, or a damaged power connector" },
      {
        symptom: "Encoder or feedback alarm",
        cause: "Failed encoder, contamination inside the motor or a damaged feedback connector",
        codes: [{ code: "F31885", href: "/fault-codes/siemens/sinamics-s120/f31885" }, { code: "A.C9", href: "/fault-codes/yaskawa/sigma-ii-sgdh/a-c9" }],
      },
      { symptom: "Axis jumps or runs rough after an encoder swap", cause: "Encoder not aligned to the commutation offset" },
      { symptom: "Brake will not release", cause: "Open brake coil, worn friction disc or a brake supply fault" },
      { symptom: "Oil or coolant inside the motor", cause: "Failed shaft seal or damaged housing" },
    ],
    testing: [
      "Photos and condition report when the motor arrives",
      "Insulation and winding checks before we quote",
      "Encoder aligned to the commutation offset",
      "Run under drive control on our test benches, with a test report",
    ],
    brands: [
      { name: "Siemens", series: ["1FK7", "1FT6", "1FT7", "1FK6"] },
      { name: "Rexroth Indramat", series: ["MKD", "MSK", "MAC", "MHD"] },
      { name: "Allen-Bradley", series: ["MPL", "VPL", "TL Series"] },
      { name: "Fanuc", series: ["αi servo motors", "βi servo motors"] },
      { name: "Yaskawa", series: ["SGMAH", "SGMGH", "Sigma-7 SGM7"] },
      { name: "And more", series: ["Kollmorgen AKM", "Mitsubishi HF / HG", "Bosch", "Baumüller"] },
    ],
    faqs: [
      { q: "Do you align the encoder after a servo motor repair?", a: "Yes. Every servo motor we repair gets its encoder aligned to the motor's commutation offset before testing." },
      { q: "How do you test a repaired servo motor?", a: "Every motor is run under drive control on our test benches, and a test report ships with the unit." },
      { q: "How long does a servo motor repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote. Exchange motors usually ship within 1–2 business days of receiving your unit." },
      { q: "Can you rewind a servo motor?", a: "Yes. We test the windings and insulation, and repair or rewind them when they are shorted, grounded or open." },
      { q: "What warranty comes with a servo motor repair?", a: "Every servo motor repair comes with a 1-year warranty." },
    ],
    related: ["encoder-repair", "servo-drive-repair", "industrial-motor-repair", "exchange"],
  },
  {
    slug: "industrial-motor-repair",
    noun: "motor",
    title: "Spindle, AC & DC Motor Repair",
    short: "CNC spindle motor repair, AC induction and DC motor repair and rewinding.",
    icon: "/services/spindle-ac-dc-motor.webp",
    color: "#34D399",
    h1: "Spindle, AC & DC Motor Repair",
    tagline: "Spindle motor repair and industrial motor winding repair",
    metaTitle: "Spindle Motor Repair & AC/DC Motor Repair | IAR",
    metaDescription:
      "Spindle motor repair, AC induction and DC motor repair and rewinding. Load tested in Mississauga with a one-year warranty. Canada & USA.",
    answerQ: "Can a spindle motor be repaired?",
    answer:
      "Yes. We repair CNC spindle motors, AC induction motors and DC motors — bearings, balancing, rewinding and commutator work — then run each motor under load. It ships back with a test report and our one-year warranty.",
    repairs: [
      { t: "Spindle bearings", d: "High-speed spindle motor bearings replaced to stop noise, heat and vibration." },
      { t: "Windings & rewinding", d: "Insulation testing, winding repair and full rewinds for AC and DC motors." },
      { t: "DC commutators & brushes", d: "Commutator turning, brush and brush-holder replacement and armature repair." },
      { t: "Spindle feedback", d: "Spindle encoders, magnetic sensors and thermistors that cause orientation and speed faults." },
      { t: "Cooling fans", d: "Blower motors and fan assemblies that let spindle and DC motors overheat." },
      { t: "Shafts & housings", d: "Shaft, keyway and bearing-fit repair so the motor runs true." },
    ],
    faults: [
      { symptom: "Spindle noise, heat or vibration at speed", cause: "Worn spindle bearings, imbalance or a failed cooling fan" },
      { symptom: "Spindle orientation or speed alarm", cause: "Failed spindle sensor, encoder or feedback cable" },
      { symptom: "Ground fault or overcurrent", cause: "Shorted or grounded winding, or insulation breakdown" },
      { symptom: "DC motor sparking or rough running", cause: "Worn brushes, damaged commutator or armature fault" },
      { symptom: "Motor overheats under normal load", cause: "Failed blower, blocked cooling or winding damage" },
    ],
    testing: [
      "Photos and condition report on arrival",
      "Insulation and winding checks before we quote",
      "Bearings and feedback checked after repair",
      "Tested before return, with a test report",
    ],
    brands: [
      { name: "Siemens", series: ["1PH7", "1PH8", "1PH4"] },
      { name: "Fanuc", series: ["αi spindle motors", "βi spindle motors"] },
      { name: "Rexroth Indramat", series: ["MAD", "MAF", "2AD"] },
      { name: "And more", series: ["Baldor", "WEG", "Reliance DC", "General Electric DC"] },
    ],
    faqs: [
      { q: "How long does a spindle motor repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote. Larger rewinds can take longer, and we confirm the timing in your written quote." },
      { q: "Do you repair DC motors?", a: "Yes. We repair DC motors, including commutators, brushes, armatures and field windings." },
      { q: "Is the evaluation free?", a: "Yes. We inspect and test the motor, find the root cause and send a written quote. No work starts without your approval." },
      { q: "What warranty comes with a motor repair?", a: "Every motor repair comes with a 1-year warranty." },
    ],
    related: ["servo-motor-repair", "cnc-repair", "vfd-repair", "encoder-repair"],
  },
  {
    slug: "encoder-repair",
    noun: "encoder",
    title: "Encoder Repair & Alignment",
    short: "Encoder and resolver repair, replacement and alignment to the motor's commutation.",
    icon: "/services/encoder.webp",
    color: "#FBBF24",
    h1: "Encoder Repair & Alignment",
    tagline: "Encoder repair, resolver repair and encoder alignment service",
    metaTitle: "Encoder Repair & Servo Encoder Alignment | IAR",
    metaDescription:
      "Servo motor encoder repair, resolver repair and encoder alignment to factory specification. Tested on the matching drive. Mississauga, Canada & USA.",
    answerQ: "Does a new servo encoder need to be aligned?",
    answer:
      "Yes. We repair or replace encoders and resolvers, then align them to the motor's commutation offset on the matching drive. A misaligned encoder causes position alarms and lost torque, so every motor is run and checked after alignment and covered by our one-year warranty.",
    repairs: [
      { t: "Absolute & incremental encoders", d: "Optical and magnetic encoders that give position errors, noise or no signal." },
      { t: "Resolvers", d: "Resolver windings and connections behind feedback and position faults." },
      { t: "Commutation alignment", d: "Encoder aligned to the motor's commutation offset after replacement or repair." },
      { t: "Serial & digital interfaces", d: "EnDat, DRIVE-CLiQ and other serial encoder communication faults." },
      { t: "Connectors & cables", d: "Feedback connectors and internal leads that cause intermittent alarms." },
      { t: "Contamination damage", d: "Encoders damaged by oil, coolant or dust that entered the motor." },
    ],
    faults: [
      {
        symptom: "Encoder communication error on the drive",
        cause: "Failed encoder electronics, damaged cable or a serial interface fault",
        codes: [{ code: "F31885", href: "/fault-codes/siemens/sinamics-s120/f31885" }, { code: "A.C9", href: "/fault-codes/yaskawa/sigma-ii-sgdh/a-c9" }],
      },
      { symptom: "Axis runs rough or jumps after an encoder change", cause: "Encoder not aligned to the commutation offset" },
      { symptom: "Overcurrent with a good drive and motor windings", cause: "Wrong commutation angle from a misaligned encoder" },
      { symptom: "Intermittent position or following errors", cause: "Contamination, failing optics or a loose connection" },
    ],
    testing: [
      "Encoder signals checked before we quote",
      "Aligned to the motor's commutation offset",
      "Run under drive control on our test benches",
      "Test report ships with every unit",
    ],
    brands: [
      { name: "Heidenhain", series: ["EQN", "ECN", "ERN"] },
      { name: "Siemens", series: ["DRIVE-CLiQ motor encoders", "1FK7 / 1FT7 encoders"] },
      { name: "Fanuc", series: ["αi pulsecoders", "βi pulsecoders"] },
      { name: "And more", series: ["Tamagawa", "SICK Stegmann", "Indramat motor feedback", "Yaskawa"] },
    ],
    faqs: [
      { q: "Can you align an encoder without the original machine?", a: "Yes. We align the encoder to the motor's commutation offset on our test benches, then run the motor under drive control to confirm it." },
      { q: "Do you repair resolvers?", a: "Yes. We repair resolvers and resolver connections as well as optical and magnetic encoders." },
      { q: "How long does encoder repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "What warranty comes with an encoder repair?", a: "Every encoder repair comes with a 1-year warranty." },
    ],
    related: ["servo-motor-repair", "servo-drive-repair", "industrial-motor-repair", "exchange"],
  },
  {
    slug: "plc-repair",
    noun: "PLC",
    title: "PLC Repair",
    short: "PLC repair service and PLC module repair for CPUs, I/O and communication cards.",
    icon: "/services/plc.webp",
    color: "#2DD4BF",
    h1: "PLC Repair",
    tagline: "PLC module repair for CPUs, I/O and communication cards",
    metaTitle: "PLC Repair | Siemens S7, SLC 500, ControlLogix | IAR",
    metaDescription:
      "PLC repair service for CPUs, I/O and communication modules — Siemens, Allen-Bradley, Omron and more. Free evaluation, one-year warranty. Mississauga.",
    answerQ: "Can a PLC be repaired?",
    answer:
      "Yes. We repair PLC CPUs, power supplies, I/O and communication modules at component level and test them on a working rack before they ship. Discontinued modules are often repairable when new ones are no longer sold, and every repair carries our one-year warranty.",
    repairs: [
      { t: "CPU modules", d: "Processor modules that fault, will not run or lose their program." },
      { t: "PLC power supplies", d: "Rack and module supplies that are dead, unstable or overheating." },
      { t: "Digital & analog I/O", d: "Dead channels, blown outputs and inaccurate analog inputs and outputs." },
      { t: "Communication modules", d: "Ethernet, PROFIBUS, DeviceNet, ControlNet and serial modules." },
      { t: "Backplanes & racks", d: "Chassis and backplane faults that cause modules to drop out." },
      { t: "Obsolete PLCs", d: "Discontinued platforms such as Siemens S5 and Allen-Bradley PLC-5 kept running." },
    ],
    faults: [
      { symptom: "CPU in fault or stop mode, will not run", cause: "Failed CPU components, memory or a supply problem" },
      { symptom: "Outputs stuck on or dead", cause: "Blown output transistors, triacs or relays" },
      { symptom: "Analog values drifting or wrong", cause: "Failed converter, reference or input protection" },
      { symptom: "Network or communication loss", cause: "Failed communication chipset, transceiver or connector" },
      { symptom: "Power supply LED off or flickering", cause: "Failed capacitors or switch-mode components" },
    ],
    testing: [
      "Photos and condition report on arrival",
      "Root cause found before we quote",
      "Powered up and function-tested on our bench",
      "Test report ships with every module",
    ],
    brands: [
      { name: "Siemens", series: ["SIMATIC S5", "S7-300", "S7-400", "S7-1200 / 1500"] },
      { name: "Allen-Bradley", series: ["SLC 500", "PLC-5", "ControlLogix", "CompactLogix"] },
      { name: "And more", series: ["Mitsubishi MELSEC", "Omron", "Schneider Modicon", "GE Fanuc 90-30"] },
    ],
    faqs: [
      { q: "Will I lose my PLC program?", a: "Keep a backup of your program before you ship any PLC CPU. We test the hardware, and you reload or confirm your program when the module is back." },
      { q: "Do you repair obsolete PLCs?", a: "Yes. We repair discontinued PLCs at component level, so proven machines keep running after the manufacturer stops support." },
      { q: "How long does PLC repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "What warranty comes with a PLC repair?", a: "Every PLC repair comes with a 1-year warranty." },
    ],
    related: ["hmi-repair", "controller-card-repair", "power-supply-repair", "cnc-repair"],
  },
  {
    slug: "hmi-repair",
    noun: "HMI",
    title: "HMI Repair",
    short: "HMI, touch screen and operator panel repair — touch, backlight, display and boot faults.",
    icon: "/services/hmi.webp",
    color: "#F28797",
    h1: "HMI Repair",
    tagline: "HMI repair, touch screen repair and operator panel repair",
    metaTitle: "HMI Repair | Touchscreen & Operator Panel Repair | IAR",
    metaDescription:
      "HMI repair, touch screen repair and operator panel repair: dead touch, dim backlights, cracked screens and boot faults. One-year warranty. Mississauga.",
    answerQ: "Can an HMI touchscreen be repaired?",
    answer:
      "Yes. We repair HMIs and operator panels with dead or drifting touch, dim or failed backlights, cracked screens and boot faults, keeping your program in place wherever the unit allows. Each panel is powered up and function-tested before it ships with our one-year warranty.",
    repairs: [
      { t: "Touchscreens", d: "Unresponsive, drifting or cracked touch panels replaced and calibrated." },
      { t: "LCD displays", d: "Lines, dead pixels, flicker or no image on the display." },
      { t: "Backlights", d: "Dim or dark screens from failed backlights and inverter boards." },
      { t: "Power boards", d: "Panels that will not power up, reboot or shut down by themselves." },
      { t: "Logic & memory boards", d: "Boot failures, frozen screens and corrupted startup." },
      { t: "Keypads & ports", d: "Membrane keypads, communication ports and USB connectors." },
    ],
    faults: [
      { symptom: "Touchscreen not responding or touching the wrong spot", cause: "Failed or worn touch panel, or controller fault" },
      { symptom: "Screen dark but the panel is running", cause: "Failed backlight or backlight inverter" },
      { symptom: "Lines, flicker or no image", cause: "Failed LCD, display cable or video circuit" },
      { symptom: "Panel will not boot or keeps restarting", cause: "Power supply, memory or logic board failure" },
    ],
    testing: [
      "Photos and condition report on arrival",
      "Root cause found before we quote",
      "Powered up and touch, display and ports checked",
      "Test report ships with every panel",
    ],
    brands: [
      { name: "Allen-Bradley", series: ["PanelView Plus", "PanelView Standard", "PanelView Component"] },
      { name: "Siemens", series: ["SIMATIC MP", "SIMATIC TP", "SIMATIC OP"] },
      { name: "And more", series: ["Pro-face GP", "Mitsubishi GOT", "Beijer", "Omron NS"] },
    ],
    faqs: [
      { q: "Can you replace just the touchscreen?", a: "Yes. When only the touch panel has failed we replace it and calibrate it, instead of replacing the whole HMI." },
      { q: "Will I lose my HMI project?", a: "Keep a backup of your HMI project before you ship the panel, so you can reload it if needed." },
      { q: "How long does HMI repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "What warranty comes with an HMI repair?", a: "Every HMI repair comes with a 1-year warranty." },
    ],
    related: ["plc-repair", "cnc-repair", "controller-card-repair", "power-supply-repair"],
  },
  {
    slug: "cnc-repair",
    noun: "CNC control",
    title: "CNC Control Repair",
    short: "CNC control repair and CNC machine electronics — SINUMERIK, FANUC and more.",
    icon: "/services/cnc-control.webp",
    color: "#FB7185",
    h1: "CNC Control Repair",
    tagline: "CNC control repair and CNC machine electronics repair",
    metaTitle: "CNC Control Repair | Fanuc, SINUMERIK 840D | IAR",
    metaDescription:
      "CNC control repair for SINUMERIK, FANUC and other machine tool controls, plus spindle drives and operator panels. Load tested, one-year warranty.",
    answerQ: "Can a CNC control be repaired?",
    answer:
      "Yes. We repair CNC controls, screens, operator panels and the spindle and servo amplifiers behind them, including SINUMERIK 840C/840D on our own test setup. Every unit is tested under power and ships with a test report and our one-year warranty.",
    repairs: [
      { t: "CNC controls & NCUs", d: "Control units and processor boards that will not boot, alarm or lock up." },
      { t: "Operator panels & monitors", d: "Machine operator panels, displays, keyboards and PCUs." },
      { t: "Spindle amplifiers", d: "Spindle amplifier power stages and control boards." },
      { t: "Servo amplifiers", d: "Axis amplifier modules with overcurrent, IPM and feedback faults." },
      { t: "Power supply modules", d: "CNC supply and line modules behind DC link and undervoltage alarms." },
      { t: "I/O & interface boards", d: "Machine I/O, axis interface and communication boards." },
    ],
    faults: [
      {
        symptom: "Servo amplifier IPM or overcurrent alarm",
        cause: "Failed power module, gate driver or a motor and cable fault",
        codes: [{ code: "SV0449", href: "/fault-codes/fanuc/alpha-i/sv0449" }, { code: "F30001", href: "/fault-codes/siemens/sinamics-s120/f30001" }],
      },
      {
        symptom: "Spindle amplifier DC link or IPM alarm",
        cause: "Failed spindle power stage, DC link components or supply module",
        codes: [{ code: "SP9012", href: "/fault-codes/fanuc/alpha-i/sp9012" }],
      },
      { symptom: "Control will not boot or stops at startup", cause: "Processor board, memory, battery backup or power supply fault" },
      { symptom: "Operator panel or screen dead", cause: "Display, backlight, PCU or panel power supply failure" },
    ],
    testing: [
      "Photos and condition report on arrival",
      "Root cause found before we quote",
      "Powered up and tested on our test benches",
      "Test report ships with every unit",
    ],
    brands: [
      { name: "Fanuc", series: ["Series 0i", "16i / 18i / 21i", "30i / 31i", "αi amplifiers"] },
      { name: "Siemens", series: ["SINUMERIK 840C", "SINUMERIK 840D", "SINUMERIK 810D", "SINUMERIK 828D"] },
      { name: "And more", series: ["Heidenhain TNC", "Mitsubishi CNC", "Okuma", "Mazak"] },
    ],
    faqs: [
      { q: "Do you repair older CNC controls like the SINUMERIK 840C?", a: "Yes. We repair older and discontinued CNC controls at component level, so proven machine tools keep running." },
      { q: "Will I lose my machine data or parameters?", a: "Back up your machine data and parameters before you ship any control or board that stores them." },
      { q: "Can a technician come to my machine?", a: "Yes. Our technicians provide on-site service calls across Canada and the United States." },
      { q: "What warranty comes with a CNC repair?", a: "Every CNC repair comes with a 1-year warranty." },
    ],
    related: ["servo-drive-repair", "industrial-motor-repair", "power-supply-repair", "hmi-repair"],
  },
  {
    slug: "power-supply-repair",
    noun: "power supply",
    title: "Power Supply Repair",
    short: "Industrial power supply repair and load testing — drive supply modules and 24 V units.",
    icon: "/services/power-supply.webp",
    color: "#FB923C",
    h1: "Power Supply Repair",
    tagline: "Industrial power supply repair with full load testing",
    metaTitle: "Industrial Power Supply Repair | Line Modules | IAR",
    metaDescription:
      "Industrial power supply repair: drive supply and line modules plus 24 V DIN-rail supplies, load tested for clean output. One-year warranty. Mississauga.",
    answerQ: "Can an industrial power supply be repaired?",
    answer:
      "Yes. We repair drive power supply and line modules as well as 24 V DIN-rail supplies, then load test them for clean, stable output before they ship. A failing supply can take down a whole cabinet, so every repair carries our one-year warranty.",
    repairs: [
      { t: "Switch-mode supplies", d: "24 V and control supplies that are dead, noisy or dropping out." },
      { t: "Drive line & supply modules", d: "Infeed and supply modules that feed the drive DC link." },
      { t: "Capacitors", d: "Aged, leaking or bulging capacitors that cause ripple and resets." },
      { t: "Rectifiers & pre-charge", d: "Input bridges, pre-charge circuits and contactors." },
      { t: "Regenerative circuits", d: "Regenerative and braking circuits on supply modules." },
      { t: "Protection & fans", d: "Fuses, protection circuits and cooling fans." },
    ],
    faults: [
      { symptom: "No output or output LED off", cause: "Failed switching transistor, controller IC or input fuse" },
      {
        symptom: "Undervoltage or pre-charge fault on the drive",
        cause: "Failed pre-charge circuit, rectifier or line module",
        codes: [{ code: "F30003", href: "/fault-codes/siemens/sinamics-s120/f30003" }, { code: "F30027", href: "/fault-codes/siemens/sinamics-s120/f30027" }],
      },
      {
        symptom: "DC link overvoltage",
        cause: "Regenerative or braking circuit fault, or voltage sensing failure",
        codes: [{ code: "F30002", href: "/fault-codes/siemens/sinamics-s120/f30002" }],
      },
      { symptom: "Machine resets or drops out at random", cause: "Aged capacitors causing ripple or an unstable output" },
    ],
    testing: [
      "Photos and condition report on arrival",
      "Root cause found before we quote",
      "Tested under load on our bench",
      "Test report ships with every supply",
    ],
    brands: [
      { name: "Siemens", series: ["SITOP", "SINAMICS line modules", "SIMODRIVE 611 supply modules"] },
      { name: "Fanuc", series: ["αi PSM power supply modules"] },
      { name: "Rexroth Indramat", series: ["HVE / HVR supply modules"] },
      { name: "And more", series: ["Allen-Bradley", "Phoenix Contact QUINT", "TDK-Lambda", "Sola"] },
    ],
    faqs: [
      { q: "Do you test power supplies under load?", a: "Yes. Every repaired power supply is tested under load before it ships, and a test report ships with the unit." },
      { q: "How long does power supply repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "Is the evaluation free?", a: "Yes. We test the supply, find the root cause and send a written quote. No work starts without your approval." },
      { q: "What warranty comes with a power supply repair?", a: "Every power supply repair comes with a 1-year warranty." },
    ],
    related: ["servo-drive-repair", "vfd-repair", "cnc-repair", "controller-card-repair"],
  },
  {
    slug: "controller-card-repair",
    noun: "circuit board",
    title: "Controller Card & PCB Repair",
    short: "Industrial circuit board repair for controller cards, I/O boards and drive boards.",
    icon: "/services/controller-card-pcb.webp",
    color: "#A3E635",
    h1: "Controller Card & PCB Repair",
    tagline: "Component-level industrial circuit board repair",
    metaTitle: "Controller Card & PCB Repair | IAR",
    metaDescription:
      "Component-level industrial circuit board repair for controller cards, I/O boards and drive boards, including obsolete boards. One-year warranty. Canada & USA.",
    answerQ: "Can an industrial circuit board be repaired?",
    answer:
      "Yes. We repair controller cards, I/O boards and drive boards at component level, including boards that are no longer made. Each board is tested in a working system or on our test fixtures and comes back with a test report and our one-year warranty.",
    repairs: [
      { t: "Drive control cards", d: "Regulator, control and interface cards from servo and AC drives." },
      { t: "I/O boards", d: "Digital and analog I/O boards with dead or wrong channels." },
      { t: "Machine controller boards", d: "OEM machine boards from packaging, plastics and processing lines." },
      { t: "Power & driver boards", d: "Gate driver, power and relay boards." },
      { t: "Burnt traces & connectors", d: "Damaged traces, burnt areas and failed connectors restored." },
      { t: "Obsolete boards", d: "Discontinued boards repaired when no replacement exists." },
    ],
    faults: [
      { symptom: "Board dead or machine will not start", cause: "Failed regulator, power components or a blown trace" },
      { symptom: "Intermittent faults that come and go", cause: "Cracked solder joints, aged capacitors or a failing connector" },
      { symptom: "Channels or functions missing", cause: "Failed driver ICs, optocouplers or relays" },
      { symptom: "Burn marks after a power event", cause: "Surge damage to power components and traces" },
    ],
    testing: [
      "Photos and condition report on arrival",
      "Root cause found before we quote",
      "Powered up and function-tested",
      "Test report ships with every board",
    ],
    brands: [
      { name: "Drive & control boards", series: ["Siemens", "Rexroth Indramat", "Allen-Bradley", "Fanuc", "Yaskawa"] },
      { name: "Machine OEM boards", series: ["Packaging machines", "Plastics & thermoforming", "Printing presses"] },
    ],
    faqs: [
      { q: "Do you need a schematic to repair a board?", a: "No. We diagnose and repair boards at component level whether or not a schematic is available." },
      { q: "Do you repair obsolete circuit boards?", a: "Yes. We repair discontinued boards when no replacement is available, so the machine keeps running." },
      { q: "How long does board repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "What warranty comes with a board repair?", a: "Every board repair comes with a 1-year warranty." },
    ],
    related: ["plc-repair", "power-supply-repair", "servo-drive-repair", "vfd-repair"],
  },
  {
    slug: "robotics-repair",
    noun: "robot",
    title: "Robotics Repair",
    short: "Robot servo motor repair, robot drives, controllers and teach pendants.",
    icon: "/services/robotics.webp",
    color: "#F472B6",
    h1: "Robotics Repair",
    tagline: "Robot servo motor, drive and teach pendant repair",
    metaTitle: "Robotics Repair | Robot Controller & Teach Pendant | IAR",
    metaDescription:
      "Robot servo motor repair, robot drive and controller repair and teach pendant repair for FANUC, ABB, KUKA and Yaskawa. One-year warranty. Mississauga.",
    answerQ: "Can a robot teach pendant be repaired?",
    answer:
      "Yes. We repair robot axis servo motors, drive modules, controllers and teach pendants — cracked screens, dead keys, E-stops and enabling switches included. Motors and drives are load tested, pendants are function-tested, and everything carries our one-year warranty.",
    repairs: [
      { t: "Teach pendants", d: "Touchscreens, displays, keypads, enable switches and cables." },
      { t: "Robot controllers", d: "Control boards, power supplies and I/O inside the controller cabinet." },
      { t: "Robot servo amplifiers", d: "Axis amplifiers with overcurrent, power stage and feedback faults." },
      { t: "Robot servo motors", d: "Bearings, brakes, windings and encoders, with encoder alignment." },
      { t: "Cables & harnesses", d: "Pendant cables and connectors that cause intermittent stops." },
      { t: "Safety circuits", d: "E-stop and enabling-device circuits on pendants and boards." },
    ],
    faults: [
      { symptom: "Teach pendant screen dead or not responding", cause: "Failed display, backlight, touchscreen or pendant board" },
      { symptom: "E-stop or enabling switch fault", cause: "Worn enable switch, damaged pendant cable or safety circuit fault" },
      { symptom: "Axis overcurrent or amplifier alarm", cause: "Failed amplifier power stage or a motor winding fault" },
      { symptom: "Robot motor encoder or pulsecoder alarm", cause: "Failed encoder, battery backup loss or feedback cable damage" },
    ],
    testing: [
      "Photos and condition report on arrival",
      "Root cause found before we quote",
      "Powered up and tested; motors run under drive control",
      "Test report ships with every unit",
    ],
    brands: [
      { name: "Fanuc", series: ["R-30iA", "R-30iB", "iPendant"] },
      { name: "KUKA", series: ["KR C2", "KR C4", "smartPAD"] },
      { name: "And more", series: ["ABB IRC5 FlexPendant", "Yaskawa Motoman DX100 / YRC1000", "Kawasaki", "Denso"] },
    ],
    faqs: [
      { q: "Do you repair robot servo motors?", a: "Yes. We repair robot servo motors, including bearings, brakes, windings and encoders, and align the encoder after repair." },
      { q: "Can a technician come to the robot cell?", a: "Yes. Our technicians provide on-site service calls across Canada and the United States." },
      { q: "How long does robotics repair take?", a: "Typical turnaround is 24–72 hours once you approve the quote." },
      { q: "What warranty comes with a robotics repair?", a: "Every robotics repair comes with a 1-year warranty." },
    ],
    related: ["servo-motor-repair", "servo-drive-repair", "hmi-repair", "encoder-repair"],
  },
  {
    slug: "exchange",
    noun: "exchange unit",
    title: "Exchange Program",
    short: "Servo exchange program — a tested unit ships first while yours is repaired.",
    icon: "/services/exchange.webp",
    color: "#FF5A6E",
    h1: "Exchange Program",
    tagline: "A tested exchange unit ships first, so your line restarts sooner",
    repairsTitle: "How the exchange program works",
    testingTitle: "Every exchange unit, before it ships",
    metaTitle: "Servo Drive & Motor Exchange Program | IAR",
    metaDescription:
      "Servo exchange program: a tested exchange unit ships right away, your failed unit comes back to our bench. One-year warranty. Canada & USA.",
    answerQ: "How does an exchange unit work?",
    answer:
      "When you cannot wait for a repair, we ship a tested exchange unit from our in-stock inventory first. You send back your failed unit once the replacement is running. Exchange units are load tested and covered by our one-year warranty.",
    repairs: [
      { t: "Same part number", d: "We match the full part number and the hardware and firmware revision, and confirm with you before shipping." },
      { t: "Tested before it ships", d: "Every exchange unit is load tested on OEM-standard equipment before it goes out." },
      { t: "Ships once yours arrives", d: "Usually within 1–2 business days of receiving your unit. Need it sooner? Contact us for rush options." },
      { t: "Lower price", d: "Exchange costs less than refurbished because you send us your unit." },
      { t: "Canada & USA", d: "Exchange units ship to facilities across Canada and the United States." },
      { t: "Condition checked", d: "The final price is confirmed when we check your unit and may be higher depending on its condition." },
    ],
    testing: [
      "Full part number and revision matched",
      "Load tested on OEM-standard equipment before shipping",
      "Ships once we receive your unit",
      "Confirmed with you before it ships",
    ],
    brands: [
      { name: "Siemens", series: ["SINAMICS", "SIMODRIVE", "1FK7 / 1FT motors"] },
      { name: "Rexroth Indramat", series: ["EcoDrive", "IndraDrive", "MKD / MSK motors"] },
      { name: "Allen-Bradley", series: ["Kinetix", "PowerFlex", "MPL motors"] },
      { name: "And more", series: ["Fanuc", "Yaskawa", "Mitsubishi"] },
    ],
    faqs: [
      { q: "How fast does an exchange unit ship?", a: "As soon as we receive your unit, when a matching unit is in stock." },
      { q: "What if you don't have my unit in stock?", a: "We repair your unit with a typical turnaround of 24–72 hours once you approve the quote, or source a replacement part." },
      { q: "Is the exchange unit tested?", a: "Yes. Every exchange unit is load tested on OEM-standard equipment before it ships." },
      { q: "How is the exchange price set?", a: "The exchange price is lower than the refurbished price because you send us your unit. The final price is confirmed when we check your unit and may be higher depending on its condition." },
      { q: "Can I have my own unit repaired instead?", a: "Yes. Choose \"Repair my unit\" and we repair your original, with a free evaluation and a written quote first." },
    ],
    related: ["servo-drive-repair", "servo-motor-repair", "vfd-repair", "power-supply-repair"],
  },
];

/* ------------------------------------------------------------------ */
/*  More repair services (second section on /services)                 */
/* ------------------------------------------------------------------ */
type R = [string, string];
const anyBrand = [{ name: "And more", series: ["Siemens", "Allen-Bradley", "Rexroth Indramat", "Fanuc", "Yaskawa", "ABB"] }];
const repairTesting = [
  "Photos and condition report when it arrives",
  "Root cause found before we quote",
  "Repaired at component level and tested",
  "Test report ships with the unit",
];
function more(
  slug: string, title: string, group: string, lucide: string, color: string, noun: string,
  short: string, answerQ: string, answer: string, repairs: R[],
  opts: { kind?: "repair" | "service" | "cable"; faqs?: { q: string; a: string }[]; related?: string[]; faults?: Fault[] } = {},
): Service {
  const kind = opts.kind ?? "repair";
  const base = kind === "repair"
    ? [
        { q: `Is the ${noun} evaluation free?`, a: "Yes. We inspect and test it, find the root cause and send a written quote. No work starts without your approval." },
        { q: `How long does ${noun} repair take?`, a: "Typical turnaround is 24–72 hours once you approve the quote. Larger jobs are confirmed in your written quote." },
        { q: "What warranty comes with the repair?", a: "Every repair comes with a 1-year warranty." },
      ]
    : [];
  return {
    slug, title, group, lucide, color, noun, short, kind, icon: "",
    h1: title,
    tagline: short,
    metaTitle: `${title} | Canada & USA | IAR`,
    metaDescription: `${short} ${kind === "repair" ? "Free evaluation, 1-year warranty." : ""} Mississauga, Ontario. Canada & USA.`.replace(/\s+/g, " ").slice(0, 158),
    answerQ, answer,
    repairs: repairs.map(([t, d]) => ({ t, d })),
    repairsTitle: kind === "repair" ? undefined : "What's included",
    faults: opts.faults,
    testing: kind === "repair" ? repairTesting : undefined,
    brands: anyBrand,
    faqs: [...(opts.faqs ?? []), ...base],
    related: opts.related ?? ["servo-drive-repair", "servo-motor-repair", "controller-card-repair", "exchange"],
  };
}

export const moreServices: Service[] = [
  /* ---------- Cables, feedback & connectors ---------- */
  more("custom-cables", "Custom Cables & Spare Critical Cables", "cables", "Cable", "#D91C38", "cable",
    "Custom servo power, feedback and brake cables built to your drive and motor, for any brand.",
    "Can you make a replacement servo cable?",
    "Yes. We build custom power, feedback, encoder and brake cables for servo drives and motors from any brand, to the length you need. Send us the drive model, motor model, connector photos and the length, and a pinout if you have one, and we build a matching cable. Many customers keep a spare critical cable on the shelf so a damaged cable never stops the line.",
    [["Feedback & encoder cables", "Matched to the drive and motor feedback type and connector pinout."], ["Motor power cables", "Built for the motor current with the right connector and shielding."], ["Brake & hybrid cables", "Brake wiring and combined power-feedback cables."], ["Any length", "Built to the exact length you need, short or long."], ["Drag-chain options", "Flexible cable for moving axes and cable carriers."], ["Spare critical cables", "Keep a ready spare for the cables your line can't run without."]],
    { kind: "cable", related: ["cable-repair", "connector-repair", "encoder-repair", "servo-motor-repair"],
      faqs: [
        { q: "What do you need to build my cable?", a: "The drive model, the motor model, photos of both connectors, the length and the quantity. A pinout or the old cable helps, but we can work it out from the models." },
        { q: "Do you make cables for every brand?", a: "Yes. We build cables for any brand of servo drive and motor, including discontinued equipment." },
        { q: "Can I order a spare critical cable?", a: "Yes. Many customers keep a spare for each critical axis so a damaged cable never stops the line." },
      ] }),
  more("cable-repair", "Feedback & Power Cable Repair", "cables", "Unplug", "#FF5A6E", "cable",
    "Repair of damaged servo feedback, encoder and power cables, including intermittent faults.",
    "Can a damaged servo cable be repaired?",
    "Often, yes. Feedback and power cables that are cut, crushed, worn through in a drag chain or failing intermittently can usually be repaired or re-terminated. If a repair would not be reliable, we build a new matching cable instead.",
    [["Feedback cable repair", "Broken shields, cut conductors and intermittent encoder signals."], ["Power cable repair", "Damaged jackets, burnt conductors and failed terminations."], ["Re-termination", "New connectors fitted to a good cable."], ["Intermittent faults", "Cables that fail only when the axis moves, traced and fixed."]],
    { related: ["custom-cables", "connector-repair", "encoder-repair", "servo-motor-repair"],
      faults: [
        { symptom: "Encoder alarm only when the axis moves", cause: "Broken conductor or shield inside a flexing cable" },
        { symptom: "Ground fault or overcurrent on one axis", cause: "Damaged motor power cable insulation" },
      ] }),
  more("connector-repair", "Connector Repair", "cables", "Plug", "#2DD4BF", "connector",
    "Power and feedback connector repair and replacement on motors, drives and cables.",
    "Can a broken motor connector be repaired?",
    "Yes. Broken, burnt or corroded power and feedback connectors on servo motors, drives and cables can be repaired or replaced, including the connector on the motor itself. It is often the fix for intermittent feedback and power faults.",
    [["Motor power connectors", "Burnt pins, broken housings and loose contacts."], ["Feedback connectors", "Bent or corroded pins behind encoder alarms."], ["Drive-side connectors", "Damaged plugs and headers on the drive."], ["Angled & rotatable connectors", "Replacement of swivel and angled motor connectors."]],
    { related: ["cable-repair", "custom-cables", "servo-motor-repair", "encoder-repair"] }),

  /* ---------- Drives & power electronics ---------- */
  more("soft-starter-repair", "Soft Starter Repair", "drives", "Gauge", "#FBBF24", "soft starter",
    "SCR soft starter repair for Allen-Bradley SMC, ABB, Siemens 3RW and more.",
    "Can a soft starter be repaired?",
    "Yes. Most soft starter failures, such as shorted SCRs, failed control boards, bypass contactors and fans, can be repaired at component level and tested before the unit ships back.",
    [["SCR & thyristor stacks", "Shorted or open SCRs replaced and tested."], ["Control boards", "Firing, sensing and logic board repair."], ["Bypass contactors", "Worn bypass contacts and coils."], ["Cooling", "Fans and heat sink sensors."]]),
  more("line-module-repair", "Line Module & Regen Unit Repair", "drives", "Zap", "#FB923C", "line module",
    "Line modules, DC bus modules and regenerative units for servo and spindle systems.",
    "Can a drive line module be repaired?",
    "Yes. Line modules, infeed and supply modules, DC bus modules and regenerative units can usually be repaired at component level, including IGBT and rectifier replacement, then tested under power.",
    [["Line & infeed modules", "SINAMICS, SIMODRIVE 611, Indramat and Fanuc supply modules."], ["DC bus modules", "Bus capacitors, pre-charge and monitoring."], ["Regen units", "Regenerative and braking circuits."], ["IGBT replacement", "Power stage parts replaced and tested."]],
    { related: ["power-supply-repair", "servo-drive-repair", "cnc-repair", "exchange"] }),
  more("motion-controller-repair", "Motion Controller Repair", "drives", "Workflow", "#A78BFA", "motion controller",
    "Multi-axis motion controllers, axis cards and fieldbus and network cards.",
    "Can a motion controller be repaired?",
    "Yes. Motion controllers, axis interface cards, fieldbus and network cards can usually be repaired at component level. Back up your program and parameters before you ship.",
    [["Motion controllers", "Multi-axis controllers that fault, freeze or will not boot."], ["Axis & encoder interface cards", "Feedback input and axis control cards."], ["Fieldbus & network cards", "Ethernet, PROFIBUS, SERCOS and EtherCAT cards."], ["CPU modules", "Processor and memory faults."]]),
  more("stepper-motor-repair", "Stepper Motor & Driver Repair", "drives", "Footprints", "#A3E635", "stepper",
    "Stepper motors and stepper drivers repaired and tested.",
    "Can a stepper motor be repaired?",
    "Yes. Stepper motors with worn bearings, shaft damage or winding faults, and stepper drivers with failed power stages, can be repaired and tested as a pair.",
    [["Stepper motors", "Bearings, shafts and windings."], ["Stepper drivers", "Power stage and control faults."], ["Closed-loop steppers", "Encoder feedback on closed-loop systems."]]),
  more("induction-heating-repair", "Induction Heating Power Supply Repair", "drives", "Flame", "#FB7185", "induction heater",
    "Induction heating generators and power supplies repaired at component level.",
    "Can an induction heating power supply be repaired?",
    "Yes. Induction heating generators and power supplies can be repaired at component level, including inverter power stages, control boards and capacitors.",
    [["Inverter power stage", "IGBT and SCR stages."], ["Control boards", "Frequency and power control."], ["Capacitors", "Tank and DC bus capacitors."]]),
  more("welding-controller-repair", "Welding Controller Repair", "drives", "Sparkles", "#F472B6", "welding controller",
    "Resistance welding controllers, weld timers and inverter welding units.",
    "Can a welding controller be repaired?",
    "Yes. Resistance welding controllers, weld timers and inverter welding power units can be repaired at component level and tested before return.",
    [["Weld controllers & timers", "Control and timing boards."], ["Inverter weld units", "Power stage repair."], ["SCR contactors", "SCR firing and stacks."]]),
  more("ups-inverter-repair", "Industrial UPS & Inverter Repair", "drives", "BatteryCharging", "#4ADE80", "UPS",
    "Industrial UPS units and inverters repaired, with battery replacement.",
    "Can an industrial UPS be repaired?",
    "Yes. Industrial UPS units and inverters can usually be repaired at component level, including power stages, control boards and batteries.",
    [["Power stages", "Inverter and charger stages."], ["Control boards", "Monitoring and control faults."], ["Batteries", "Battery replacement and testing."]]),

  /* ---------- Motors & mechanical ---------- */
  more("motor-rewinding", "Motor Rewinding & Winding Testing", "motors", "RotateCw", "#34D399", "motor",
    "Rewinding, insulation testing, armature, rotor and commutator repair.",
    "Can a burnt motor be rewound?",
    "Yes. Motors with shorted, grounded or burnt windings can usually be rewound. We test insulation first, then rewind, repair armatures, rotors and commutators, and test the motor before it ships back.",
    [["Rewinding", "AC, DC and servo motor windings."], ["Insulation testing", "Winding and insulation tests before and after."], ["Armature & rotor repair", "Armature rewinds and rotor repair."], ["Commutator resurfacing", "DC motor commutators turned and undercut."], ["Motor load testing", "Run and load tested before return."]],
    { related: ["industrial-motor-repair", "servo-motor-repair", "bearing-shaft-repair", "balancing-vibration"] }),
  more("spindle-rebuild", "Machine Tool Spindle Rebuild", "motors", "Disc3", "#D91C38", "spindle",
    "Cartridge and motorized spindle rebuilds with bearings and balancing.",
    "Can a machine tool spindle be rebuilt?",
    "Yes. Machine tool spindles, both cartridge and motorized, can be rebuilt with new bearings, seals and drawbar parts, then balanced and run in before they ship back.",
    [["Spindle bearings", "Precision bearings replaced."], ["Drawbar & clamping", "Drawbar and tool clamping parts."], ["Balancing", "Dynamic balancing of the rotating assembly."], ["Run-in testing", "Run in and checked for heat and vibration."]],
    { related: ["industrial-motor-repair", "cnc-repair", "balancing-vibration", "bearing-shaft-repair"] }),
  more("gearbox-repair", "Gearbox & Gear Reducer Repair", "motors", "Cog", "#FBBF24", "gearbox",
    "Servo gearboxes, planetary and gear reducer rebuilds.",
    "Can a gearbox be repaired?",
    "Yes. Servo gearboxes, planetary gearheads and gear reducers can be rebuilt with new bearings, seals and, where needed, gears, then tested before return.",
    [["Gearbox rebuilds", "Bearings, seals and gears."], ["Planetary gearheads", "Servo planetary reducers."], ["Gear reducers", "Worm and helical reducers."]]),
  more("linear-motor-repair", "Linear Motor & Actuator Repair", "motors", "MoveHorizontal", "#F28797", "linear motor",
    "Linear motors, electric actuators and their feedback.",
    "Can a linear motor be repaired?",
    "Yes. Linear motors and electric actuators can be repaired, including coils, feedback and cables, then tested before return.",
    [["Linear motor coils", "Forcer coil faults."], ["Electric actuators", "Screw and belt actuators."], ["Linear feedback", "Linear encoder and sensor faults."]]),
  more("pump-fan-motor-repair", "Pump, Fan & Blower Motor Repair", "motors", "Fan", "#FF5A6E", "pump motor",
    "Pump, fan, blower, hydraulic pump and vacuum pump motor repair.",
    "Can a pump motor be repaired?",
    "Yes. Pump, fan and blower motors, hydraulic pumps and vacuum pumps can be repaired, with bearings, seals, windings and balancing as needed.",
    [["Pump motors", "Bearings, seals and windings."], ["Fan & blower motors", "Including spindle and drive cooling blowers."], ["Hydraulic pumps", "Pump rebuilds."], ["Vacuum pumps", "Vacuum pump repair."]]),
  more("brake-repair", "Motor Brake & Brake Coil Repair", "motors", "OctagonPause", "#F87171", "brake",
    "Servo and motor holding brakes and brake coils.",
    "Can a servo motor brake be repaired?",
    "Yes. Holding brakes that drag, slip or will not release can be repaired or replaced, including the brake coil, then tested on the motor.",
    [["Holding brakes", "Friction discs and armatures."], ["Brake coils", "Open or shorted coils replaced."], ["Brake testing", "Release voltage and holding torque checked."]],
    { related: ["servo-motor-repair", "robotics-repair", "industrial-motor-repair", "exchange"] }),
  more("bearing-shaft-repair", "Bearing, Shaft & Seal Repair", "motors", "Circle", "#A78BFA", "shaft",
    "Bearing replacement, shaft repair, shaft seals and precision machining.",
    "Can a damaged motor shaft be repaired?",
    "Yes. Worn bearing fits, damaged shafts and keyways and leaking shaft seals can be repaired, with precision machining where needed.",
    [["Bearing replacement", "Correct bearings for speed and load."], ["Shaft repair", "Damaged shafts and keyways."], ["Shaft seals", "Seals that let oil or coolant in."], ["Precision machining", "Bearing fits and shafts machined to size."]]),
  more("balancing-vibration", "Dynamic Balancing & Vibration Analysis", "motors", "Activity", "#2DD4BF", "rotor",
    "Dynamic balancing, vibration analysis and motor load testing.",
    "Why balance a motor or spindle?",
    "Imbalance causes vibration, noise and early bearing failure. We dynamically balance rotors and spindles, check vibration and load test motors so they run smoothly and last longer.",
    [["Dynamic balancing", "Rotors, armatures and spindles."], ["Vibration analysis", "Measured before and after repair."], ["Motor load testing", "Run under load before return."]],
    { kind: "service" }),

  /* ---------- Controls & computers ---------- */
  more("industrial-pc-repair", "Industrial PC & Panel PC Repair", "controls", "Monitor", "#E8354F", "industrial PC",
    "Industrial PCs, panel PCs and embedded controllers.",
    "Can an industrial PC be repaired?",
    "Yes. Industrial PCs, panel PCs and embedded controllers can be repaired, including power supplies, boards, displays, touchscreens and storage. Back up your software first.",
    [["Panel PCs", "Display, touch and board faults."], ["Industrial PCs", "Power supplies, boards and storage."], ["Embedded controllers", "Boot and hardware faults."], ["Backup batteries", "Battery replacement."]]),
  more("monitor-repair", "Industrial Monitor Repair & CRT-to-LCD Upgrade", "controls", "MonitorSmartphone", "#C084FC", "monitor",
    "Machine monitors repaired, and old CRT screens replaced with LCD.",
    "Can an old CRT machine monitor be replaced?",
    "Yes. When a CRT machine monitor fails we can repair it, or replace it with a matching LCD that fits the same opening and accepts the same video signal, so the machine keeps working.",
    [["Monitor repair", "Backlight, LCD and power faults."], ["CRT-to-LCD upgrade", "Drop-in LCD replacements for CRT screens."], ["LCD & backlight repair", "Dim, dark or lined displays."]]),
  more("safety-controller-repair", "Safety Relay & Safety Controller Repair", "controls", "ShieldCheck", "#F59E0B", "safety controller",
    "Safety relays and safety controllers from Pilz, SICK, Allen-Bradley and more.",
    "Can a safety relay be repaired?",
    "Yes. Safety relays and safety controllers can be repaired at component level and function-tested. Have the safety function re-validated on the machine after reinstallation.",
    [["Safety relays", "Relay and logic faults."], ["Safety controllers", "Programmable safety controllers."], ["Function testing", "Inputs, outputs and channels tested."]]),
  more("temperature-controller-repair", "Temperature Controller & Instrument Repair", "controls", "Thermometer", "#FB923C", "temperature controller",
    "Temperature controllers, process controllers and instruments.",
    "Can a temperature controller be repaired?",
    "Yes. Temperature controllers, process controllers and instruments can be repaired and function-tested before return.",
    [["Temperature controllers", "Display, input and output faults."], ["Process controllers", "Loop controllers and indicators."], ["Thermocouple inputs", "Input circuit faults."]]),
  more("valve-amplifier-repair", "Proportional & Servo Valve Amplifier Repair", "controls", "Droplets", "#D91C38", "valve amplifier",
    "Hydraulic proportional and servo valve amplifier cards.",
    "Can a proportional valve amplifier card be repaired?",
    "Yes. Proportional and servo valve amplifier cards for hydraulic systems can be repaired at component level and tested before return.",
    [["Amplifier cards", "Output stage and control faults."], ["Valve electronics", "On-board valve electronics."], ["Card testing", "Outputs tested before return."]]),

  /* ---------- Engineering & support services ---------- */
  more("drive-retrofit", "Obsolete Drive Retrofit & Upgrade", "services", "ArrowUpCircle", "#E8354F", "retrofit",
    "When a unit can't be repaired, we replace it with a current model and set it up.",
    "What if my obsolete drive can't be repaired?",
    "We tell you before any repair work is done, then offer the next best option: an exchange unit, a refurbished replacement, or a retrofit to a current model with the cabling, parameters and setup handled.",
    [["Replacement selection", "A current model that fits your application."], ["Cabling & adapters", "Custom cables and connectors as needed."], ["Parameters & setup", "Settings transferred and the axis set up."]],
    { kind: "service" }),
  more("parameter-backup", "Firmware & Parameter Backup", "services", "Save", "#34D399", "backup",
    "Drive, CNC and PLC parameters and programs backed up and restored.",
    "Should I back up drive parameters before a repair?",
    "Yes. Back up parameters, programs and firmware before any unit leaves the machine. We can back up and restore drive and CNC settings so a repaired or replacement unit drops straight back in.",
    [["Parameter backup", "Drive and CNC parameters saved."], ["Restore", "Settings restored to repaired or replacement units."], ["Firmware", "Firmware versions recorded and matched."]],
    { kind: "service" }),
  more("preventive-maintenance", "Preventive Maintenance Programs", "services", "CalendarCheck", "#A78BFA", "maintenance",
    "Scheduled checks of drives, motors and controls to prevent downtime.",
    "What does preventive maintenance cover?",
    "Scheduled checks of your critical drives, motors and controls, including fans, capacitors, connections and backups, so worn parts are replaced before they stop the line.",
    [["Inspections", "Fans, capacitors and connections."], ["Backups", "Parameters and programs saved."], ["Spares planning", "Critical spares and cables identified."]],
    { kind: "service" }),
  more("emergency-repair", "Emergency Line-Down Repair", "services", "Siren", "#F87171", "emergency",
    "Rush repair and exchange units when your line is down.",
    "What should I do when my line is down?",
    "Request a repair and tell us your line is down. Your repair goes to the front of the queue. You can also buy an exchange unit: ship us your unit and we ship a tested replacement, usually within 1–2 business days of receiving it. For rush handling, call or email us; rush is quoted separately.",
    [["Exchange units", "Replacement once your unit arrives."], ["Priority repair", "Line-down jobs go to the front."], ["On-site service", "Technicians across Canada and the USA."]],
    { kind: "service", related: ["exchange", "servo-drive-repair", "servo-motor-repair", "vfd-repair"] }),
  more("failure-analysis", "Failure Analysis Reports", "services", "FileSearch", "#FF5A6E", "failure analysis",
    "Root-cause reports that help stop the same failure happening again.",
    "Why did my drive fail?",
    "Every repair starts with finding the root cause. On request we write it up as a failure analysis report, with what failed, why, and what to change to stop it happening again.",
    [["Root cause", "What failed and why."], ["Photos", "Condition and failed parts documented."], ["Recommendations", "What to change on the machine."]],
    { kind: "service" }),
];

export const serviceGroups = [
  { key: "cables", label: "Cables, feedback & connectors" },
  { key: "drives", label: "Drives & power electronics" },
  { key: "motors", label: "Motors & mechanical" },
  { key: "controls", label: "Controls & computers" },
  { key: "services", label: "Engineering & support" },
];

/* Every chip in the homepage "More industrial repair services" rows -> its page */
export const chipHref: Record<string, string> = {
  "Motor Rewinding": "motor-rewinding", "Resolver Repair": "encoder-repair", "Pump Motor Repair": "pump-fan-motor-repair",
  "Gearbox Repair": "gearbox-repair", "Gear Reducer Rebuild": "gearbox-repair", "Bearing Replacement": "bearing-shaft-repair",
  "Shaft Repair": "bearing-shaft-repair", "Shaft Seal Replacement": "bearing-shaft-repair", "Precision Machining": "bearing-shaft-repair",
  "Brake Repair": "brake-repair", "Brake Coil Replacement": "brake-repair", "Linear Motor Repair": "linear-motor-repair",
  "Stepper Motor Repair": "stepper-motor-repair", "Fan Motor Repair": "pump-fan-motor-repair", "Blower Motor Repair": "pump-fan-motor-repair",
  "Hydraulic Pump Repair": "pump-fan-motor-repair", "Vacuum Pump Repair": "pump-fan-motor-repair", "Dynamic Balancing": "balancing-vibration",
  "Vibration Analysis": "balancing-vibration", "Motor Load Testing": "balancing-vibration", "Winding Insulation Testing": "motor-rewinding",
  "Rotor Repair": "motor-rewinding", "Armature Repair": "motor-rewinding", "Commutator Resurfacing": "motor-rewinding",
  "Power Connector Repair": "connector-repair", "Feedback Connector Repair": "connector-repair", "Feedback Cable Repair": "cable-repair",
  "Power Cable Repair": "cable-repair", "Spindle Amplifier Repair": "servo-drive-repair", "Servo Amplifier Repair": "servo-drive-repair",
  "Line Module Repair": "line-module-repair", "DC Bus Module Repair": "line-module-repair", "Regen Unit Repair": "line-module-repair",
  "Soft Starter Repair": "soft-starter-repair", "IGBT Module Replacement": "servo-drive-repair", "I/O Module Repair": "plc-repair",
  "CPU Module Repair": "plc-repair", "Fieldbus Card Repair": "motion-controller-repair", "Encoder Interface Card Repair": "motion-controller-repair",
  "Touchscreen Replacement": "hmi-repair", "LCD and Backlight Repair": "monitor-repair", "Membrane Keypad Repair": "hmi-repair",
  "Operator Panel Repair": "hmi-repair", "Teach Pendant Repair": "robotics-repair", "Robot Servo Motor Repair": "robotics-repair",
  "PCB Component Replacement": "controller-card-repair", "Capacitor Replacement": "controller-card-repair", "Cooling Fan Replacement": "controller-card-repair",
  "Backup Battery Replacement": "industrial-pc-repair", "Motion Controller Repair": "motion-controller-repair", "Network Card Repair": "motion-controller-repair",
  "Industrial PC Repair": "industrial-pc-repair", "Firmware and Parameter Backup": "parameter-backup",
};


export const allServices: Service[] = [...services, ...moreServices];
export const getService = (slug: string) => allServices.find((s) => s.slug === slug);
export const serviceUrl = (slug: string) => `/services/${slug}`;
