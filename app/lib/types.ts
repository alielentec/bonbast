export type RateBase = {
  code: string;
  nameEn: string;
  sell: number;
  buy: number;
  change?: number;
};

export type FiatRate = RateBase & {
  kind: "fiat";
  flagCode: string;
  units?: number; // bonbast prices are per N units (e.g. 10 for AMD/JPY, 100 for IQD). Default 1.
};

export type GoldRate = RateBase & {
  kind: "gold";
};

export type CryptoRate = RateBase & {
  kind: "crypto";
  symbol: string;
};

export type Rate = FiatRate | GoldRate | CryptoRate;

export type RatesSnapshot = {
  updatedAt: string;
  fiat: FiatRate[];
  gold: GoldRate[];
  crypto: CryptoRate[];
};
