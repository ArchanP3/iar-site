# Adding a city page (USA or Canada)

City pages live at `/service-areas/<slug>`. US cities are shown on **automiqautomation.com**, Canadian cities on **automiqautomation.ca**. The other domain links to them and redirects to the right site, so you never handle that yourself.

One city = one line in `src/lib/serviceAreas.ts`. The page template (`src/app/service-areas/[city]/page.tsx`) does the rest: title, meta description, pickup and customs wording for US cities, FAQ, schema, the map and directory on `/service-areas`, the home page band, the HTML site map and the XML sitemap.

Both files are code-owned, so your pull request waits for the Super Admin's review before it merges.

## Copy one of the examples

Columbus, Indianapolis and Milwaukee (USA wave 1) are the models:

```ts
{ slug: "columbus", at: [39.961, -82.999], city: "Columbus", region: "Ohio", regionCode: "OH", country: "US", local: "Columbus and central Ohio run automotive assembly and parts plants, food and beverage processors, and large warehouse and distribution centres serving the Midwest.", industries: ["automotive", "food-beverage", "material-handling", "packaging"] },
```

| Field | Rule |
|---|---|
| `slug` | Lowercase, hyphens, the city name only (`fort-wayne`). Add the state only if the name is ambiguous (`london-ontario`). **Never change a slug after it is live**: it is the page's address. |
| `at` | `[latitude, longitude]` of the city centre, 3 decimals. Used for the map dot. |
| `city` | Name as people search it (`Fort Wayne`). |
| `region` / `regionCode` | Full state or province name, and its 2-letter code (`Indiana`, `IN`). |
| `country` | `"US"` or `"CA"`. This decides which site shows the page. |
| `dropOff` | Set `true` only for cities close enough to drive to our Grand Island, NY repair centre (e.g. Buffalo). |
| `local` | One or two sentences on the kinds of manufacturing in and around the city. See the writing rules below. |
| `industries` | 3 or 4 slugs from `src/lib/industries.ts`, most relevant first. A slug that isn't in that file is silently dropped from the page, so copy them exactly. |

Put the line in the USA block (or the right province block), grouped with its state.

## Writing rules for `local`

Google ranks city pages that say something true and specific about the place. It demotes near-identical pages with only the city name swapped (doorway pages).

- Write about the city's real industries: what is made there and which kinds of plants run there. Check one or two sources before you write it.
- Make it different from every other city in the same state. Read the neighbours' lines, because they appear together under "Also in Ohio".
- No numbers or rankings ("3rd largest", "500 plants"), no company names, no customer names, unless the team gives them to you.
- Never suggest we are local. No "our Columbus shop" or "local technicians". Every repair happens at our one repair centre in Grand Island, New York. The template already says this, so don't contradict it.
- No promised transit or turnaround times. The template covers turnaround; transit times come from the team only.
- Plain English, no hype words ("leading", "world-class", "premier").

## USA wave 1: still to add

Wave 1 still needs these 7 cities: Dayton (OH), Cincinnati (OH), Akron (OH), Fort Wayne (IN), Minneapolis (MN), Lansing (MI), Flint (MI).

Watch for:
- Ohio will have six cities: make sure each `local` line reads differently.
- Michigan already has Detroit and Grand Rapids.

## Pull request checklist

1. Start from the latest `main` (`git pull origin main`). Never from an old copy.
2. Only `src/lib/serviceAreas.ts` changes (unless you were asked for more).
3. `npm run typecheck` and `npm run lint` pass.
4. On the preview link, open each new city page and check:
   - the title and text show the right city and state code;
   - the industry chips all appear (3 or 4, none missing);
   - US cities show the "Shipping from … to Canada" box;
   - the dot sits in the right place on the `/service-areas` map.
5. In the PR description, list the cities and the sources you checked for each `local` line.
