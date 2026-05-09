import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Iran Rates",
  description:
    "About Iran Rates: a free-market currency, gold, and crypto price tracker for Iran.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        About Iran Rates
      </h1>

      <p className="mb-4">
        Iran Rates publishes free-market exchange rates for the Iranian Toman
        against 30+ foreign currencies, alongside gold and Bitcoin prices.
        Rates are sourced hourly from{" "}
        <a
          href="https://www.tgju.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          tgju.org
        </a>{" "}
        and presented in a clean, mobile-friendly format.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Why this site
      </h2>
      <p className="mb-4">
        Iran has a parallel currency market separate from the official
        central-bank rate. The free-market price is what households,
        merchants, and travelers actually pay. This site makes those
        rates accessible in English with proper Persian-calendar
        timestamps for context.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        How the rates are verified
      </h2>
      <p className="mb-4">
        Every refresh, the foreign-vs-USD ratios implied by our Toman values
        are cross-checked against the European Central Bank&rsquo;s rates via
        the public{" "}
        <a
          href="https://www.frankfurter.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Frankfurter
        </a>{" "}
        API. Drifts &gt;5% are flagged in the footer.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Disclaimer
      </h2>
      <p>
        This site provides information only and does not constitute financial
        advice. Free-market quotes change continuously and may differ from
        actual prices at exchange counters.
      </p>

      <p className="mt-8 text-xs text-zinc-400">
        <a href="/" className="underline">
          ← Back to rates
        </a>
      </p>
    </main>
  );
}
