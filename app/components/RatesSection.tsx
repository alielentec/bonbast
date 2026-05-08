import type { Rate } from "@/app/lib/types";
import { RateRow } from "./RateRow";

function RatesTable({
  rates,
  hasCode,
  compact,
}: {
  rates: Rate[];
  hasCode: boolean;
  compact: boolean;
}) {
  // Wider Sell column in non-compact mode (gold/crypto) since their numbers
  // can run to 14+ digits in Toman (e.g. Bitcoin ≈ 14,400,000,000).
  const sellWidth = compact ? "w-[110px]" : "w-[160px]";

  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <colgroup>
        <col className="w-[34px]" />
        {hasCode && <col className="w-[42px]" />}
        <col />
        <col className={sellWidth} />
      </colgroup>
      <thead>
        <tr className="border-b border-zinc-200 bg-zinc-50/40 text-[10px] font-medium uppercase tracking-widest text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/30">
          <th className="py-1.5 pl-3 pr-1 text-left font-medium"></th>
          {hasCode && <th className="py-1.5 px-1 text-left font-medium">Code</th>}
          <th className="py-1.5 px-2 text-left font-medium">Name</th>
          <th className="py-1.5 pl-2 pr-3 text-right font-medium">Toman</th>
        </tr>
      </thead>
      <tbody>
        {rates.map((rate) => (
          <RateRow key={rate.code} rate={rate} />
        ))}
      </tbody>
    </table>
  );
}

export function RatesSection({
  title,
  rates,
  columns = 1,
}: {
  title: string;
  rates: Rate[];
  columns?: 1 | 2;
}) {
  const hasCode = rates.length > 0 && rates[0].kind === "fiat";
  const half = Math.ceil(rates.length / 2);
  const left = rates.slice(0, half);
  const right = rates.slice(half);

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <header className="flex items-baseline justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
          {title}
        </h2>
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
          {rates.length} items
        </span>
      </header>

      {columns === 2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x lg:divide-zinc-200 lg:dark:divide-zinc-800">
          <RatesTable rates={left} hasCode={hasCode} compact />
          <RatesTable rates={right} hasCode={hasCode} compact />
        </div>
      ) : (
        <RatesTable rates={rates} hasCode={hasCode} compact={false} />
      )}
    </section>
  );
}
