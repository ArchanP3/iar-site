import { absoluteFor, hrefFor, onThisSite } from "./site";

/* ------------------------------------------------------------------ */
/*  Service area pages: /service-areas/<slug>.                          */
/*  IAR has ONE repair centre, in Mississauga, Ontario. These pages */
/*  never claim a local shop: they explain how units from each city     */
/*  reach Mississauga (drop-off, pickup, ship-in) and what we repair.   */
/*  dropOff = close enough that dropping a unit off is practical.       */
/*  industries = slugs from src/lib/industries.ts                       */
/*  country = which site the page lives on: CA -> industrialautomationrepair.com, */
/*  US -> industrialautomationrepair.com. The other site links to it and 301s.   */
/* ------------------------------------------------------------------ */

export type Area = {
  slug: string;
  city: string;
  region: string;
  regionCode: string;
  country: "CA" | "US";
  /** map position [lat, lng] */
  at: [number, number];
  dropOff?: boolean;
  /** one line about local manufacturing (general, no figures) */
  local: string;
  industries: string[];
};

export const areas: Area[] = [
  // Ontario
  { slug: "toronto", at: [43.653, -79.383], city: "Toronto", region: "Ontario", regionCode: "ON", country: "CA", dropOff: true, local: "The Greater Toronto Area runs a wide mix of manufacturing, from food processing and pharmaceuticals to plastics, packaging and printing.", industries: ["food-beverage", "pharmaceutical", "plastics", "packaging", "printing", "automotive"] },
  { slug: "brampton", at: [43.731, -79.762], city: "Brampton", region: "Ontario", regionCode: "ON", country: "CA", dropOff: true, local: "Brampton is home to automotive assembly, food processing, packaging lines and large distribution centres.", industries: ["automotive", "food-beverage", "packaging", "material-handling"] },
  { slug: "hamilton", at: [43.256, -79.869], city: "Hamilton", region: "Ontario", regionCode: "ON", country: "CA", dropOff: true, local: "Hamilton's steel mills, metal fabricators and food plants run heavy drives and motors around the clock.", industries: ["steel-metals", "metalworking", "food-beverage"] },
  { slug: "kitchener-waterloo", at: [43.452, -80.493], city: "Kitchener-Waterloo", region: "Ontario", regionCode: "ON", country: "CA", dropOff: true, local: "Kitchener, Waterloo and Cambridge build automotive parts, rubber products, food and the machines that make them.", industries: ["automotive", "tire-rubber", "food-beverage", "machine-builders"] },
  { slug: "london-ontario", at: [42.984, -81.246], city: "London", region: "Ontario", regionCode: "ON", country: "CA", dropOff: true, local: "London and southwestern Ontario run automotive parts, food processing and metalworking plants.", industries: ["automotive", "food-beverage", "metalworking"] },
  { slug: "windsor", at: [42.315, -83.036], city: "Windsor", region: "Ontario", regionCode: "ON", country: "CA", local: "Windsor is Canada's automotive capital, with assembly plants and a deep tool, die and mould-making industry.", industries: ["automotive", "plastics", "metalworking"] },
  { slug: "oshawa", at: [43.897, -78.866], city: "Oshawa", region: "Ontario", regionCode: "ON", country: "CA", dropOff: true, local: "Oshawa and Durham Region have a long automotive history, with parts suppliers and plastics moulders across the region.", industries: ["automotive", "plastics", "metalworking"] },
  { slug: "ottawa", at: [45.421, -75.697], city: "Ottawa", region: "Ontario", regionCode: "ON", country: "CA", local: "Ottawa and eastern Ontario combine electronics and technology manufacturing with food and pharmaceutical plants.", industries: ["electronics", "pharmaceutical", "food-beverage"] },
  // Quebec
  { slug: "montreal", at: [45.502, -73.567], city: "Montreal", region: "Quebec", regionCode: "QC", country: "CA", local: "Greater Montreal is a hub for aerospace, pharmaceuticals, food and beverage, and pulp and paper.", industries: ["aerospace", "pharmaceutical", "food-beverage", "pulp-paper", "printing"] },
  { slug: "quebec-city", at: [46.813, -71.208], city: "Quebec City", region: "Quebec", regionCode: "QC", country: "CA", local: "The Quebec City region runs pulp and paper mills, wood products plants and food processors.", industries: ["pulp-paper", "woodworking", "food-beverage"] },
  // Prairies
  { slug: "winnipeg", at: [49.895, -97.138], city: "Winnipeg", region: "Manitoba", regionCode: "MB", country: "CA", local: "Winnipeg builds aerospace parts, buses and agricultural equipment, alongside large food processors.", industries: ["aerospace", "machine-builders", "food-beverage"] },
  { slug: "saskatoon", at: [52.133, -106.67], city: "Saskatoon", region: "Saskatchewan", regionCode: "SK", country: "CA", local: "Saskatoon serves mining, agri-food processing and agricultural equipment makers across Saskatchewan.", industries: ["mining", "food-beverage", "machine-builders"] },
  { slug: "calgary", at: [51.045, -114.072], city: "Calgary", region: "Alberta", regionCode: "AB", country: "CA", local: "Calgary's plants span oil and gas equipment, food and beverage processing and packaging.", industries: ["oil-gas", "food-beverage", "packaging"] },
  { slug: "edmonton", at: [53.546, -113.494], city: "Edmonton", region: "Alberta", regionCode: "AB", country: "CA", local: "Edmonton is the centre of Alberta's oil and gas, petrochemical and industrial fabrication work.", industries: ["oil-gas", "steel-metals", "plastics"] },
  // West and East coasts
  { slug: "vancouver", at: [49.283, -123.121], city: "Vancouver", region: "British Columbia", regionCode: "BC", country: "CA", local: "Greater Vancouver and the Lower Mainland run sawmills, wood products, pulp and paper, food and packaging plants.", industries: ["woodworking", "pulp-paper", "food-beverage", "packaging"] },
  { slug: "halifax", at: [44.649, -63.576], city: "Halifax", region: "Nova Scotia", regionCode: "NS", country: "CA", local: "Halifax and Atlantic Canada run seafood and food processing plants, metal fabrication and port operations.", industries: ["food-beverage", "metalworking", "material-handling"] },
  // USA
  { slug: "detroit", at: [42.331, -83.046], city: "Detroit", region: "Michigan", regionCode: "MI", country: "US", local: "Detroit and southeast Michigan build cars, trucks and engines, with stamping, machining and plastics suppliers across the region.", industries: ["automotive", "metalworking", "plastics"] },
  { slug: "grand-rapids", at: [42.963, -85.668], city: "Grand Rapids", region: "Michigan", regionCode: "MI", country: "US", local: "Grand Rapids and west Michigan build office furniture, automotive parts and food products.", industries: ["woodworking", "automotive", "food-beverage"] },
  { slug: "buffalo", at: [42.886, -78.878], city: "Buffalo", region: "New York", regionCode: "NY", country: "US", local: "Buffalo and western New York run automotive parts, food processing and metal plants.", industries: ["automotive", "food-beverage", "steel-metals"] },
  { slug: "cleveland", at: [41.499, -81.694], city: "Cleveland", region: "Ohio", regionCode: "OH", country: "US", local: "Cleveland and northeast Ohio are known for steel, metalworking, plastics and polymers.", industries: ["steel-metals", "metalworking", "plastics"] },
  { slug: "toledo", at: [41.654, -83.537], city: "Toledo", region: "Ohio", regionCode: "OH", country: "US", local: "Toledo is a centre for glass making and automotive manufacturing.", industries: ["glass", "automotive", "plastics"] },
  { slug: "pittsburgh", at: [40.441, -79.996], city: "Pittsburgh", region: "Pennsylvania", regionCode: "PA", country: "US", local: "Pittsburgh and western Pennsylvania run steel, metals and glass plants.", industries: ["steel-metals", "glass", "metalworking"] },
  { slug: "chicago", at: [41.878, -87.63], city: "Chicago", region: "Illinois", regionCode: "IL", country: "US", local: "Chicagoland runs food processing, packaging, printing and metal fabrication plants across the region.", industries: ["food-beverage", "packaging", "printing", "metalworking"] },
  // USA wave 1 (Nov 2026): the model entries for new US cities, see docs/us-city-pages.md
  { slug: "columbus", at: [39.961, -82.999], city: "Columbus", region: "Ohio", regionCode: "OH", country: "US", local: "Columbus and central Ohio run automotive assembly and parts plants, food and beverage processors, and large warehouse and distribution centres serving the Midwest.", industries: ["automotive", "food-beverage", "material-handling", "packaging"] },
  { slug: "dayton", at: [39.758, -84.192], city: "Dayton", region: "Ohio", regionCode: "OH", country: "US", local: "Dayton and the Miami Valley make aerospace parts, auto parts, composite materials and industrial machinery.", industries: ["aerospace", "automotive", "machine-builders", "plastics"] },
  { slug: "cincinnati", at: [39.103, -84.512], city: "Cincinnati", region: "Ohio", regionCode: "OH", country: "US", local: "Greater Cincinnati makes aerospace parts, chemicals and specialty materials, food, flavourings and beverages, and automotive components.", industries: ["aerospace", "food-beverage", "automotive"] },
  { slug: "akron", at: [41.081, -81.519], city: "Akron", region: "Ohio", regionCode: "OH", country: "US", local: "Akron and the surrounding area make tires, rubber goods, polymers and plastics, along with specialty chemicals and aerospace and defence products.", industries: ["tire-rubber", "plastics", "aerospace"] },
  { slug: "indianapolis", at: [39.768, -86.158], city: "Indianapolis", region: "Indiana", regionCode: "IN", country: "US", local: "Indianapolis and central Indiana build engines, transmissions and automotive parts, make pharmaceuticals, and ship from busy distribution centres along the interstates.", industries: ["automotive", "pharmaceutical", "machine-builders", "material-handling"] },
  { slug: "fort-wayne", at: [41.079, -85.139], city: "Fort Wayne", region: "Indiana", regionCode: "IN", country: "US", local: "Fort Wayne and northeast Indiana build vehicles and automotive parts, aerospace and defence systems and medical devices, with steel, aluminum and food plants across the region.", industries: ["automotive", "aerospace", "steel-metals", "food-beverage"] },
  { slug: "milwaukee", at: [43.039, -87.906], city: "Milwaukee", region: "Wisconsin", regionCode: "WI", country: "US", local: "Milwaukee and southeast Wisconsin are known for industrial machinery and motion control, brewing and food processing, printing and metal fabrication.", industries: ["machine-builders", "food-beverage", "printing", "metalworking"] },
  { slug: "minneapolis", at: [44.978, -93.265], city: "Minneapolis", region: "Minnesota", regionCode: "MN", country: "US", local: "Minneapolis and the Twin Cities make medical devices and control equipment, process food and beverages, and build industrial machinery.", industries: ["electronics", "food-beverage", "machine-builders", "pharmaceutical"] },
  { slug: "lansing", at: [42.733, -84.556], city: "Lansing", region: "Michigan", regionCode: "MI", country: "US", local: "Lansing and mid-Michigan assemble vehicles with on-site stamping, and the region is building up battery manufacturing.", industries: ["automotive", "metalworking", "electronics"] },
  { slug: "flint", at: [43.013, -83.687], city: "Flint", region: "Michigan", regionCode: "MI", country: "US", local: "Flint and Genesee County build pickup trucks and vehicle seating, press metal parts, and make food products.", industries: ["automotive", "metalworking", "food-beverage"] },
];

export const getArea = (slug: string) => areas.find((a) => a.slug === slug);
export const areaUrl = (slug: string) => `/service-areas/${slug}`;
/** Is this city's page served by this site? (Always true before the .ca split.) */
export const areaHere = (a: Area) => onThisSite(a.country);
/** The cities this site shows (.ca: Canadian cities, .com: US cities; all of them before the split). */
export const areasHere = areas.filter(areaHere);
/** Link to a city page: a path on this site, the full address on the other country's site. */
export const areaHref = (a: Area) => hrefFor(areaUrl(a.slug), a.country);
/** Full address of a city page, for schema and sitemaps. */
export const areaAbs = (a: Area) => absoluteFor(areaUrl(a.slug), a.country);
export const countryName = (c: Area["country"]) => (c === "CA" ? "Canada" : "USA");
