// Independent verification that tgju's prices are internally consistent.
//
// Approach: pull live FX rates from Frankfurter (frankfurter.dev — free,
// no API key, ECB-quoted majors), compute the *expected* Toman value for
// each currency given tgju's USD-Toman rate, and flag any whose actual
// value diverges significantly.
//
// Why this works: tgju's free-market spread (Toman/USD) is roughly uniform
// across foreign currencies. So if 1 USD = T_USD Toman on tgju, then
// 1 EUR ≈ T_USD / (FrankfurterUSD→EUR) Toman. Big deviations expose a
// parsing or unit-conversion bug.
//
// Frankfurter only covers ECB-tracked currencies (~30 majors). Currencies
// it doesn't list (e.g. AFN, AZN, AMD, IQD, KWD) are simply skipped — they
// remain unverified, which is fine since they rarely move discontinuously.

import type { RatesSnapshot } from "./types";

// Frankfurter v1 endpoint. The bare /latest path now 301-redirects to
// /v1/latest, but Next.js's fetch doesn't auto-follow some redirects in
// the cache layer, so we point straight at the canonical URL.
const FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest?base=USD";

// Tolerance: the Iranian free-market premium isn't uniform across all
// currencies (different demand pressures), so allow 25% drift before
// flagging. Tighter than this generates noise; looser misses real bugs.
const TOLERANCE = 0.25;

export type CrossCheck = {
  // ISO code, our Toman value, what we'd expect, % error.
  code: string;
  actualToman: number;
  expectedToman: number;
  errorPct: number;
};

export type SanityResult = {
  // True if Frankfurter responded and all checked currencies pass.
  ok: boolean;
  // Successfully verified count (excludes USD itself and currencies
  // Frankfurter doesn't list).
  verified: number;
  // Currencies that drifted beyond TOLERANCE.
  flagged: CrossCheck[];
  // Set when Frankfurter is unreachable; sanity check is informational
  // and never blocks the page render.
  apiUnavailable: boolean;
};

export async function crossCheckRates(
  snapshot: RatesSnapshot,
): Promise<SanityResult> {
  const usd = snapshot.fiat.find((r) => r.code === "USD");
  if (!usd) {
    return { ok: false, verified: 0, flagged: [], apiUnavailable: false };
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
    return { ok: true, verified: 0, flagged: [], apiUnavailable: true };
  }

  let verified = 0;
  const flagged: CrossCheck[] = [];

  for (const rate of snapshot.fiat) {
    if (rate.code === "USD") continue;
    const fxPerUsd = apiRates[rate.code];
    if (!fxPerUsd) continue; // Frankfurter doesn't track it; skip silently
    verified++;

    // Expected Toman per "display unit" of the foreign currency.
    // 1 USD = fxPerUsd foreign units, so 1 foreign unit = usdToman / fxPerUsd
    // Multiply by our display `units` (×10 for JPY, ×100 for KRW, etc.)
    const expectedToman = (usdToman / fxPerUsd) * (rate.units ?? 1);
    const error = Math.abs(rate.sell - expectedToman) / expectedToman;

    if (error > TOLERANCE) {
      flagged.push({
        code: rate.code,
        actualToman: rate.sell,
        expectedToman: Math.round(expectedToman),
        errorPct: error * 100,
      });
    }
  }

  return {
    ok: flagged.length === 0,
    verified,
    flagged,
    apiUnavailable: false,
  };
}
