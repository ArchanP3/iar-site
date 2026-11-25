import type { Area } from "./serviceAreas";
import { SITE_COUNTRY } from "./site";

/* Region colours for the Service Areas page (cards, filter tabs and map dots).
   Each country site groups only its own cities: provinces on .ca, states on .com. */
export type Region = { key: string; label: string; color: string; match: (a: Area) => boolean };

const CANADA: Region[] = [
  { key: "on", label: "Ontario", color: "#E11D3A", match: (a) => a.region === "Ontario" },
  { key: "qc", label: "Quebec", color: "#E11D3A", match: (a) => a.region === "Quebec" },
  { key: "west", label: "Western Canada", color: "#E11D3A", match: (a) => ["Manitoba", "Saskatchewan", "Alberta", "British Columbia"].includes(a.region) },
  { key: "atl", label: "Atlantic Canada", color: "#E11D3A", match: (a) => ["Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island"].includes(a.region) },
];

const inUS = (a: Area, codes: string[]) => a.country === "US" && codes.includes(a.regionCode);
const USA: Region[] = [
  { key: "ne", label: "Northeast", color: "#E11D3A", match: (a) => inUS(a, ["NY", "PA", "NJ", "MA", "CT", "RI", "NH", "VT", "ME", "MD", "DE"]) },
  { key: "gl", label: "Great Lakes", color: "#E11D3A", match: (a) => inUS(a, ["MI", "OH", "IN", "IL", "WI", "MN"]) },
  { key: "plains", label: "Central Plains", color: "#E11D3A", match: (a) => inUS(a, ["IA", "MO", "KS", "NE", "ND", "SD"]) },
  { key: "se", label: "Southeast", color: "#E11D3A", match: (a) => inUS(a, ["KY", "TN", "AL", "MS", "GA", "FL", "SC", "NC", "VA", "WV"]) },
  { key: "sc", label: "Texas & South Central", color: "#E11D3A", match: (a) => inUS(a, ["TX", "OK", "LA", "AR"]) },
  { key: "west", label: "West", color: "#E11D3A", match: (a) => inUS(a, ["CA", "OR", "WA", "AZ", "NV", "UT", "CO", "NM", "ID", "MT", "WY", "AK", "HI"]) },
];

export const REGIONS: Region[] =
  SITE_COUNTRY === "CA" ? CANADA : USA; // repairs are USA-only
export const regionColor = (a: Area) => REGIONS.find((r) => r.match(a))?.color ?? "#F31D3D";
/** Regions that have at least one of these cities (for filter tabs and map legends). */
export const regionsIn = (list: Area[]) => REGIONS.filter((r) => list.some(r.match));
