import type { RatesSnapshot } from "./types";

// Currency order:
// 1. USD and EUR fixed at top (most-watched).
// 2. Other 28 reordered by Iran-relevance, NOT bonbast's order: major
//    trading partners and neighbors first, then the rest.
// 3. KRW (South Korea) and PKR (Pakistan) added beyond bonbast's set.
// Prices are in Iranian Toman (1 Toman = 10 Rial). For very-small-value
// currencies, bonbast uses ×N units convention — we follow it.

export const mockRates: RatesSnapshot = {
  updatedAt: new Date().toISOString(),

  fiat: [
    // Fixed at top
    { kind: "fiat", code: "USD", flagCode: "US",  nameEn: "US Dollar",         sell: 183900, buy: 183800, change:  0.42 },
    { kind: "fiat", code: "EUR", flagCode: "EU",  nameEn: "Euro",              sell: 215650, buy: 215450, change:  0.18 },

    // Major trading partners
    { kind: "fiat", code: "CNY", flagCode: "CN",  nameEn: "Chinese Yuan",      sell:  26950, buy:  26950, change:  0.00 },
    { kind: "fiat", code: "AED", flagCode: "AE",  nameEn: "UAE Dirham",        sell:  50200, buy:  50150, change:  0.31 },
    { kind: "fiat", code: "TRY", flagCode: "TR",  nameEn: "Turkish Lira",      sell:   4075, buy:   4055, change: -0.65 },
    { kind: "fiat", code: "RUB", flagCode: "RU",  nameEn: "Russian Ruble",     sell:   2450, buy:   2445, change: -0.40 },
    { kind: "fiat", code: "INR", flagCode: "IN",  nameEn: "Indian Rupee",      sell:   1935, buy:   1930, change:  0.20 },
    { kind: "fiat", code: "JPY", flagCode: "JP",  nameEn: "Japanese Yen",      sell:  11700, buy:  11700, change:  0.02, units:  10 },
    { kind: "fiat", code: "GBP", flagCode: "GBR", nameEn: "British Pound",     sell: 250150, buy: 249950, change: -0.21 },
    { kind: "fiat", code: "KRW", flagCode: "KR",  nameEn: "Korean Won",        sell:  13000, buy:  12950, change:  0.18, units: 100 },

    // Other reserve / commonwealth
    { kind: "fiat", code: "CAD", flagCode: "CA",  nameEn: "Canadian Dollar",   sell: 135250, buy: 135150, change: -0.10 },
    { kind: "fiat", code: "AUD", flagCode: "AU",  nameEn: "Australian Dollar", sell: 132400, buy: 132300, change:  0.08 },
    { kind: "fiat", code: "CHF", flagCode: "CH",  nameEn: "Swiss Franc",       sell: 235400, buy: 235200, change:  0.05 },

    // Gulf
    { kind: "fiat", code: "SAR", flagCode: "SA",  nameEn: "Saudi Riyal",       sell:  49050, buy:  48950, change:  0.12 },
    { kind: "fiat", code: "KWD", flagCode: "KW",  nameEn: "Kuwaiti Dinar",     sell: 598450, buy: 598050, change:  0.40 },
    { kind: "fiat", code: "QAR", flagCode: "QA",  nameEn: "Qatari Riyal",      sell:  50450, buy:  50350, change:  0.15 },
    { kind: "fiat", code: "BHD", flagCode: "BH",  nameEn: "Bahraini Dinar",    sell: 486950, buy: 486450, change:  0.35 },
    { kind: "fiat", code: "OMR", flagCode: "OM",  nameEn: "Omani Rial",        sell: 478000, buy: 477700, change:  0.28 },

    // Caucasus and immediate neighbors
    { kind: "fiat", code: "AZN", flagCode: "AZ",  nameEn: "Azerbaijani Manat", sell: 107900, buy: 107800, change:  0.30 },
    { kind: "fiat", code: "AMD", flagCode: "AM",  nameEn: "Armenian Dram",     sell:   4960, buy:   4955, change:  0.08, units:  10 },
    { kind: "fiat", code: "AFN", flagCode: "AF",  nameEn: "Afghan Afghani",    sell:   2875, buy:   2870, change: -0.05 },
    { kind: "fiat", code: "PKR", flagCode: "PK",  nameEn: "Pakistani Rupee",   sell:    660, buy:    655, change:  0.08 },
    { kind: "fiat", code: "IQD", flagCode: "IQ",  nameEn: "Iraqi Dinar",       sell:  14050, buy:  14050, change:  0.00, units: 100 },

    // SE Asia
    { kind: "fiat", code: "THB", flagCode: "TH",  nameEn: "Thai Baht",         sell:   5655, buy:   5650, change:  0.15 },
    { kind: "fiat", code: "MYR", flagCode: "MY",  nameEn: "Malaysian Ringgit", sell:  46300, buy:  46200, change:  0.18 },
    { kind: "fiat", code: "SGD", flagCode: "SG",  nameEn: "Singapore Dollar",  sell: 144500, buy: 144400, change:  0.22 },
    { kind: "fiat", code: "HKD", flagCode: "HK",  nameEn: "Hong Kong Dollar",  sell:  23450, buy:  23350, change:  0.05 },

    // Nordic
    { kind: "fiat", code: "SEK", flagCode: "SE",  nameEn: "Swedish Krona",     sell:  19950, buy:  19850, change:  0.12 },
    { kind: "fiat", code: "NOK", flagCode: "NO",  nameEn: "Norwegian Krone",   sell:  19800, buy:  19800, change:  0.00 },
    { kind: "fiat", code: "DKK", flagCode: "DK",  nameEn: "Danish Krone",      sell:  28850, buy:  28750, change:  0.10 },
  ],

  gold: [
    { kind: "gold", code: "AZADI",   nameEn: "Azadi (Bahar)",   sell: 201_000_000, buy: 196_000_000, change:  0.55 },
    { kind: "gold", code: "EMAMI",   nameEn: "Emami",           sell: 206_000_000, buy: 202_000_000, change:  0.62 },
    { kind: "gold", code: "HALF",    nameEn: "Half Azadi",      sell: 107_000_000, buy: 103_000_000, change:  0.30 },
    { kind: "gold", code: "QUARTER", nameEn: "Quarter Azadi",   sell:  60_000_000, buy:  56_500_000, change:  0.45 },
    { kind: "gold", code: "GRAMI",   nameEn: "Gerami (1g)",     sell:  30_000_000, buy:  27_000_000, change:  0.20 },
    { kind: "gold", code: "MITHQAL", nameEn: "Gold Mithqal",    sell:  89_392_000, buy:  89_392_000, change:  0.38 },
    { kind: "gold", code: "GRAM18",  nameEn: "Gold Gram (18k)", sell:  20_636_225, buy:  20_636_225, change:  0.40 },
    { kind: "gold", code: "OUNCE",   nameEn: "Gold Ounce ($)",  sell:       5305, buy:       5305, change:  0.10 },
  ],

  crypto: [
    { kind: "crypto", code: "BTC", symbol: "btc", nameEn: "Bitcoin ($)", sell: 78406, buy: 78406, change: 1.20 },
  ],
};
