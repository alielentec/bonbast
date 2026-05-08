import Flag from "react-flagpack";
import { TokenIcon } from "@web3icons/react/dynamic";
import { Coins, ArrowUp, ArrowDown } from "lucide-react";
import type { Rate } from "@/app/lib/types";
import { formatRial, formatChange, changeColor } from "@/app/lib/format";

function RateIcon({ rate }: { rate: Rate }) {
  if (rate.kind === "fiat") {
    return (
      <span className="block h-[18px] w-6 overflow-hidden rounded-[2px] ring-1 ring-black/10">
        <Flag code={rate.flagCode} size="S" hasBorder={false} />
      </span>
    );
  }
  if (rate.kind === "crypto") {
    return (
      <TokenIcon
        symbol={rate.symbol}
        variant="branded"
        size={20}
        fallback={
          <span className="block h-5 w-5 rounded-full bg-zinc-200 text-center text-[8px] font-bold leading-5 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            {rate.code}
          </span>
        }
      />
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
      <Coins size={12} strokeWidth={2.5} />
    </span>
  );
}

export function RateRow({ rate, compact = false }: { rate: Rate; compact?: boolean }) {
  const change = rate.change;
  const isUp = change !== undefined && change > 0;
  const isDown = change !== undefined && change < 0;
  const showCode = rate.kind === "fiat";
  // The Buy column is hidden in compact (2-column) mode to give the Name
  // column enough width — small viewports still hide it via responsive classes.
  const hideBuy = compact;

  return (
    <tr className="group border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/80 dark:border-zinc-900 dark:hover:bg-zinc-900/40">
      <td className="py-1.5 pl-3 pr-1 align-middle">
        <span className="flex items-center">
          <RateIcon rate={rate} />
        </span>
      </td>
      {showCode && (
        <td className="py-1.5 px-1 align-middle font-mono text-[11px] font-semibold leading-none text-zinc-500 dark:text-zinc-400">
          {rate.code}
        </td>
      )}
      <td className="py-1.5 px-2 align-middle">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-medium leading-none text-zinc-900 dark:text-zinc-100">
            {rate.nameEn}
          </span>
          {rate.kind === "fiat" && rate.units && rate.units > 1 && (
            <span className="shrink-0 rounded bg-zinc-100 px-1 py-px font-mono text-[10px] font-medium leading-none text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              ×{rate.units}
            </span>
          )}
        </div>
      </td>
      <td className="py-1.5 px-2 text-right align-middle font-mono text-[13px] tabular-nums leading-none text-zinc-900 dark:text-zinc-100">
        {formatRial(rate.sell)}
      </td>
      {!hideBuy && (
        <td className="hidden py-1.5 px-2 text-right align-middle font-mono text-[13px] tabular-nums leading-none text-zinc-600 sm:table-cell dark:text-zinc-400">
          {formatRial(rate.buy)}
        </td>
      )}
      <td className={`py-1.5 pl-2 pr-3 text-right align-middle text-[11px] font-medium tabular-nums leading-none ${changeColor(change)}`}>
        <span className="inline-flex items-center gap-0.5">
          {isUp && <ArrowUp size={10} strokeWidth={3} />}
          {isDown && <ArrowDown size={10} strokeWidth={3} />}
          {formatChange(change)}
        </span>
      </td>
    </tr>
  );
}
