/* Bulk price change: the same math runs in the CMS preview (browser) and on the server,
   so what the preview shows is exactly what gets saved. */

export type PriceMode = "set" | "pct_up" | "pct_down" | "amt_up" | "amt_down" | "quote";
export type RoundTo = 0 | 1 | 5 | 10;
export type PriceOp = { mode: PriceMode; amount: number; round: RoundTo };

/** Same floor as the CSV import and the single price edit: lower prices are data errors. */
export const BULK_MIN_PRICE = 5;
/** Bulk changes are limited to one page of the list. */
export const BULK_MAX = 50;

export const PRICE_MODES: { value: PriceMode; label: string }[] = [
  { value: "set", label: "Set one price" },
  { value: "pct_up", label: "Increase by %" },
  { value: "pct_down", label: "Decrease by %" },
  { value: "amt_up", label: "Increase by $" },
  { value: "amt_down", label: "Decrease by $" },
  { value: "quote", label: "Make Request Quote" },
];

/** Checks the amount for a mode. Returns an error message, or null when it is fine. */
export function opError(op: PriceOp): string | null {
  if (op.mode === "quote") return null;
  if (!Number.isFinite(op.amount) || op.amount <= 0) return "Enter an amount above 0.";
  if ((op.mode === "pct_up" || op.mode === "pct_down") && op.amount > 90) return "Use 90% or less.";
  if (op.mode === "set" && op.amount < BULK_MIN_PRICE) return `Prices under US$${BULK_MIN_PRICE} are treated as mistakes.`;
  if (op.amount > 10_000_000) return "That amount is too high.";
  return null;
}

const roundTo = (n: number, step: RoundTo) => (step ? Math.round(n / step) * step : Math.round(n * 100) / 100);

/** The new price for one listing. `undefined` = this listing is left as it is
    (a Request Quote listing stays Request Quote when prices go up or down by % or $). */
export function nextPrice(current: number | null, op: PriceOp): number | null | undefined {
  switch (op.mode) {
    case "quote":
      return current == null ? undefined : null;
    case "set":
      return roundTo(op.amount, op.round);
    default: {
      if (current == null) return undefined;
      const n =
        op.mode === "pct_up" ? current * (1 + op.amount / 100)
        : op.mode === "pct_down" ? current * (1 - op.amount / 100)
        : op.mode === "amt_up" ? current + op.amount
        : current - op.amount;
      return roundTo(n, op.round);
    }
  }
}

/** Reads the op from form/JSON input, so the server never trusts the browser's shape. */
export function parseOp(v: { mode?: unknown; amount?: unknown; round?: unknown }): PriceOp | null {
  const mode = PRICE_MODES.find((m) => m.value === v.mode)?.value;
  if (!mode) return null;
  const amount = Number(String(v.amount ?? "").replace(/[\s$,%]/g, "")) || 0;
  const round = [0, 1, 5, 10].includes(Number(v.round)) ? (Number(v.round) as RoundTo) : 0;
  return { mode, amount, round };
}
