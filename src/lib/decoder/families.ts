/*
 * Model code decoder: one entry per product family.
 *
 * Every option below comes from the manufacturer's published ordering / type-code pages, written in our own
 * words (no copied text or tables). Each family names the manual edition it is based on, so newer options can be
 * added later. Only decode what the manual clearly lists: if a letter isn't listed, the decoder says so instead
 * of guessing.
 *
 * To add a family: add an object to `families` below. The page, the brand-page links and the reference tables
 * pick it up automatically.
 */

export type Field = { label: string; code: string; value: string; detail?: string };
export type Segment = { code: string; label: string };
export type Decoded = { segments: Segment[]; fields: Field[]; problems: string[]; notes: string[]; complete: boolean };

export type Family = {
  id: string; // URL anchor, e.g. "rexroth-mkd"
  brand: string;
  brandSlug: string;
  series: string; // matches the series chip on the brand page
  name: string; // e.g. "MKD synchronous servo motors"
  /** Motor or drive: picks the repair service link and the wording ("this motor" / "this drive"). */
  kind: "motor" | "drive";
  /** What "Browse parts" searches the shop for (defaults to the series name). */
  shopQuery?: string;
  source: string; // which manual / edition this is based on
  examples: string[];
  /** Normalised code starts with this, so we know which family to try. */
  prefix: RegExp;
  decode: (code: string) => Decoded | null;
  reference: { title: string; columns: string[]; rows: string[][]; note?: string };
  keys: { title: string; rows: [string, string][] }[];
};

const opt = (map: Record<string, string>, k: string | undefined) => (k ? map[k] : undefined);

