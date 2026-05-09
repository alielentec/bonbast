import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Disclaimer — Iran Rates",
  description: "Terms of use and disclaimer for Iran Rates.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
      <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Terms &amp; Disclaimer
      </h1>
      <p className="mb-2 text-xs text-zinc-400">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Informational use only
      </h2>
      <p className="mb-4">
        Iran Rates publishes free-market price data for currencies, gold,
        and Bitcoin in Iranian Toman. The information is provided solely
        for informational purposes and does not constitute financial,
        investment, legal, or tax advice. Do not make trading or transfer
        decisions based on these rates without independently verifying
        the price with your exchange counter or financial institution.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Accuracy
      </h2>
      <p className="mb-4">
        Rates are sourced from third parties (primarily{" "}
        <a
          href="https://www.tgju.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          tgju.org
        </a>
        ) and refreshed hourly. Free-market quotes change continuously and
        may differ from actual exchange counter prices. We do not warrant
        the accuracy, completeness, or timeliness of any rate shown.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Limitation of liability
      </h2>
      <p className="mb-4">
        The operator of this site shall not be liable for any direct,
        indirect, incidental, or consequential damages arising from the
        use of, or inability to use, the information presented here.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Trademarks
      </h2>
      <p className="mb-4">
        Currency codes, country flags, and cryptocurrency icons are
        property of their respective owners. No affiliation with the
        Central Bank of Iran, tgju.org, or any other entity is implied.
      </p>

      <h2 className="mt-6 mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Acceptable use
      </h2>
      <p className="mb-4">
        Automated bulk scraping of this site is discouraged. If you need
        rate data for an application, please contact us first to discuss
        access patterns.
      </p>

      <p className="mt-8 text-xs text-zinc-400">
        <a href="/" className="underline">
          ← Back to rates
        </a>
      </p>
    </main>
  );
}
