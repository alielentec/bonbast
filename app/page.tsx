import { Header } from "./components/Header";
import { RatesSection } from "./components/RatesSection";
import { AdSlot } from "./components/AdSlot";
import { CurrencyConverter } from "./components/CurrencyConverter";
import { mockRates } from "./lib/mock-rates";

export default function Home() {
  const { updatedAt, fiat, gold, crypto } = mockRates;

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
          <p>Mock data shown for layout testing — live data wiring is the next step.</p>
        </footer>
      </main>
    </div>
  );
}
