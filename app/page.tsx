import { Header } from "./components/Header";
import { RatesSection } from "./components/RatesSection";
import { AdSlot } from "./components/AdSlot";
import { CurrencyConverter } from "./components/CurrencyConverter";
import { SimulationProvider } from "./components/SimulationProvider";
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

  // Flat code→sell-value map for the SimulationProvider. Includes every
  // displayed rate (fiat + gold + crypto) so the demo button affects the
  // entire page, not just currencies.
  const baseValues: Record<string, number> = Object.fromEntries(
    [...fiat, ...gold, ...crypto].map((r) => [r.code, r.sell]),
  );

  // Cross-check against Frankfurter (ECB-quoted majors). We compare the
  // foreign-vs-USD ratio implied by tgju's Toman values against the same
  // ratio from world FX markets. IRR is intentionally excluded — its
  // free-market premium isn't published by any public FX API.
  // Logs warnings server-side; never blocks the page render.
  const sanity = await crossCheckRates(snapshot);
  if (sanity.flagged.length > 0) {
    console.warn(
      `[sanity] ${sanity.flagged.length} cross-rates drifted >5% vs Frankfurter:`,
      sanity.flagged
        .map(
          (f) =>
            `${f.code}: tgju=$${f.tgjuUsdPerUnit.toFixed(4)} world=$${f.apiUsdPerUnit.toFixed(4)} (${f.errorPct.toFixed(1)}% off)`,
        )
        .join("; "),
    );
  }

  return (
    <SimulationProvider baseValues={baseValues}>
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

        <footer className="mt-10 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                About
              </h3>
              <ul className="space-y-1.5">
                <li><a href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100">About this site</a></li>
                <li><a href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-100">Contact</a></li>
                <li><a href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-100">Privacy policy</a></li>
                <li><a href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-100">Terms &amp; disclaimer</a></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                Data
              </h3>
              <ul className="space-y-1.5">
                <li>
                  Source:{" "}
                  <a
                    href="https://www.tgju.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    tgju.org
                  </a>
                </li>
                <li>Refresh: hourly</li>
                <li>Unit: Iranian Toman</li>
                <li className="text-[10px] text-zinc-400">1 Toman = 10 Rials</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                Verification
              </h3>
              {sanity.details.length > 0 ? (
                <p
                  title={
                    sanity.flagged.length > 0
                      ? sanity.flagged
                          .map(
                            (f) =>
                              `${f.code}: site says 1 ${f.code} = $${f.tgjuUsdPerUnit.toFixed(4)}, world says $${f.apiUsdPerUnit.toFixed(4)} (${f.errorPct.toFixed(1)}% off)`,
                          )
                          .join("\n")
                      : `All ${sanity.passed} foreign-vs-USD cross-rates match world FX markets within 5%. IRR/USD is the free-market rate, not verifiable against ECB.`
                  }
                  className="cursor-help"
                >
                  Cross-rates checked vs{" "}
                  <a
                    href="https://www.frankfurter.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    Frankfurter
                  </a>{" "}
                  (ECB).
                  <br />
                  <span
                    className={
                      sanity.flagged.length === 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }
                  >
                    {sanity.passed} of {sanity.details.length} match
                    {sanity.flagged.length === 0 ? " ✓" : ` · ${sanity.flagged.length} drifted`}
                  </span>
                </p>
              ) : (
                <p className="text-zinc-400">Cross-check unavailable.</p>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                Disclaimer
              </h3>
              <p className="leading-relaxed text-[11px]">
                Rates shown are for informational purposes only. Free-market
                quotes change continuously and may differ from actual exchange
                counter prices. Not financial advice.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-1 border-t border-zinc-100 pt-4 text-center text-[10px] text-zinc-400 dark:border-zinc-900">
            <p>
              &copy; {new Date().getFullYear()} Iran Rates &mdash; built with
              Next.js on Vercel.
            </p>
            <p>
              Persian-calendar dates rendered via Intl. No personal data
              collected; cookies used only for ad personalization where you
              consent.
            </p>
          </div>
        </footer>
      </main>
    </div>
    </SimulationProvider>
  );
}
