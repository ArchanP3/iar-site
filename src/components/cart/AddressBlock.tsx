"use client";

import { input, label } from "@/components/request/FormParts";

/* Canada / USA address with a province-or-state dropdown and postal / ZIP checking,
   so addresses arrive complete and in the right format. */

export type Country = "Canada" | "United States" | "Other";

const provinces = [
  "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories",
  "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon",
];
const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
  "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const postal = {
  Canada: { label: "Postal code", pattern: "[A-Za-z]\\d[A-Za-z] ?\\d[A-Za-z]\\d", hint: "e.g. L5T 2N4", title: "Canadian postal code, e.g. L5T 2N4" },
  "United States": { label: "ZIP code", pattern: "\\d{5}(-\\d{4})?", hint: "e.g. 48226", title: "5-digit ZIP code, e.g. 48226" },
};

/** prefix: id prefix; name: field name prefix in the email ("Ship", "Bill"); section: autocomplete section */
export default function AddressBlock({ prefix, name, section, country, onCountry }: {
  prefix: string; name: string; section: "shipping" | "billing"; country: Country; onCountry: (c: Country) => void;
}) {
  const f = (id: string) => `${prefix}-${id}`;
  const ac = (t: string) => `${section} ${t}`;
  const options: Country[] = section === "shipping" ? ["Canada", "United States", "Other"] : ["Canada", "United States"];
  const other = country === "Other";
  const p = postal[other ? "Canada" : country];
  const regionLabel = country === "Canada" ? "Province" : "State";
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      <div className="sm:col-span-6">
        <p className={label}>Country *</p>
        <input type="hidden" name={`${name} country`} value={country} />
        <div className={`grid gap-2 ${options.length === 3 ? "max-w-140 grid-cols-3" : "max-w-105 grid-cols-2"}`} role="radiogroup" aria-label={`${name === "Ship" ? "Shipping" : "Billing"} country`}>
          {options.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={country === c} onClick={() => onCountry(c)}
              className={`h-11 rounded-xl border text-[14px] font-bold transition ${country === c ? "border-[#0066FF] bg-[#0066FF]/6 text-[#0052CC] ring-4 ring-[#0066FF]/10" : "border-[#D9E4F1] bg-white text-[#0B1A3C] hover:border-[#0066FF]/40"}`}>
              {c === "Canada" ? "Canada" : c === "United States" ? "USA" : "Other country"}
            </button>
          ))}
        </div>
      </div>
      {!other && (
        <>
      <div className="sm:col-span-4"><label className={label} htmlFor={f("street")}>Street address *</label><input id={f("street")} name={`${name} street`} required className={input} autoComplete={ac("address-line1")} /></div>
      <div className="sm:col-span-2"><label className={label} htmlFor={f("suite")}>Unit / dock <span className="font-normal text-[#52647F]">(optional)</span></label><input id={f("suite")} name={`${name} unit or dock`} className={input} autoComplete={ac("address-line2")} /></div>
      <div className="sm:col-span-2"><label className={label} htmlFor={f("city")}>City *</label><input id={f("city")} name={`${name} city`} required className={input} autoComplete={ac("address-level2")} /></div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor={f("region")}>{regionLabel} *</label>
        <select key={country} id={f("region")} name={`${name} ${regionLabel.toLowerCase()}`} required defaultValue="" className={input} autoComplete={ac("address-level1")}>
          <option value="" disabled>Select…</option>
          {(country === "Canada" ? provinces : states).map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor={f("postal")}>{p.label} *</label>
        <input key={country} id={f("postal")} name={`${name} ${p.label.toLowerCase()}`} required pattern={p.pattern} title={p.title} placeholder={p.hint}
          onBlur={(e) => { e.currentTarget.value = e.currentTarget.value.trim().toUpperCase(); }}
          inputMode={country === "Canada" ? "text" : "numeric"} className={`${input} uppercase placeholder:normal-case`} autoComplete={ac("postal-code")} />
      </div>
        </>
      )}
    </div>
  );
}
