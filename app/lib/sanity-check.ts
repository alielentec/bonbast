// Independent verification that tgju's cross-rates match the real world.
//
// What this checks (and why):
// ----------------------------
// IRR/USD on tgju is the *free-market* rate, which no public FX API
// publishes (they all carry the central-bank "official" rate that's ~4×
// lower). So we cannot verify IRR/USD externally — we trust tgju for it.
//
// However, the FOREIGN-vs-FOREIGN ratios implied by tgju's Toman values
// SHOULD match the real world. Example: if tgju says
//     USD = 175,420 Toman   and   EUR = 206,700 Toman
// then tgju implies EUR/USD = 1.178, which should match Frankfurter's
// EUR/USD (currently ≈ 1.176). If it doesn't, we have a parsing or
// unit-conversion bug.
//
// We compute, per currency:
//     tgju_usd_per_unit = tomanValue / units / usdTomanRate
//                       = "1 X is worth $tgju_usd_per_unit on our site"
//     api_usd_per_unit  = 1 / (frankfurter_USD_to_X)
//                       = "1 X is worth $api_usd_per_unit on world markets"
//     errorPct = |tgju_usd_per_unit - api_usd_per_unit| / api_usd_per_unit
//
// Currencies Frankfurter doesn't track (AFN, AZN, AMD, IQD, KWD, BHD,
// OMR, QAR, PKR, SAR, AED, SYP, KGS, etc.) are skipped silently — they
// remain unverified. Iran-region currencies are the typical gap.

import type { RatesSnapshot } from "./types";

const FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest?base=USD";

// Tolerance in percent. Real-world cross-rates between major currencies
// move slowly and tgju updates frequently, so 5% catches genuine drift
// without false-positives on hour-old data.
const TOLERANCE = 0.05;

export type CrossCheck = {
  code: string;
  // What 1 unit of this currency is worth in USD, per tgju (derived from
  // tgju's Toman values for both this currency and USD).
  tgjuUsdPerUnit: number;
  // Same value per Frankfurter (1 / their USD→X rate).
  apiUsdPerUnit: number;
  // Absolute % difference. Positive when tgju quotes higher than world.
  errorPct: number;
};

export type SanityResult = {
  // True if every currency Frankfurter knows about passes the tolerance.
  ok: boolean;
  // Successfully verified count (Frankfurter overlap, within tolerance).
  passed: number;
  // Currencies present on both sides but drifted beyond TOLERANCE.
  flagged: CrossCheck[];
  // Set when Frankfurter is unreachable; sanity check is informational
  // and never blocks the page render.
  apiUnavailable: boolean;
  // Full per-currency comparison (passed + flagged), useful for tooltips.
  details: CrossCheck[];
};

export async function crossCheckRates(
  snapshot: RatesSnapshot,
): Promise<SanityResult> {
  const usd = snapshot.fiat.find((r) => r.code === "USD");
  if (!usd) {
    return {
      ok: false,
      passed: 0,
      flagged: [],
      apiUnavailable: false,
      details: [],
    };
  }
  const usdToman = usd.sell;

  let apiRates: Record<string, number> | null = null;
  try {
    const res = await fetch(FRANKFURTER_URL, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = (await res.json()) as { rates?: Record<string, number> };
      apiRates = json.rates ?? null;
    }
  } catch {
    /* swallow — informational only */
  }

  if (!apiRates) {
    return {
      ok: true,
      passed: 0,
      flagged: [],
      apiUnavailable: true,
      details: [],
    };
  }

  const details: CrossCheck[] = [];
  const flagged: CrossCheck[] = [];

  for (const rate of snapshot.fiat) {
    if (rate.code === "USD") continue; // it IS the reference; skip
    const fxPerUsd = apiRates[rate.code];
    if (!fxPerUsd) continue; // not in Frankfurter; can't verify

    // Per-unit Toman, undoing our display multiplier (×10 for JPY etc.)
    const tomanPerSingleUnit = rate.sell / (rate.units ?? 1);
    const tgjuUsdPerUnit = tomanPerSingleUnit / usdToman;
    const apiUsdPerUnit = 1 / fxPerUsd;
    const errorPct =
      Math.abs(tgjuUsdPerUnit - apiUsdPerUnit) / apiUsdPerUnit;

    const check: CrossCheck = {
      code: rate.code,
      tgjuUsdPerUnit,
      apiUsdPerUnit,
      errorPct: errorPct * 100,
    };
    details.push(check);
    if (errorPct > TOLERANCE) flagged.push(check);
  }

  return {
    ok: flagged.length === 0,
    passed: details.length - flagged.length,
    flagged,
    apiUnavailable: false,
    details,
  };
}