/** Upper-case, unify dashes, drop spaces. */
export const normalize = (raw: string) =>
  raw.toUpperCase().replace(/[‐-―−]/g, "-").replace(/\s+/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");

/* ------------------------------------------------------------------ */
/* Rexroth Indramat MKD (Project Planning Manual, Edition 07, 05/2004) */
/* ------------------------------------------------------------------ */

type MkdFrame = {
  flange: string; centering: string;
  lengths: Record<string, { torque: string; windings: string[] }>;
  brakes: Record<string, { torque: string; lengths?: string[] }>;
  connectors: Record<string, string>;
  designs: string[];
};

const mkdFrames: Record<string, MkdFrame> = {
  "025": { flange: "54 mm", centering: "40 mm", lengths: { A: { torque: "0.4 Nm", windings: ["144"] }, B: { torque: "0.9 Nm", windings: ["058", "144"] } }, brakes: { "1": { torque: "1 Nm", lengths: ["B"] } }, connectors: { K: "Terminal box (supplied facing side B)", U: "Connector that turns through 270°" }, designs: ["N", "S"] },
  "041": { flange: "82 mm", centering: "50 mm", lengths: { B: { torque: "2.7 Nm", windings: ["058", "143", "144"] } }, brakes: { "1": { torque: "2.2 Nm" } }, connectors: { K: "Terminal box (supplied facing side B)" }, designs: ["N", "S"] },
  "071": { flange: "115 mm", centering: "95 mm", lengths: { B: { torque: "8.0 Nm", windings: ["024", "035", "061"] } }, brakes: { "1": { torque: "5 Nm" }, "3": { torque: "10 Nm" } }, connectors: { K: "Terminal box (supplied facing side B)" }, designs: ["N", "S"] },
  "090": { flange: "140 mm", centering: "110 mm", lengths: { B: { torque: "12.0 Nm", windings: ["035", "046", "047", "058"] } }, brakes: { "1": { torque: "11 Nm" }, "2": { torque: "18 Nm" } }, connectors: { K: "Terminal box (supplied facing side B)" }, designs: ["N", "S"] },
  "112": {
    flange: "192 mm", centering: "130 mm",
    lengths: { A: { torque: "15 Nm", windings: ["024", "058"] }, B: { torque: "28 Nm", windings: ["024", "048", "058"] }, C: { torque: "38 Nm", windings: ["024", "058"] }, D: { torque: "48 Nm", windings: ["027"] } },
    brakes: { "1": { torque: "22 Nm", lengths: ["A", "B"] }, "2": { torque: "32 Nm", lengths: ["A", "B"] }, "3": { torque: "70 Nm", lengths: ["C", "D"] } },
    connectors: { A: "Power connector facing side A", B: "Power connector facing side B", L: "Power connector facing left", R: "Power connector facing right" },
    designs: ["N"],
  },
};

const mkdFeedback: Record<string, string> = { G: "Resolver feedback (relative position)", K: "Resolver with integrated multiturn absolute encoder" };
const mkdShaft: Record<string, string> = { G: "Plain shaft with shaft sealing ring", P: "Shaft with key (DIN 6885-1) and shaft sealing ring" };
const mkdDesign: Record<string, string> = { N: "Standard housing", S: "Ex version for potentially explosive atmospheres (category 3, gas and dust)" };

const mkd: Family = {
  id: "rexroth-mkd",
  brand: "Rexroth Indramat",
  brandSlug: "rexroth-indramat",
  series: "MKD",
  kind: "motor",
  name: "MKD synchronous servo motors",
  source: "Rexroth MKD synchronous motors, Project Planning Manual, Edition 07 (05/2004)",
  examples: ["MKD112B-048-KG1-AN", "MKD071B-061-KP1-KN", "MKD025B-144-GG0-KN"],
  prefix: /^MKD/,
  decode(code) {
    const m = /^MKD(\d{3})?([A-Z])?(?:-(\d{3}))?(?:-([A-Z])?([A-Z])?(\d)?)?(?:-([A-Z])?([A-Z])?)?$/.exec(code);
    if (!m) return null;
    const [, size, len, wind, fb, shaft, brake, conn, design] = m;
    const segments: Segment[] = [{ code: "MKD", label: "Series" }];
    const fields: Field[] = [];
    const problems: string[] = [];
    const notes: string[] = [];
    const f = size ? mkdFrames[size] : undefined;
    if (size) {
      segments.push({ code: size, label: "Frame" });
      if (f) fields.push({ label: "Frame size", code: size, value: `MKD${size}`, detail: `${f.flange} flange, ${f.centering} centering diameter.` });
      else problems.push(`Frame "${size}" isn't an MKD size (025, 041, 071, 090, 112).`);
    }
    const l = f && len ? f.lengths[len] : undefined;
    if (len) {
      segments.push({ code: len, label: "Length" });
      if (l) fields.push({ label: "Length", code: len, value: `${len} · ${l.torque}`, detail: "Continuous torque at standstill, natural convection." });
      else if (f) problems.push(`Length "${len}" isn't listed for the MKD${size} (${Object.keys(f.lengths).join(", ")}).`);
    }
    if (wind) {
      segments.push({ code: wind, label: "Winding" });
      const ok = l?.windings.includes(wind);
      fields.push({ label: "Winding", code: wind, value: wind, detail: l ? `Sets the speed and current data. The MKD${size}${len} lists ${l.windings.join(", ")}.` : "Sets the speed and current data." });
      if (l && !ok) problems.push(`Winding ${wind} isn't listed for the MKD${size}${len}.`);
      if (wind === "143") notes.push("Winding 143 is the same as 144 but not lacquered, and only comes in the standard housing (N).");
      if (wind === "046") notes.push("Winding 046 is the same as 047 but not painted, and only comes in the standard housing (N).");
    }
    if (fb) {
      segments.push({ code: fb, label: "Feedback" });
      const v = opt(mkdFeedback, fb);
      if (v) fields.push({ label: "Feedback", code: fb, value: fb === "K" ? "Multiturn absolute" : "Resolver", detail: fb === "K" ? `${v}. Keeps its absolute position over more than 4,096 turns, backed by a battery.` : `${v}. Position is found again after power-up.` });
      else problems.push(`Feedback "${fb}" isn't listed (G or K).`);
    }
    if (shaft) {
      segments.push({ code: shaft, label: "Shaft" });
      const v = opt(mkdShaft, shaft);
      if (v) fields.push({ label: "Shaft", code: shaft, value: shaft === "P" ? "Keyed shaft" : "Plain shaft", detail: `${v}.` });
      else problems.push(`Shaft "${shaft}" isn't listed (G or P).`);
    }
    if (brake) {
      segments.push({ code: brake, label: "Brake" });
      if (brake === "0") fields.push({ label: "Holding brake", code: "0", value: "No brake" });
      else {
        const b = f?.brakes[brake];
        if (b) {
          fields.push({ label: "Holding brake", code: brake, value: `${b.torque} brake`, detail: "24 V DC holding brake: it holds the axis when the power is off and opens when 24 V is applied." });
          if (b.lengths && len && !b.lengths.includes(len)) problems.push(`The ${b.torque} brake (${brake}) is only listed for length ${b.lengths.join(" or ")}.`);
        } else if (f) problems.push(`Brake option "${brake}" isn't listed for the MKD${size}.`);
      }
    }
    if (conn) {
      segments.push({ code: conn, label: "Connector" });
      const v = f ? f.connectors[conn] : undefined;
      if (v) fields.push({ label: "Power connection", code: conn, value: v, detail: size === "112" ? "Seen from the front, looking at the shaft end." : undefined });
      else if (f) problems.push(`Connection "${conn}" isn't listed for the MKD${size} (${Object.keys(f.connectors).join(", ")}).`);
    }
    if (design) {
      segments.push({ code: design, label: "Design" });
      const v = opt(mkdDesign, design);
      if (v && (!f || f.designs.includes(design))) fields.push({ label: "Housing", code: design, value: design === "N" ? "Standard" : "Ex version", detail: `${v}.` });
      else problems.push(`Housing "${design}" isn't listed for the MKD${size ?? ""}.`);
      if ((wind === "143" || wind === "046") && design !== "N") problems.push(`Winding ${wind} only comes in the standard housing (N).`);
    }
    return { segments, fields, problems, notes, complete: Boolean(size && len && wind && fb && shaft && brake && conn && design) };
  },
  reference: {
    title: "MKD frame sizes at a glance",
    columns: ["Frame", "Flange", "Centering Ø", "Lengths & continuous torque", "Brake options"],
    rows: Object.entries(mkdFrames).sort(([a], [b]) => a.localeCompare(b)).map(([s, f]) => [
      `MKD${s}`, f.flange, f.centering,
      Object.entries(f.lengths).map(([k, v]) => `${k} ${v.torque}`).join(" · "),
      Object.values(f.brakes).map((b) => b.torque).join(" · "),
    ]),
    note: "Continuous torque at standstill, natural convection.",
  },
  keys: [
    { title: "Feedback", rows: [["G", "Resolver, relative position"], ["K", "Resolver + multiturn absolute encoder (battery backed)"]] },
    { title: "Shaft & brake", rows: [["G / P", "Plain shaft / keyed shaft, both with a shaft seal"], ["0", "No holding brake"], ["1 · 2 · 3", "Holding brake, size depends on the frame"]] },
    { title: "Connection & housing", rows: [["K · U", "Terminal box / connector turning 270° (MKD025–090)"], ["A · B · L · R", "Connector side (MKD112)"], ["N · S", "Standard housing / Ex version"]] },
  ],
};

/* ------------------------------------------------------------------ */
/* Siemens 1FK7 (SINAMICS S120 Configuration Manual, Edition 12/2006) */
/* ------------------------------------------------------------------ */

const fk7ShaftHeight: Record<string, string> = { "01": "20", "02": "28", "03": "36", "04": "48", "06": "63", "08": "80", "10": "100" };
const fk7Speed: Record<string, string> = { C: "2000 rpm", F: "3000 rpm", H: "4500 rpm", K: "6000 rpm" };
const fk7Encoder: Record<string, { v: string; cliq: boolean }> = {
  A: { v: "Incremental encoder sin/cos 1 Vpp, 2048 pulses/rev", cliq: false },
  E: { v: "Absolute encoder EnDat, 2048 pulses/rev", cliq: false },
  H: { v: "Absolute encoder EnDat, 512 pulses/rev", cliq: false },
  G: { v: "Basic absolute encoder EnDat, 32 pulses/rev", cliq: false },
  S: { v: "Multi-pole resolver", cliq: false },
  T: { v: "2-pole resolver", cliq: false },
  D: { v: "Incremental encoder sin/cos 1 Vpp, 2048 pulses/rev", cliq: true },
  F: { v: "Absolute encoder EnDat, 2048 pulses/rev", cliq: true },
  L: { v: "Absolute encoder EnDat, 512 pulses/rev", cliq: true },
  K: { v: "Basic absolute encoder EnDat, 32 pulses/rev", cliq: true },
  U: { v: "Multi-pole resolver", cliq: true },
  P: { v: "2-pole resolver", cliq: true },
};
const fk7ShaftBrake: Record<string, { shaft: string; brake: string }> = {
  A: { shaft: "Fitted key and keyway", brake: "No holding brake" },
  B: { shaft: "Fitted key and keyway", brake: "With holding brake" },
  G: { shaft: "Plain shaft", brake: "No holding brake" },
  H: { shaft: "Plain shaft", brake: "With holding brake" },
};
const fk7Protection: Record<string, string> = {
  "0": "IP64",
  "2": "IP65, drive-end flange IP67",
  "3": "IP64, anthracite paint finish",
  "5": "IP65, drive-end flange IP67, anthracite paint finish",
};

/** Ratings per base model: [static torque M0, rated torque, rated power kW, rated current A] at ΔT = 100 K. */
const fk7Models: Record<string, [string, string, string, string]> = {
  // Compact, 3 AC 400/480 V
  "1FK7105-5AC71": ["48", "37", "7.75", "16"],
  "1FK7042-5AF71": ["3", "2.6", "0.82", "1.95"], "1FK7060-5AF71": ["6", "4.7", "1.48", "3.7"], "1FK7063-5AF71": ["11", "7.3", "2.29", "5.6"],
  "1FK7080-5AF71": ["8", "6.8", "2.14", "4.4"], "1FK7083-5AF71": ["16", "10.5", "3.3", "7.4"], "1FK7100-5AF71": ["18", "12", "3.77", "8"],
  "1FK7101-5AF71": ["27", "15.5", "4.87", "11.8"], "1FK7103-5AF71": ["36", "20.5", "5.37", "16.5"], "1FK7105-5AF71": ["48", "26", "8.17", "18"],
  "1FK7060-5AH71": ["6", "3.7", "1.74", "4.1"], "1FK7063-5AH71": ["11", "5", "2.09", "6.1"], "1FK7080-5AH71": ["8", "5.7", "2.39", "5.6"], "1FK7083-5AH71": ["16", "8.3", "3.04", "9"],
  "1FK7011-5AK71": ["0.18", "0.08", "0.05", "0.85"], "1FK7015-5AK71": ["0.35", "0.16", "0.10", "0.85"], "1FK7022-5AK71": ["0.85", "0.6", "0.43", "1.4"],
  "1FK7032-5AK71": ["1.1", "0.8", "0.50", "1.3"], "1FK7034-5AK71": ["1.6", "1", "0.63", "1.3"], "1FK7040-5AK71": ["1.6", "1.1", "0.69", "1.7"], "1FK7042-5AK71": ["3", "1.95", "1.02", "3.1"],
  // High Dynamic, 3 AC 400/480 V
  "1FK7044-7AF71": ["4", "3.5", "1.1", "4"], "1FK7061-7AF71": ["6.4", "5.4", "1.7", "5.3"], "1FK7064-7AF71": ["12", "8", "2.51", "7.5"],
  "1FK7085-7AF71": ["22", "12", "3.14", "12.5"], "1FK7086-7AF71": ["28", "18", "3.77", "14.5"],
  "1FK7043-7AH71": ["3.1", "2.6", "1.23", "4"], "1FK7044-7AH71": ["4", "3", "1.41", "4.9"], "1FK7061-7AH71": ["6.4", "4.3", "2.03", "5.9"], "1FK7064-7AH71": ["12", "5", "2.36", "7"],
  "1FK7033-7AK71": ["1.3", "0.9", "0.57", "1.5"], "1FK7043-7AK71": ["3.1", "2", "1.26", "4.4"],
  // Compact / High Dynamic on 1 AC 230 V Power Module
  "1FK7032-5AF21": ["1.15", "1.0", "0.31", "1.6"], "1FK7033-7AF21": ["1.3", "1.2", "0.38", "2"], "1FK7034-5AF21": ["1.6", "1.45", "0.46", "1.8"],
  "1FK7042-5AF21": ["3", "2.6", "0.82", "3.5"], "1FK7043-7AF21": ["2.7", "2.5", "0.79", "3.8"],
  "1FK7011-5AK21": ["0.18", "0.08", "0.05", "0.5"], "1FK7015-5AK21": ["0.35", "0.16", "0.1", "0.5"], "1FK7022-5AK21": ["0.85", "0.6", "0.38", "1.4"],
};

const fk7: Family = {
  id: "siemens-1fk7",
  brand: "Siemens",
  brandSlug: "siemens",
  series: "1FK7",
  kind: "motor",
  name: "1FK7 synchronous servo motors (Compact and High Dynamic)",
  source: "Siemens 1FK7 synchronous motors, SINAMICS S120 Configuration Manual, Edition 12/2006",
  examples: ["1FK7063-5AF71-1AA0", "1FK7083-5AH71-1DH2", "1FK7044-7AF71-1TB5"],
  prefix: /^1FK7/,
  decode(code) {
    const m = /^1FK7(\d{2})?(\d)?(?:-([57])?(A)?([A-Z])?([27])?(1)?)?(?:-(1)?([A-Z])?([A-Z])?(\d)?)?$/.exec(code);
    if (!m) return null;
    const [, sh, len, type, , speed, volt, , , enc, sb, prot] = m;
    const segments: Segment[] = [{ code: "1FK7", label: "Series" }];
    const fields: Field[] = [];
    const problems: string[] = [];
    const notes: string[] = [];
    if (sh) {
      segments.push({ code: sh, label: "Shaft height" });
      const h = fk7ShaftHeight[sh];
      if (h) fields.push({ label: "Shaft height", code: sh, value: `SH ${h}`, detail: `${h} mm shaft height.` });
      else problems.push(`"${sh}" isn't a 1FK7 shaft height code in this manual.`);
    }
    if (len) { segments.push({ code: len, label: "Length" }); fields.push({ label: "Length", code: len, value: len, detail: "Overall length within the frame: higher numbers give more torque." }); }
    if (type) {
      segments.push({ code: `${type}A`, label: "Type" });
      fields.push({ label: "Type", code: `${type}A`, value: type === "5" ? "Compact" : "High Dynamic", detail: type === "5" ? "Compact motor: high torque in a short housing." : "High Dynamic motor: low rotor inertia for fast acceleration." });
    }
    if (speed) {
      segments.push({ code: speed, label: "Speed" });
      const v = fk7Speed[speed];
      if (v) fields.push({ label: "Rated speed", code: speed, value: v });
      else problems.push(`Speed letter "${speed}" isn't listed (C, F, H or K).`);
    }
    if (volt) {
      segments.push({ code: `${volt}1`, label: "Supply" });
      fields.push({ label: "Supply", code: `${volt}1`, value: volt === "7" ? "3 AC 400/480 V" : "1 AC 230 V", detail: volt === "7" ? "For SINAMICS S120 Motor Modules on a 3-phase 400/480 V supply." : "For the SINAMICS S120 Power Module on a single-phase 230 V supply." });
    }
    const base = sh && len && type && speed && volt ? `1FK7${sh}${len}-${type}A${speed}${volt}1` : undefined;
    if (base) {
      const r = fk7Models[base];
      if (r) fields.push({ label: "Ratings (ΔT = 100 K)", code: base, value: `${r[0]} Nm static · ${r[1]} Nm rated`, detail: `${r[2]} kW rated power, ${r[3]} A rated current.` });
      else problems.push(`${base} isn't in this manual's ordering tables. It may be a newer or special model.`);
    }
    if (enc) {
      segments.push({ code: enc, label: "Encoder" });
      const e = fk7Encoder[enc];
      if (e) fields.push({ label: "Encoder", code: enc, value: e.v, detail: e.cliq ? "With DRIVE-CLiQ interface: the encoder connects straight to the drive over DRIVE-CLiQ." : "Without DRIVE-CLiQ: connected through a Sensor Module (SMC) or a conventional encoder cable." });
      else problems.push(`Encoder letter "${enc}" isn't listed.`);
      if (e?.cliq && sh === "01") problems.push("Shaft height 20 motors aren't listed with a DRIVE-CLiQ interface.");
      if (e) notes.push("Some encoder options are limited to certain frame sizes. Check the exact combination before ordering.");
    }
    if (sb) {
      segments.push({ code: sb, label: "Shaft / brake" });
      const s = fk7ShaftBrake[sb];
      if (s) fields.push({ label: "Shaft & brake", code: sb, value: s.shaft, detail: `${s.brake}.` });
      else problems.push(`Shaft/brake letter "${sb}" isn't listed (A, B, G or H).`);
    }
    if (prot) {
      segments.push({ code: prot, label: "Protection" });
      const p = fk7Protection[prot];
      if (p) fields.push({ label: "Degree of protection", code: prot, value: p, detail: sh === "01" && prot === "3" ? "IP54 on shaft height 20 motors." : undefined });
      else problems.push(`Protection digit "${prot}" isn't listed (0, 2, 3 or 5).`);
      if (volt === "2" && p && prot !== "0" && prot !== "3") problems.push("On the 1 AC 230 V version, only protection 0 and 3 are listed.");
    }
    return { segments, fields, problems, notes, complete: Boolean(base && enc && sb && prot) };
  },
  reference: {
    title: "1FK7 models in this manual",
    columns: ["Model", "Type", "Speed", "Static torque", "Rated power"],
    rows: Object.entries(fk7Models).map(([k, r]) => [`${k}-1…`, k[8] === "5" ? "Compact" : "High Dynamic", fk7Speed[k[10]] + (k[11] === "2" ? " · 230 V" : ""), `${r[0]} Nm`, `${r[2]} kW`]),
    note: "Static torque and rated power at ΔT = 100 K, natural cooling.",
  },
  keys: [
    { title: "Speed & supply", rows: [["C · F · H · K", "2000 · 3000 · 4500 · 6000 rpm"], ["71", "3 AC 400/480 V"], ["21", "1 AC 230 V Power Module"]] },
    { title: "Encoder", rows: [["A · E · H · G", "Incremental 2048 / EnDat 2048 / EnDat 512 / basic absolute 32"], ["S · T", "Multi-pole / 2-pole resolver"], ["D · F · L · K · U · P", "Same encoders with DRIVE-CLiQ"]] },
    { title: "Shaft, brake & protection", rows: [["A · B", "Keyed shaft, without / with brake"], ["G · H", "Plain shaft, without / with brake"], ["0 · 2 · 3 · 5", "IP64 / IP65 (IP67 flange) / with anthracite paint"]] },
  ],
};

/* ------------------------------------------------------------------ */
/* Allen-Bradley Kinetix MPL, 63 & 75 mm frames (MP-IN006, 09/2024)   */
/* ------------------------------------------------------------------ */

const mplFrame: Record<string, string> = { "15": "63 mm", "2": "75 mm" };
const mplSpeed: Record<string, string> = { P: "5000 rpm", T: "6000 rpm", U: "7000 rpm", V: "8000 rpm" };
const mplFeedback: Record<string, string> = { E: "Single-turn high-resolution encoder", H: "2000-line encoder", V: "Multi-turn high-resolution encoder" };

const mpl: Family = {
  id: "allen-bradley-mpl",
  brand: "Allen-Bradley",
  brandSlug: "allen-bradley",
  series: "MPL",
  kind: "motor",
  name: "Kinetix MPL low-inertia servo motors, 63 and 75 mm frames",
  source: "Kinetix MPL low-inertia servo motors with 75 mm or smaller frame sizes, Installation Instructions MP-IN006 (09/2024)",
  examples: ["MPL-B220T-VJ72AA", "MPL-A1520U-EJ74AA", "MPL-B230P-HJ72AA"],
  prefix: /^MPL/,
  decode(code) {
    const m = /^MPL(?:-([A-Z])?(15|2)?(\d{2})?([A-Z])?)?(?:-([A-Z])?([A-Z])?(\d)?(\d)?([A-Z])?([A-Z])?)?$/.exec(code);
    if (!m) return null;
    const [, volt, frame, stack, speed, fb, shaft, conn, brake, flange, opts] = m;
    const segments: Segment[] = [{ code: "MPL", label: "Series" }];
    const fields: Field[] = [];
    const problems: string[] = [];
    const notes: string[] = [];
    if (volt) {
      segments.push({ code: volt, label: "Voltage" });
      if (volt === "A" || volt === "B") fields.push({ label: "Voltage class", code: volt, value: volt === "A" ? "200 V" : "400 V" });
      else problems.push(`Voltage letter "${volt}" isn't listed (A or B).`);
    }
    if (frame) {
      segments.push({ code: frame, label: "Frame" });
      fields.push({ label: "Frame size", code: frame, value: mplFrame[frame], detail: "IEC 72-1 flange number." });
    }
    if (stack) {
      segments.push({ code: stack, label: "Stack" });
      if (["10", "20", "30"].includes(stack)) fields.push({ label: "Magnet stack length", code: stack, value: stack, detail: "Longer stack, more torque in the same frame." });
      else problems.push(`Stack length "${stack}" isn't listed for these frames (10, 20 or 30).`);
    }
    if (speed) {
      segments.push({ code: speed, label: "Speed" });
      const v = mplSpeed[speed];
      if (v) fields.push({ label: "Rated speed", code: speed, value: v });
      else problems.push(`Speed letter "${speed}" isn't listed (P, T, U or V).`);
    }
    if (fb) {
      segments.push({ code: fb, label: "Feedback" });
      const v = mplFeedback[fb];
      if (v) fields.push({ label: "Feedback", code: fb, value: v });
      else problems.push(`Feedback letter "${fb}" isn't listed (E, H or V).`);
    }
    if (shaft) {
      segments.push({ code: shaft, label: "Shaft" });
      if (shaft === "J") fields.push({ label: "Shaft", code: "J", value: "Shaft key" });
      else problems.push(`Shaft letter "${shaft}" isn't listed for these frames (J).`);
    }
    if (conn) {
      segments.push({ code: conn, label: "Connector" });
      if (conn === "7") fields.push({ label: "Connectors", code: "7", value: "Circular DIN, right angle, rotates 180°" });
      else problems.push(`Connector digit "${conn}" isn't listed for these frames (7).`);
    }
    if (brake) {
      segments.push({ code: brake, label: "Brake" });
      if (brake === "2" || brake === "4") fields.push({ label: "Holding brake", code: brake, value: brake === "2" ? "No brake" : "24 V DC brake" });
      else problems.push(`Brake digit "${brake}" isn't listed (2 or 4).`);
    }
    if (flange) {
      segments.push({ code: flange, label: "Flange" });
      if (flange === "A") fields.push({ label: "Mounting flange", code: "A", value: "IEC metric" });
      else problems.push(`Flange letter "${flange}" isn't listed (A).`);
    }
    if (opts) {
      segments.push({ code: opts, label: "Options" });
      if (opts === "A") fields.push({ label: "Factory options", code: "A", value: "Standard" });
      else problems.push(`Option letter "${opts}" isn't listed (A).`);
    }
    if (frame || stack) notes.push("This family covers the 63 mm (15) and 75 mm (2) MPL frames only.");
    return { segments, fields, problems, notes, complete: Boolean(volt && frame && stack && speed && fb && shaft && conn && brake && flange && opts) };
  },
  reference: {
    title: "MPL models covered (63 and 75 mm frames)",
    columns: ["Model", "Frame", "Stack", "Voltage"],
    rows: ["A", "B"].flatMap((v) => [["15", "10"], ["15", "20"], ["15", "30"], ["2", "10"], ["2", "20"], ["2", "30"]].map(([f, s]) => [`MPL-${v}${f}${s}`, mplFrame[f], s, v === "A" ? "200 V" : "400 V"])),
  },
  keys: [
    { title: "Voltage, frame & speed", rows: [["A · B", "200 V / 400 V"], ["15 · 2", "63 mm / 75 mm frame"], ["P · T · U · V", "5000 · 6000 · 7000 · 8000 rpm"]] },
    { title: "Feedback", rows: [["E", "Single-turn high-resolution encoder"], ["H", "2000-line encoder"], ["V", "Multi-turn high-resolution encoder"]] },
    { title: "Shaft, connector & brake", rows: [["J", "Shaft key"], ["7", "Circular DIN connectors, right angle, rotate 180°"], ["2 · 4", "No brake / 24 V DC brake"]] },
  ],
};

/* ------------------------------------------------------------------ */
/* Yaskawa Sigma-5 (Σ-V): SGDV SERVOPACKs and rotary servo motors     */
/* (Yaskawa America, AC Servo Drives Sigma-5 Series Product Catalog,  */
/*  YEA-KAEPS80000042)                                                */
/* ------------------------------------------------------------------ */

const S5_SOURCE = "Yaskawa AC Servo Drives Sigma-5 Series Product Catalog (YEA-KAEPS80000042)";

type S5Motor = {
  series: string;
  name: string;
  examples: string[];
  outputs: Record<string, string>;
  voltages: Record<string, string>;
  encoders: Record<string, string>;
  shafts: Record<string, string>;
  options: Record<string, string>;
  outputNote?: Record<string, string>;
};

const s5Opts = {
  small: { "1": "No options", C: "24 V DC holding brake", E: "Oil seal and 24 V DC holding brake", S: "Oil seal" },
  medium: { "1": "No options", B: "90 V DC holding brake", C: "24 V DC holding brake", D: "Oil seal and 90 V DC holding brake", E: "Oil seal and 24 V DC holding brake", S: "Oil seal" },
};
const s5Enc = { "3": "20-bit absolute serial encoder", D: "20-bit incremental serial encoder" };
const list = (m: Record<string, string>) => Object.keys(m).join(", ");

/** Rotary Sigma-5 motors share one layout: SERIES-[output 2][voltage][encoder][revision][shaft][options]. */
function sigma5Motor(m: S5Motor): Family {
  const re = new RegExp(`^${m.series}(?:-?([0-9A-Z]{1,2})?([A-Z])?([0-9A-Z])?([A-Z])?([0-9A-Z])?([0-9A-Z])?([0-9A-Z-]+)?)?$`);
  return {
    id: `yaskawa-${m.series.toLowerCase()}`,
    brand: "Yaskawa",
    brandSlug: "yaskawa",
    series: m.series,
    kind: "motor",
    name: m.name,
    source: S5_SOURCE,
    examples: m.examples,
    prefix: new RegExp(`^${m.series}`),
    decode(code) {
      const x = re.exec(code);
      if (!x) return null;
      const [, out, volt, enc, rev, shaft, opt, extra] = x;
      const segments: Segment[] = [{ code: m.series, label: "Series" }];
      const fields: Field[] = [];
      const problems: string[] = [];
      const notes: string[] = [];
      const take = (v: string | undefined, label: string, field: string, map: Record<string, string>, what: string) => {
        if (!v) return;
        segments.push({ code: v, label });
        const val = map[v];
        if (val) fields.push({ label: field, code: v, value: val });
        else problems.push(`${what} "${v}" isn't listed for ${m.series} (${list(map)}).`);
      };
      if (out && out.length === 2) {
        take(out, "Output", "Rated output", m.outputs, "Output code");
        if (m.outputNote?.[out]) notes.push(m.outputNote[out]);
      } else if (out) segments.push({ code: out, label: "Output" });
      take(volt, "Voltage", "Supply voltage", m.voltages, "Voltage letter");
      take(enc, "Encoder", "Encoder", m.encoders, "Encoder code");
      if (rev) {
        segments.push({ code: rev, label: "Revision" });
        if (rev === "A") fields.push({ label: "Design revision", code: "A", value: "Standard" });
        else problems.push(`Revision "${rev}" isn't listed in this catalog (A).`);
      }
      take(shaft, "Shaft", "Shaft end", m.shafts, "Shaft code");
      take(opt, "Options", "Brake & seal", m.options, "Option code");
      if (extra) notes.push(`"${extra}" after the 7th digit is usually a gearhead or special code. This decoder covers the motor itself.`);
      return { segments, fields, problems, notes, complete: Boolean(out?.length === 2 && volt && enc && rev && shaft && opt) };
    },
    reference: {
      title: `${m.series} output codes`,
      columns: ["Code", "Rated output"],
      rows: Object.entries(m.outputs).map(([k, v]) => [k, v]),
    },
    keys: [
      { title: "Supply voltage", rows: Object.entries(m.voltages) as [string, string][] },
      { title: "Encoder", rows: Object.entries(m.encoders) as [string, string][] },
      { title: "Shaft end", rows: Object.entries(m.shafts) as [string, string][] },
      { title: "Brake & oil seal (7th digit)", rows: Object.entries(m.options) as [string, string][] },
    ],
  };
}

const sgmjv = sigma5Motor({
  series: "SGMJV",
  name: "Sigma-5 SGMJV servo motors (medium inertia, small capacity)",
  examples: ["SGMJV-01ADA21", "SGMJV-04A3A6C", "SGMJV-08ADA2E"],
  outputs: { A5: "50 W", "01": "100 W", C2: "150 W", "02": "200 W", "04": "400 W", "06": "600 W", "08": "750 W" },
  voltages: { A: "200 V AC" },
  encoders: { ...s5Enc, A: "13-bit incremental serial encoder" },
  shafts: { "2": "Straight, no key", "6": "Straight with key and tapped hole", B: "Two flat seats" },
  options: s5Opts.small,
});

const sgmav = sigma5Motor({
  series: "SGMAV",
  name: "Sigma-5 SGMAV servo motors (low inertia, small capacity)",
  examples: ["SGMAV-01ADA21", "SGMAV-04A3A6C", "SGMAV-10ADA2S"],
  outputs: { A5: "50 W", "01": "100 W", C2: "150 W", "02": "200 W", "04": "400 W", "06": "550 W", "08": "750 W", "10": "1.0 kW" },
  voltages: { A: "200 V AC" },
  encoders: s5Enc,
  shafts: { "2": "Straight, no key", "6": "Straight with key and tapped hole", B: "Two flat seats" },
  options: s5Opts.small,
});

const sgmgv = sigma5Motor({
  series: "SGMGV",
  name: "Sigma-5 SGMGV servo motors (medium inertia, medium capacity)",
  examples: ["SGMGV-09ADA21", "SGMGV-20D3A6C", "SGMGV-44ADA6B"],
  outputs: { "03": "300 W", "05": "450 W", "09": "850 W", "13": "1.3 kW", "20": "1.8 kW", "30": "2.9 kW", "44": "4.4 kW", "55": "5.5 kW", "75": "7.5 kW", "1A": "11 kW", "1E": "15 kW" },
  voltages: { A: "200 V AC", D: "400 V AC" },
  encoders: s5Enc,
  shafts: { "2": "Straight, no key", "6": "Straight with key and tapped hole" },
  options: s5Opts.medium,
});

const sgmsv = sigma5Motor({
  series: "SGMSV",
  name: "Sigma-5 SGMSV servo motors (low inertia, medium capacity)",
  examples: ["SGMSV-10ADA21", "SGMSV-20D3A6C", "SGMSV-30ADA2E"],
  outputs: { "10": "1.0 kW", "15": "1.5 kW", "20": "2.0 kW", "25": "2.5 kW", "30": "3.0 kW", "40": "4.0 kW", "50": "5.0 kW", "70": "7.0 kW" },
  outputNote: { "70": "The catalog lists the 7.0 kW SGMSV only as a 200 V model without brake." },
  voltages: { A: "200 V AC", D: "400 V AC" },
  encoders: s5Enc,
  shafts: { "2": "Straight, no key", "6": "Straight with key and tapped hole" },
  options: s5Opts.medium,
});

const sgmmv = sigma5Motor({
  series: "SGMMV",
  name: "Sigma-5 SGMMV mini servo motors (3.3 W to 30 W)",
  examples: ["SGMMV-A1A2A21", "SGMMV-B3E2A21", "SGMMV-A3A2A2C"],
  outputs: { B3: "3.3 W", B5: "5.5 W", B9: "11 W", A1: "10 W", A2: "20 W", A3: "30 W" },
  voltages: { A: "200 V AC (25 × 25 mm flange)", E: "24 V or 48 V DC" },
  encoders: { "2": "17-bit absolute serial encoder" },
  shafts: { "2": "Straight (standard)", A: "Straight with flat seats" },
  options: { "1": "No options", C: "24 V DC holding brake (25 × 25 mm flange)" },
});

/* SGDV SERVOPACK: SGDV-[current 3][voltage][interface][motor type][revision][options 6][option function 3] */
const sgdvCurrent: Record<string, Record<string, string>> = {
  F: { R70: "0.05 kW", R90: "0.1 kW", "2R1": "0.2 kW", "2R8": "0.4 kW" },
  A: { R70: "0.05 kW", R90: "0.1 kW", "1R6": "0.2 kW", "2R8": "0.4 kW", "3R8": "0.5 kW", "5R5": "0.75 kW", "7R6": "1.0 kW", "120": "1.5 kW", "180": "2.0 kW", "200": "3.0 kW", "330": "5.0 kW", "470": "6.0 kW", "550": "7.5 kW", "590": "11 kW", "780": "15 kW" },
  D: { "1R9": "0.5 kW", "3R5": "1.0 kW", "5R4": "1.5 kW", "8R4": "2.0 kW", "120": "3.0 kW", "170": "5.0 kW", "210": "6.0 kW", "260": "7.5 kW", "280": "11 kW", "370": "15 kW" },
  E: { "1R7": "11 W", "2R9": "30 W" },
};
const sgdvVolt: Record<string, string> = { F: "100 V AC (single phase)", A: "200 V AC", D: "400 V AC", E: "24 V or 48 V DC main circuit" };
const sgdvIface: Record<string, string> = {
  "0": "Analog voltage / pulse train reference",
  "1": "MECHATROLINK-II communications",
  "2": "MECHATROLINK-III communications",
  E: "Command option attachable (e.g. EtherCAT or MP2600iec option module)",
};
const sgdvMotor: Record<string, string> = { "1": "For rotary servo motors", "5": "For linear servo motors" };
const sgdvHw: Record<string, string> = { "002": "Base-mounted, varnished (standard)", "008": "Single-phase 200 V AC input (special version of SGDV-120A)" };
const sgdvFunc: Record<string, string> = {
  "000": "No option function",
  "001": "Fully-closed loop control",
  "010": "Functional safety",
  "100": "Indexer",
  "101": "Indexer and fully-closed loop",
  "200": "EtherCAT (CoE) communications",
  "201": "EtherCAT and fully-closed loop",
  "210": "EtherCAT and functional safety",
  "300": "MP2600iec single-axis controller",
};

const sgdv: Family = {
  id: "yaskawa-sgdv",
  brand: "Yaskawa",
  brandSlug: "yaskawa",
  series: "Sigma-5 SGDV",
  kind: "drive",
  shopQuery: "SGDV",
  name: "Sigma-5 SGDV SERVOPACK servo drives",
  source: S5_SOURCE,
  examples: ["SGDV-2R8A01B002000", "SGDV-120A11A", "SGDV-5R4D21A"],
  prefix: /^SGDV/,
  decode(code) {
    const x = /^SGDV(?:-?([0-9R]{1,3})?([A-Z])?([0-9E])?(\d)?([A-Z])?(\d{1,3})?(\d{0,2})?(\d)?(\d{3})?)?$/.exec(code);
    if (!x) return null;
    const [, cur, volt, iface, motor, rev, hw, sw, prm, func] = x;
    const segments: Segment[] = [{ code: "SGDV", label: "Series" }];
    const fields: Field[] = [];
    const problems: string[] = [];
    const notes: string[] = [];
    if (cur) segments.push({ code: cur, label: "Current" });
    if (volt) {
      segments.push({ code: volt, label: "Voltage" });
      const v = sgdvVolt[volt];
      if (v) fields.push({ label: "Supply voltage", code: volt, value: v });
      else problems.push(`Voltage letter "${volt}" isn't listed (F, A, D or E).`);
    }
    if (cur && cur.length === 3) {
      const table = volt ? sgdvCurrent[volt] : undefined;
      const kw = table?.[cur];
      if (kw) fields.push({ label: "Max. motor capacity", code: cur, value: kw, detail: "Largest servo motor this drive is rated for." });
      else if (table) problems.push(`Current code "${cur}" isn't listed for ${sgdvVolt[volt!]} SGDV drives (${list(table)}).`);
    }
    if (iface) {
      segments.push({ code: iface, label: "Interface" });
      const v = sgdvIface[iface];
      if (v) fields.push({ label: "Command interface", code: iface, value: v });
      else problems.push(`Interface digit "${iface}" isn't listed (0, 1, 2 or E).`);
      if (volt === "E" && iface !== "2") problems.push("The DC-input SGDV drives in this catalog are MECHATROLINK-III only (interface 2).");
    }
    if (motor) {
      segments.push({ code: motor, label: "Motor type" });
      const v = sgdvMotor[motor];
      if (v) fields.push({ label: "Motor type", code: motor, value: v });
      else problems.push(`Motor-type digit "${motor}" isn't listed (1 rotary, 5 linear).`);
    }
    if (rev) {
      segments.push({ code: rev, label: "Revision" });
      fields.push({ label: "Design revision", code: rev, value: rev === "B" ? "Standard (B)" : `Revision ${rev}` });
    }
    if (hw) {
      segments.push({ code: hw, label: "Hardware option" });
      if (hw.length === 3) {
        const v = sgdvHw[hw];
        if (v) fields.push({ label: "Hardware option", code: hw, value: v });
        else problems.push(`Hardware option "${hw}" isn't listed (002 or 008).`);
      }
    }
    if (sw) segments.push({ code: sw, label: "Software option" });
    if (sw?.length === 2) fields.push({ label: "Software option", code: sw, value: sw === "00" ? "Standard" : `Code ${sw}` });
    if (prm) {
      segments.push({ code: prm, label: "Parameter option" });
      fields.push({ label: "Parameter option", code: prm, value: prm === "0" ? "Standard" : `Code ${prm}` });
    }
    if (func) {
      segments.push({ code: func, label: "Option function" });
      const v = sgdvFunc[func];
      if (v) fields.push({ label: "Option function", code: func, value: v });
      else problems.push(`Option function "${func}" isn't listed (${list(sgdvFunc)}).`);
    }
    if (rev && !hw) notes.push("Yaskawa leaves out the option digits when they are all zeros, so a code that ends after the revision letter is a standard drive.");
    return { segments, fields, problems, notes, complete: Boolean(cur?.length === 3 && volt && iface && motor && rev) };
  },
  reference: {
    title: "SGDV current codes",
    columns: ["Code", "Supply", "Max. motor capacity"],
    rows: Object.entries(sgdvCurrent).flatMap(([v, t]) => Object.entries(t).map(([c, kw]) => [`SGDV-${c}${v}`, sgdvVolt[v], kw])),
  },
  keys: [
    { title: "Voltage", rows: Object.entries(sgdvVolt) as [string, string][] },
    { title: "Interface + motor type (5th and 6th digits)", rows: [["01 · 05", "Analog / pulse, rotary · linear"], ["11 · 15", "MECHATROLINK-II, rotary · linear"], ["21 · 25", "MECHATROLINK-III, rotary · linear"], ["E1 · E5", "Command option module, rotary · linear"]] },
    { title: "Option function (last 3 digits)", rows: Object.entries(sgdvFunc).filter(([k]) => k !== "000") as [string, string][] },
  ],
};

export const families: Family[] = [mkd, fk7, mpl, sgdv, sgmjv, sgmav, sgmgv, sgmsv, sgmmv];

export const familyBySeries = (series: string) => families.find((f) => f.series === series);

/** Find the family for a code and decode it. */
export function decodeCode(raw: string): { family: Family; result: Decoded } | { family?: undefined; result?: undefined } {
  const code = normalize(raw);
  const family = families.find((f) => f.prefix.test(code));
  if (!family) return {};
  const result = family.decode(code);
  return result ? { family, result } : {};
}

/** Repair service and noun for a family. */
export const familyService = (f: Family) => (f.kind === "drive" ? "servo-drive-repair" : "servo-motor-repair");
