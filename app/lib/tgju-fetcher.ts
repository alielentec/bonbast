// Fetches live free-market rates from tgju.org and overlays them onto our
// existing rate metadata (flag codes, names, units, ordering). tgju
// publishes prices as `data-price="..."` attributes in static HTML on
// aggregate listing pages — no JavaScript execution required.
//
// Strategy:
// - 4 parallel fetches (currency, gold, coin, crypto)
// - Each fetch is cached by Next.js for 1 hour via { revalidate: 3600 }
// - If any single fetch fails, that section falls back to the mock prices
//   so the page never crashes outright.
//
// tgju displays prices in Iranian Rial; we divide by 10 for Toman.

import type { RatesSnapshot, FiatRate, GoldRate, CryptoRate } from "./types";
import { mockRates } from "./mock-rates";

const UA = "IranRatesAggregator/0.1 (+contact: ali.elentec@gmail.com)";

const URLS = {
  currency: "https://www.tgju.org/currency",
  gold: "https://www.tgju.org/gold-chart",
  coin: "https://www.tgju.org/coin",
  crypto: "https://www.tgju.org/crypto",
};

// Our internal code → tgju `data-market-row` slug.
// Anything not in this map keeps mock data (intentionally, e.g. KRW which
// tgju lists but you may want to verify the formula on).
const CURRENCY_SLUG: Record<string, string> = {
  USD: "price_dollar_rl",
  EUR: "price_eur",
  AED: "price_aed",
  GBP: "price_gbp",
  TRY: "price_try",
  CHF: "price_chf",
  CNY: "price_cny",
  JPY: "price_jpy",
  KRW: "price_krw",
  CAD: "price_cad",
  AUD: "price_aud",
  SGD: "price_sgd",
  INR: "price_inr",
  PKR: "price_pkr",
  IQD: "price_iqd",
  AFN: "price_afn",
  DKK: "price_dkk",
  SEK: "price_sek",
  NOK: "price_nok",
  SAR: "price_sar",
  QAR: "price_qar",
  OMR: "price_omr",
  KWD: "price_kwd",
  BHD: "price_bhd",
  MYR: "price_myr",
  THB: "price_thb",
  HKD: "price_hkd",
  RUB: "price_rub",
  AZN: "price_azn",
  AMD: "price_amd",
};

const COIN_SLUG: Record<string, string> = {
  EMAMI: "sekeb",
  AZADI: "sekeb", // tgju doesn't separate Azadi/Emami; both reuse Emami's slug
  HALF: "nim",
  QUARTER: "rob",
  GRAMI: "gerami",
};

const GOLD_SLUG: Record<string, string> = {
  MITHQAL: "mesghal",
  GRAM18: "geram18",
};

/**
 * Some currencies on tgju are quoted per N units instead of per 1.
 * The label hint appears as "(N <unit>)" in the row, e.g. "ین ژاپن (100 ین)".
 * For accurate Toman-per-unit math we divide by this factor before applying
 * our own display multiplier. Anything not listed here is per 1.
 */
const TGJU_QUOTE_PER: Record<string, number> = {
  JPY: 100, // tgju label: "ین ژاپن (100 ین)" — quote is per 100 yen
};

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": UA, Accept: "text/html" },
    });
    if (!res.ok) {
      console.error(`[tgju] ${url} → HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.error(`[tgju] ${url} failed:`, err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Parse a `data-market-row="<slug>" ... data-price="<num>"` pair from
 * tgju's listing markup. Returns the raw integer in Rial, or null if not
 * found. Number is comma-formatted in the source HTML.
 */
function priceForSlug(html: string, slug: string): number | null {
  const re = new RegExp(
    `data-market-row="${slug}"[^>]*data-price="([\\d,]+)"`,
  );
  const m = html.match(re);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Bitcoin lives on /crypto with newer Tailwind markup that doesn't expose
 * `data-price`. The Toman value is in `<div data-market-p="crypto-bitcoin-irr">`
 * inside the row. The displayed value is in Rial; we divide for Toman.
 */
function bitcoinTomanFromCrypto(html: string): number | null {
  // The row markup contains: <div data-market-p="crypto-bitcoin-irr" ...>1,234,567,890</div>
  const re = /data-market-p="crypto-bitcoin-irr"[^>]*>([\d,]+)/;
  const m = html.match(re);
  if (!m) return null;
  const rial = parseInt(m[1].replace(/,/g, ""), 10);
  if (!Number.isFinite(rial)) return null;
  return Math.round(rial / 10);
}

const rialToToman = (rial: number) => Math.round(rial / 10);

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Fetch live tgju rates and merge them into our existing snapshot
 * structure. Failed sections fall back to `mockRates` for that section.
 * Returns a fully-populated snapshot in the same shape as `mockRates`.
 */
export async function fetchTgjuRates(): Promise<RatesSnapshot> {
  const [currencyHtml, goldHtml, coinHtml, cryptoHtml] = await Promise.all([
    fetchHtml(URLS.currency),
    fetchHtml(URLS.gold),
    fetchHtml(URLS.coin),
    fetchHtml(URLS.crypto),
  ]);

  // Fiat — overlay live prices onto mock metadata, preserving order/flag/name.
  const fiat: FiatRate[] = mockRates.fiat.map((rate) => {
    const slug = CURRENCY_SLUG[rate.code];
    if (!slug || !currencyHtml) return rate;
    const rial = priceForSlug(currencyHtml, slug);
    if (rial === null) return rate;
    // Step 1: account for tgju's own per-N quoting (only JPY today).
    // Step 2: re-apply our display multiplier (`units` from mock-rates).
    // Result: a Toman value matching our existing display convention.
    const tgjuPerN = TGJU_QUOTE_PER[rate.code] ?? 1;
    const tomanPerSingleUnit = rialToToman(rial) / tgjuPerN;
    const tomanQuote = Math.round(tomanPerSingleUnit * (rate.units ?? 1));
    return { ...rate, sell: tomanQuote, buy: tomanQuote };
  });

  // Gold (coin + by-weight). Coin slugs live in /coin, weight slugs in /gold-chart.
  const gold: GoldRate[] = mockRates.gold.map((rate) => {
    const coinSlug = COIN_SLUG[rate.code];
    const goldSlug = GOLD_SLUG[rate.code];
    if (coinSlug && coinHtml) {
      const rial = priceForSlug(coinHtml, coinSlug);
      if (rial !== null) {
        const t = rialToToman(rial);
        return { ...rate, sell: t, buy: t };
      }
    }
    if (goldSlug && goldHtml) {
      const rial = priceForSlug(goldHtml, goldSlug);
      if (rial !== null) {
        const t = rialToToman(rial);
        return { ...rate, sell: t, buy: t };
      }
    }
    return rate;
  });

  // Crypto — Bitcoin only for now. Other rows are passed through untouched.
  const crypto: CryptoRate[] = mockRates.crypto.map((rate) => {
    if (rate.code !== "BTC" || !cryptoHtml) return rate;
    const t = bitcoinTomanFromCrypto(cryptoHtml);
    if (t === null) return rate;
    return { ...rate, sell: t, buy: t };
  });

  return {
    updatedAt: new Date().toISOString(),
    fiat,
    gold,
    crypto,
  };
}
