/* Shop categories. Slugs match the Shop Parts menu links (/shop/<slug>).
   The catalog has no `category` values yet, so until it does:
     - /shop/<slug> lists keyword-search results for `query` (and is noindexed)
     - part pages guess their category from the title with `match`
   Once products carry a category_slug that matches, /shop/<slug> lists those. */
export type PartCategory = {
  slug: string;
  name: string;
  /** singular, used in sentences: "this servo drive" */
  noun: string;
  /** singular, shown as the part's type in cards, headings and titles: "Servo Drive" */
  label: string;
  intro: string;
  image: string;
  /** Repair page for this kind of unit */
  service: string;
  /** Keyword search used while products have no category */
  query: string;
  /** Title keywords that put a part in this category */
  match: RegExp;
};

export const categories: PartCategory[] = [
  { slug: "servo-drives", name: "Servo Drives", noun: "servo drive", label: "Servo Drive", intro: "Servo amplifiers, drive modules and motor modules: new, surplus and refurbished.", image: "/services/servo-drive.webp", service: "servo-drive-repair", query: "servo drive", match: /\bservo ?(drive|amplifier|amp|controller)s?\b|\bspindle drive/i },
  { slug: "servo-motors", name: "Servo Motors", noun: "servo motor", label: "Servo Motor", intro: "AC and DC servo motors and spindle motors.", image: "/services/servo-motor.webp", service: "servo-motor-repair", query: "servo motor", match: /\b(servo|spindle) ?motors?\b/i },
  { slug: "encoders", name: "Encoders", noun: "encoder", label: "Encoder", intro: "Rotary encoders, resolvers and feedback devices.", image: "/services/encoder.webp", service: "encoder-repair", query: "encoder", match: /\b(encoder|resolver)s?\b/i },
  { slug: "hmis", name: "HMIs & Operator Panels", noun: "HMI", label: "HMI", intro: "Touch screens, operator panels and keypads for every major brand.", image: "/services/hmi.webp", service: "hmi-repair", query: "hmi", match: /\b(hmi|operator panel|touch ?(screen|panel)|display unit)s?\b/i },
  { slug: "plcs", name: "PLCs & I/O", noun: "PLC module", label: "PLC", intro: "PLC CPUs, I/O cards, communication and power modules.", image: "/services/plc.webp", service: "plc-repair", query: "plc", match: /\b(plc|cpu module|i\/o module|input module|output module|simatic s7)s?\b/i },
  { slug: "power-supplies", name: "Power Supplies", noun: "power supply", label: "Power Supply", intro: "Industrial power supplies, line modules and DC power units.", image: "/services/power-supply.webp", service: "power-supply-repair", query: "power supply", match: /\bpower (supply|supplies|module)\b|\bsmps\b/i },
  { slug: "cnc-controls", name: "CNC Controls", noun: "CNC control", label: "CNC Control", intro: "CNC controllers, operator panels, boards and spindle amplifiers.", image: "/services/cnc-control.webp", service: "cnc-repair", query: "cnc", match: /\bcnc\b/i },
  { slug: "legacy", name: "Legacy & Obsolete", noun: "obsolete part", label: "Obsolete Part", intro: "Discontinued drives, boards and controls that keep older machines running.", image: "/hero/obsolete-equipment.webp", service: "controller-card-repair", query: "obsolete", match: /\b(obsolete|discontinued)\b/i },
  { slug: "sensors", name: "Sensors", noun: "sensor", label: "Sensor", intro: "Proximity, photoelectric, vision and process sensors.", image: "/hero/industrial-controls.webp", service: "controller-card-repair", query: "sensor", match: /\bsensors?\b/i },
  { slug: "safety", name: "Safety Equipment", noun: "safety device", label: "Safety Device", intro: "Safety relays, light curtains, switches and safety controllers.", image: "/hero/industrial-controls.webp", service: "safety-controller-repair", query: "safety", match: /\bsafety\b/i },
  { slug: "gearboxes", name: "Gearboxes", noun: "gearbox", label: "Gearbox", intro: "Planetary, servo and industrial gear reducers.", image: "/hero/servo-motors.webp", service: "gearbox-repair", query: "gearbox", match: /\bgear ?(box|boxes|reducers?)\b/i },
  { slug: "pneumatics-hydraulics", name: "Pneumatics & Hydraulics", noun: "valve", label: "Pneumatic & Hydraulic Part", intro: "Valves, cylinders, pumps, fittings and valve amplifiers.", image: "/hero/industrial-controls.webp", service: "valve-amplifier-repair", query: "pneumatic", match: /\b(pneumatic|hydraulic|valve amplifier|proportional valve)s?\b/i },
  // Catalog parts that fit none of the categories above (VFDs, cables, accessories…). Set by the import; never guessed.
  { slug: "other", name: "Other Parts", noun: "part", label: "Automation Part", intro: "VFDs, cables, accessories and other industrial automation parts that sit outside the categories above.", image: "/services/controller-card-pcb.webp", service: "controller-card-repair", query: "accessories", match: /(?!)/ },
];

export const getCategory = (slug: string | null | undefined) => categories.find((c) => c.slug === slug);

/** Best-guess category from a part's title. "Legacy" and "Other" are never guessed. */
export const guessCategory = (text: string) =>
  categories.find((c) => c.slug !== "legacy" && c.slug !== "other" && c.match.test(text));
export const categoryUrl = (slug: string) => `/shop/${slug}`;
