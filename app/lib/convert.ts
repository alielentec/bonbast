import type { FiatRate } from "./types";

// IRR is the base. 1 Toman has rate 1.
// For other currencies, "Toman per 1 unit" = sell / (units ?? 1)
// Bonbast displays a price for `units` of that currency (e.g. JPY10 means
// 10 yen costs N Toman), so divide to get per-unit.

export function tomanPer(code: string, rates: FiatRate[]): number | null {
  if (code === "IRR" || code === "TOMAN") return 1;
  const r = rates.find((x) => x.code === code);
  if (!r) return null;
  // Use mid-market (average of sell + buy) to avoid biasing the converter.
  const mid = (r.sell + r.buy) / 2;
  return mid / (r.units ?? 1);
}

export function convert(
  amount: number,
  from: string,
  to: string,
  rates: FiatRate[],
): number | null {
  if (!Number.isFinite(amount)) return null;
  const fromRate = tomanPer(from, rates);
  const toRate = tomanPer(to, rates);
  if (fromRate === null || toRate === null) return null;
  return (amount * fromRate) / toRate;
}
