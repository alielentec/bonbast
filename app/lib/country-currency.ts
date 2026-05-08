// Map ISO 3166-1 alpha-2 country code → default currency code.
// Used by the converter to pick a sensible "to" currency based on the
// visitor's location (or browser locale fallback). Only includes the
// currencies bonbast actually trades — for any other country we fall
// back to USD.

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP", UK: "GBP",
  CA: "CAD",
  AU: "AUD",
  CH: "CHF", LI: "CHF",
  // Eurozone
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
  AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
  SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", CY: "EUR",
  MT: "EUR", HR: "EUR",
  // Nordics
  SE: "SEK", NO: "NOK", DK: "DKK",
  // Asia
  JP: "JPY", CN: "CNY", IN: "INR", HK: "HKD", SG: "SGD", TH: "THB",
  MY: "MYR", AF: "AFN",
  // Middle East
  AE: "AED", SA: "SAR", TR: "TRY", IQ: "IQD", BH: "BHD", OM: "OMR",
  QA: "QAR", KW: "KWD",
  // Caucasus / CIS
  RU: "RUB", AZ: "AZN", AM: "AMD",
  // Iran → leave blank so the right side never duplicates the left
  IR: "USD",
};

export function detectCurrencyFromLocale(): string {
  if (typeof navigator === "undefined") return "USD";
  const lang = navigator.language || "en-US";
  const parts = lang.split("-");
  const country = parts[1]?.toUpperCase();
  if (!country) return "USD";
  return COUNTRY_TO_CURRENCY[country] ?? "USD";
}
