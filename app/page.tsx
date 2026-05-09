import { Header } from "./components/Header";
import { RatesSection } from "./components/RatesSection";
import { AdSlot } from "./components/AdSlot";
import { CurrencyConverter } from "./components/CurrencyConverter";
import { fetchTgjuRates } from "./lib/tgju-fetcher";
import { crossCheckRates } from "./lib/sanity-check";
import { mockRates } from "./lib/mock-rates";

// We can't statically prerender at build time because Vercel's build server
// runs in us-east-1 and tgju.org blocks US datacenter IPs (Iran-region CDN
// policy). Force runtime rendering in Frankfurt instead — there the fetch
// to tgju succeeds.
//
// Cost is still near-zero: the upstream fetches are cached by Next.js for
// 1 hour each (revalidate: 3600 inside the fetcher), so only the very first
// request after each hour boundary actually hits tgju. The per-visit work
// is just template rendering with already-cached data.
export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

export default async function Home() {
  // Per-section fallback already happens inside fetchTgjuRates. This outer
  // try/catch only covers a catastrophic upstream failure (DNS, etc.).
  let snapshot;
  try {
    snapshot = await fetchTgjuRates();
  } catch {
    snapshot = mockRates;
  }
  const { updatedAt, fiat, gold, crypto } = snapshot;

  // Cross-check against Frankfurter (ECB-quoted majors). Logs warnings
  // server-side so they show up in build output and Vercel function logs.
  // Failure here never blocks the page render.
  const sanity = await crossCheckRates(snapshot);
  if (sanity.flagged.length > 0) {
    console.warn(
      `[sanity] ${sanity.flagged.length} currencies drifted >25% vs Frankfurter:`,
      sanity.flagged
        .map(
          (f) =>
            `${f.code} got=${f.actualToman} expected≈${f.expectedToman} (${f.errorPct.toFixed(0)}% off)`,
        )
        .join("; "),
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        <Header updatedAt={updatedAt} />

        {/* AdSense slot 1: top banner — placed BELOW the header (Google policy:
            avoid placing ads above the page title that push primary content
            below the fold). */}
        <AdSlot size="leaderboard" />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main column */}
          <div className="space-y-4">
            <RatesSection title="Currencies" rates={fiat} columns={2} />

            {/* AdSense slot 2: in-feed between sections.
                Google policy: in-feed/in-article ads are encouraged when
                visually separated from the surrounding content. The dashed
                border + label make the ad clearly distinguishable. */}
            <AdSlot size="in-feed" />

            <RatesSection title="Gold" rates={gold} />
            <RatesSection title="Cryptocurrency" rates={crypto} />

            {/* Currency converter — placed at the bottom per spec.
                Defaults: from=IRR (always), to=auto-detected from
                navigator.language, falling back to USD. */}
            <CurrencyConverter rates={fiat} />
          </div>

          {/* Sidebar — only on lg+ screens. Hidden on mobile so it never
              pushes content below the fold. Sticky so it stays visible
              while the user scrolls the long rates list. */}
          <aside className="hidden lg:block">
            <AdSlot size="sidebar" />
          </aside>
        </div>

        <footer className="mt-8 border-t border-zinc-200 pt-3 text-center text-[11px] text-zinc-400 dark:border-zinc-800">
          <p>
            Live free-market rates sourced hourly from{" "}
            <a
              href="https://www.tgju.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              tgju.org
            </a>
            . Prices in Iranian Toman (1 Toman = 10 Rials).
          </p>
          {sanity.verified > 0 && (
            <p
              className="mt-1"
              title={
                sanity.flagged.length > 0
                  ? sanity.flagged
                      .map(
                        (f) =>
                          `${f.code}: got ${f.actualToman.toLocaleString()}, expected ≈${f.expectedToman.toLocaleString()} (${f.errorPct.toFixed(0)}% off)`,
                      )
                      .join("\n")
                  : "All cross-checked currencies match within 25% of ECB-implied rates."
              }
            >
              Cross-checked against{" "}
              <a
                href="https://www.frankfurter.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Frankfurter
              </a>{" "}
              (ECB rates):{" "}
              <span
                className={
                  sanity.flagged.length === 0
                    ? "text-emerald-500"
                    : "text-amber-500"
                }
              >
                {sanity.verified} verified
                {sanity.flagged.length > 0
                  ? `, ${sanity.flagged.length} flagged`
                  : " ✓"}
              </span>
              .
            </p>
          )}
        </footer>
      </main>
    </div>
  );
}
