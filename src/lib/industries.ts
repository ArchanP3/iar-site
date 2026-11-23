/* ------------------------------------------------------------------ */
/*  Industries we serve. One entry = one page at /industries/<slug>.   */
/*  "equipment" lists the kinds of machines in that industry whose     */
/*  drives, motors and controls we repair. "services" link to repair   */
/*  pages (slugs from src/lib/services.ts).                            */
/* ------------------------------------------------------------------ */

export type Industry = {
  slug: string;
  name: string;
  /** one line for cards */
  short: string;
  /** hero paragraph */
  intro: string;
  color: string;
  /** photo in /public/industries, or "" to use the icon */
  image: string;
  icon: string;
  equipment: string[];
  services: string[];
  /** featured on top of /industries */
  core?: boolean;
  /** photo has text printed at the bottom: zoom in on the card so it is hidden */
  zoom?: boolean;
};

export const industries: Industry[] = [
  {
    slug: "automotive", name: "Automotive", color: "#3B82F6", image: "/industries/automotive.jpg", zoom: true, icon: "Car", core: true,
    short: "Body shop robots, press lines, paint and assembly.",
    intro: "Automotive plants run on servo drives, robots and PLCs that can't stop. We repair the drives, motors, controllers and HMIs on body shop, press, paint and final assembly lines.",
    equipment: ["Body shop and welding robots", "Transfer presses and press lines", "Paint shop conveyors and robots", "Final assembly conveyors", "Welding controllers", "Torque and fastening systems"],
    services: ["robotics-repair", "servo-drive-repair", "servo-motor-repair", "welding-controller-repair", "plc-repair", "hmi-repair"],
  },
  {
    slug: "packaging", name: "Packaging", color: "#22C55E", image: "/industries/packaging.jpg", zoom: true, icon: "Package", core: true,
    short: "Form-fill-seal, cartoners, labelers and palletizers.",
    intro: "Packaging lines depend on fast, precise servo motion. We repair the servo drives, motors, motion controllers and HMIs on fillers, cartoners, wrappers, labelers and palletizers.",
    equipment: ["Form-fill-seal machines", "Cartoners and case packers", "Flow wrappers", "Labelers and coders", "Palletizers and stretch wrappers", "Fillers and cappers"],
    services: ["servo-drive-repair", "servo-motor-repair", "motion-controller-repair", "hmi-repair", "encoder-repair", "plc-repair"],
  },
  {
    slug: "plastics", name: "Plastics & Thermoforming", color: "#F97316", image: "/industries/plastics.jpg", zoom: true, icon: "Factory", core: true,
    short: "Injection molding, extrusion and thermoforming.",
    intro: "Injection molding machines, extruders and thermoformers use large servo drives, heater controls and HMIs. We repair them at component level so your molds keep cycling.",
    equipment: ["Injection molding machines", "Extruders and pullers", "Thermoformers", "Blow molding machines", "Robots and sprue pickers", "Temperature controllers and heater zones"],
    services: ["servo-drive-repair", "servo-motor-repair", "temperature-controller-repair", "vfd-repair", "hmi-repair", "controller-card-repair"],
  },
  {
    slug: "food-beverage", name: "Food & Beverage", color: "#EAB308", image: "/industries/food-beverage.jpg", zoom: true, icon: "Beef", core: true,
    short: "Processing, bottling, filling and packaging lines.",
    intro: "Food and beverage plants run around the clock. We repair the VFDs, servo drives, motors and controls on processing, bottling, filling and packaging lines.",
    equipment: ["Bottling and canning lines", "Fillers and cappers", "Mixers and processing equipment", "Conveyors", "Ovens and fryers", "Packaging machines"],
    services: ["vfd-repair", "servo-drive-repair", "industrial-motor-repair", "pump-fan-motor-repair", "plc-repair", "hmi-repair"],
  },
  {
    slug: "metalworking", name: "Metalworking & CNC", color: "#06B6D4", image: "/industries/metalworking.jpg", zoom: true, icon: "Cog", core: true,
    short: "Machining centers, lathes, grinders and press brakes.",
    intro: "CNC machining centers, lathes and grinders rely on spindle drives, servo amplifiers and CNC controls. We repair Siemens, Fanuc, Indramat and other CNC systems and rebuild spindle motors.",
    equipment: ["CNC machining centers", "CNC lathes", "Grinders", "Press brakes and punch presses", "Laser and plasma cutters", "Spindle motors and drives"],
    services: ["cnc-repair", "spindle-rebuild", "servo-drive-repair", "servo-motor-repair", "encoder-repair", "power-supply-repair"],
  },
  {
    slug: "printing", name: "Printing", color: "#EC4899", image: "/industries/printing.jpg", zoom: true, icon: "Printer", core: true,
    short: "Offset, flexo and digital presses, folders and finishing.",
    intro: "Printing presses use many synchronized servo axes. We repair the drives, motors, encoders and controls on offset, flexo and digital presses and finishing equipment.",
    equipment: ["Offset presses", "Flexographic presses", "Digital presses", "Folders and cutters", "Web handling and tension control", "Finishing and binding lines"],
    services: ["servo-drive-repair", "servo-motor-repair", "encoder-repair", "motion-controller-repair", "vfd-repair", "controller-card-repair"],
  },
  {
    slug: "pharmaceutical", name: "Pharmaceutical", color: "#A855F7", image: "/industries/pharmaceutical.jpg", zoom: true, icon: "Pill", core: true,
    short: "Tablet presses, filling, blister and packaging.",
    intro: "Pharmaceutical lines need reliable equipment and documented repairs. We repair the drives, motors, HMIs and controls on tablet presses, filling lines and blister packaging, with a test report on every unit.",
    equipment: ["Tablet presses", "Capsule fillers", "Liquid filling lines", "Blister packaging machines", "Labelers and serialization", "Mixers and granulators"],
    services: ["servo-drive-repair", "servo-motor-repair", "hmi-repair", "plc-repair", "failure-analysis", "preventive-maintenance"],
  },
  {
    slug: "material-handling", name: "Material Handling", color: "#14B8A6", image: "/industries/material-handling.jpg", zoom: true, icon: "Forklift", core: true,
    short: "Conveyors, sortation, AS/RS and cranes.",
    intro: "Warehouses and distribution centers depend on conveyors, sorters and automated storage. We repair the VFDs, gearmotors, PLCs and controls that keep product moving.",
    equipment: ["Conveyors and sortation", "Automated storage and retrieval (AS/RS)", "Cranes and hoists", "Palletizers", "AGVs and shuttles", "Gearmotors and brakes"],
    services: ["vfd-repair", "industrial-motor-repair", "gearbox-repair", "brake-repair", "plc-repair", "soft-starter-repair"],
  },
  {
    slug: "steel-metals", name: "Steel & Metal Processing", color: "#94A3B8", image: "/industries/steel-metals.webp", icon: "Anvil",
    short: "Rolling mills, coil processing and furnaces.",
    intro: "Steel and metal processing uses large drives, DC motors and heavy-duty controls. We repair AC and DC drives, motors, power supplies and induction heating controls.",
    equipment: ["Rolling mills", "Coil processing and slitting lines", "Cut-to-length lines", "Induction heating", "Furnaces", "Cranes"],
    services: ["vfd-repair", "industrial-motor-repair", "motor-rewinding", "induction-heating-repair", "power-supply-repair", "line-module-repair"],
  },
  {
    slug: "pulp-paper", name: "Pulp & Paper", color: "#84CC16", image: "/industries/pulp-paper.webp", icon: "ScrollText",
    short: "Paper machines, winders and converting.",
    intro: "Paper machines and converting lines run many coordinated drive sections. We repair the drives, motors, encoders and controls on paper machines, winders and converting equipment.",
    equipment: ["Paper machine drive sections", "Winders and rewinders", "Converting lines", "Tissue and towel lines", "Pumps and fans", "Web tension control"],
    services: ["vfd-repair", "servo-drive-repair", "industrial-motor-repair", "encoder-repair", "pump-fan-motor-repair", "plc-repair"],
  },
  {
    slug: "tire-rubber", name: "Tire & Rubber", color: "#F59E0B", image: "/industries/tire-rubber.webp", icon: "CircleDot",
    short: "Mixers, calenders, extruders and curing presses.",
    intro: "Tire and rubber plants run mixers, calenders, extruders and curing presses. We repair the drives, motors, temperature controls and PLCs behind them.",
    equipment: ["Mixers", "Calenders", "Extruders", "Tire building machines", "Curing presses", "Temperature controllers"],
    services: ["vfd-repair", "servo-drive-repair", "industrial-motor-repair", "temperature-controller-repair", "plc-repair", "hmi-repair"],
  },
  {
    slug: "woodworking", name: "Woodworking & Furniture", color: "#D97706", image: "", icon: "TreePine",
    short: "CNC routers, edgebanders and panel saws.",
    intro: "Woodworking and furniture plants use CNC routers, edgebanders and saws with fast spindles and servo axes. We repair the spindles, drives, motors and CNC controls.",
    equipment: ["CNC routers and nesting machines", "Edgebanders", "Panel saws", "Moulders and sanders", "Boring and insertion machines", "Spindle motors"],
    services: ["cnc-repair", "spindle-rebuild", "servo-drive-repair", "servo-motor-repair", "vfd-repair", "hmi-repair"],
  },
  {
    slug: "aerospace", name: "Aerospace", color: "#38BDF8", image: "/industries/aerospace.webp", icon: "Plane",
    short: "Precision machining, composites and test stands.",
    intro: "Aerospace manufacturing relies on precision CNC machines, composite equipment and test stands. We repair the CNC controls, spindles, servo drives and motors with a test report on every unit.",
    equipment: ["5-axis machining centers", "Composite layup and cutting", "Test stands", "Riveting and drilling systems", "Spindles", "Coordinate measuring machines"],
    services: ["cnc-repair", "spindle-rebuild", "servo-drive-repair", "servo-motor-repair", "encoder-repair", "failure-analysis"],
  },
  {
    slug: "electronics", name: "Electronics & Semiconductor", color: "#8B5CF6", image: "/industries/electronics.webp", icon: "CircuitBoard",
    short: "Pick-and-place, reflow and test equipment.",
    intro: "Electronics assembly and semiconductor equipment use small, precise servo and stepper motion and industrial PCs. We repair the drives, motors, controllers and power supplies.",
    equipment: ["Pick-and-place machines", "Reflow ovens", "Test and inspection systems", "Wafer handling robots", "Stepper and linear motors", "Industrial PCs"],
    services: ["servo-drive-repair", "stepper-motor-repair", "linear-motor-repair", "power-supply-repair", "industrial-pc-repair", "controller-card-repair"],
  },
  {
    slug: "water-wastewater", name: "Water & Wastewater", color: "#0EA5E9", image: "/industries/water-wastewater.webp", icon: "Droplets",
    short: "Pump stations, blowers and treatment plants.",
    intro: "Water and wastewater plants run pumps and blowers on VFDs and soft starters. We repair the drives, motors, soft starters and PLCs that keep stations running.",
    equipment: ["Pump stations", "Aeration blowers", "Clarifiers and mixers", "Lift stations", "SCADA panels and PLCs", "Soft starters"],
    services: ["vfd-repair", "pump-fan-motor-repair", "soft-starter-repair", "industrial-motor-repair", "plc-repair", "ups-inverter-repair"],
  },
  {
    slug: "mining", name: "Mining & Aggregates", color: "#A3A3A3", image: "/industries/mining.webp", icon: "Pickaxe",
    short: "Crushers, conveyors, hoists and pumps.",
    intro: "Mines and aggregate plants run large motors and drives in harsh conditions. We repair VFDs, motors, soft starters and controls on crushers, conveyors, hoists and pumps.",
    equipment: ["Crushers and screens", "Overland conveyors", "Hoists", "Slurry pumps", "Mills", "Soft starters"],
    services: ["vfd-repair", "industrial-motor-repair", "motor-rewinding", "soft-starter-repair", "gearbox-repair", "pump-fan-motor-repair"],
  },
  {
    slug: "oil-gas", name: "Oil & Gas", color: "#EF4444", image: "/industries/oil-gas.webp", icon: "Flame",
    short: "Pumps, compressors and drilling equipment.",
    intro: "Oil and gas operations rely on drives, motors and controls for pumps, compressors and drilling equipment. We repair them at component level and test them before return.",
    equipment: ["Pumps and pump jacks", "Compressors", "Drilling equipment", "Pipeline stations", "Motor control", "UPS and power systems"],
    services: ["vfd-repair", "industrial-motor-repair", "pump-fan-motor-repair", "soft-starter-repair", "ups-inverter-repair", "plc-repair"],
  },
  {
    slug: "glass", name: "Glass", color: "#67E8F9", image: "/industries/glass.webp", icon: "GlassWater",
    short: "Forming machines, lehrs and cutting lines.",
    intro: "Glass plants use servo-driven forming machines, conveyors and cutting lines. We repair the servo drives, motors, controllers and temperature controls.",
    equipment: ["Forming machines", "Annealing lehrs", "Cutting and breaking lines", "Conveyors", "Robots and handling", "Temperature controllers"],
    services: ["servo-drive-repair", "servo-motor-repair", "temperature-controller-repair", "vfd-repair", "plc-repair", "hmi-repair"],
  },
  {
    slug: "textiles", name: "Textiles", color: "#F472B6", image: "/industries/textiles.webp", icon: "Shirt",
    short: "Spinning, weaving, knitting and finishing.",
    intro: "Textile machines run many motors and drives in sync. We repair the drives, motors, encoders and controls on spinning, weaving, knitting and finishing equipment.",
    equipment: ["Spinning machines", "Looms", "Knitting machines", "Dyeing and finishing", "Winders", "Web tension control"],
    services: ["vfd-repair", "servo-drive-repair", "industrial-motor-repair", "encoder-repair", "plc-repair", "hmi-repair"],
  },
  {
    slug: "machine-builders", name: "Machine Builders & OEMs", color: "#0066FF", image: "/industries/machine-builders.webp", icon: "Wrench",
    short: "Repair, spares and support for machines you build.",
    intro: "Machine builders and integrators need fast repairs and spares for the machines they support. We repair drives, motors, PLCs and HMIs from every major brand and can back up parameters and programs.",
    equipment: ["Special machines", "Assembly cells", "Test equipment", "Robot cells", "Retrofits", "Spare parts programs"],
    services: ["servo-drive-repair", "plc-repair", "hmi-repair", "parameter-backup", "drive-retrofit", "custom-cables"],
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
export const industryUrl = (slug: string) => `/industries/${slug}`;
