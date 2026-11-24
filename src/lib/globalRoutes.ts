/* ------------------------------------------------------------------ */
/*  Illustrative air routes for the "Serving Customers Worldwide"      */
/*  section. Parts ship worldwide by air; repairs are USA only.      */
/*  USA & Canada buy online; others contact us for a quote.  */
/*  Not live tracking. Add or remove a destination here.               */
/* ------------------------------------------------------------------ */
export type LatLng = [number, number];
export type Destination = { id: string; city: string; country: string; region: "Europe" | "Asia" | "North America"; at: LatLng };

export const origin = { city: "Grand Island, NY", at: [43.033, -78.964] as LatLng };

export const destinations: Destination[] = [
  { id: "london", city: "London", country: "United Kingdom", region: "Europe", at: [51.507, -0.128] },
  { id: "paris", city: "Paris", country: "France", region: "Europe", at: [48.857, 2.352] },
  { id: "frankfurt", city: "Frankfurt", country: "Germany", region: "Europe", at: [50.11, 8.682] },
  { id: "madrid", city: "Madrid", country: "Spain", region: "Europe", at: [40.417, -3.704] },
  { id: "milan", city: "Milan", country: "Italy", region: "Europe", at: [45.464, 9.19] },
  { id: "tokyo", city: "Tokyo", country: "Japan", region: "Asia", at: [35.68, 139.69] },
  { id: "seoul", city: "Seoul", country: "South Korea", region: "Asia", at: [37.566, 126.978] },
  { id: "delhi", city: "Delhi", country: "India", region: "Asia", at: [28.614, 77.209] },
  { id: "singapore", city: "Singapore", country: "Singapore", region: "Asia", at: [1.352, 103.82] },
  { id: "toronto", city: "Toronto", country: "Canada", region: "North America", at: [43.653, -79.383] },
  { id: "montreal", city: "Montreal", country: "Canada", region: "North America", at: [45.502, -73.567] },
  { id: "vancouver", city: "Vancouver", country: "Canada", region: "North America", at: [49.283, -123.121] },
  { id: "mexico-city", city: "Mexico City", country: "Mexico", region: "North America", at: [19.433, -99.133] },
  { id: "chicago", city: "Chicago", country: "USA", region: "North America", at: [41.878, -87.63] },
  { id: "houston", city: "Houston", country: "USA", region: "North America", at: [29.76, -95.37] },
  { id: "los-angeles", city: "Los Angeles", country: "USA", region: "North America", at: [34.052, -118.244] },
];
