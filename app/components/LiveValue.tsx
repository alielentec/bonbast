"use client";

import { formatRial } from "@/app/lib/format";
import { useSim } from "./SimulationProvider";

/**
 * The price cell. When the simulation provider is active and has an
 * override for this code, render the override and run a crypto-style
 * up/down flash. Otherwise, render the server value verbatim.
 *
 * Visual model: matches the convention of major crypto exchanges
 * (Binance / TradingView / CoinGecko) — a saturated green/red fill
 * combined with matching ring + glow + text-color shift, all transitioning
 * together for a single 700ms "pop". Brighter and more urgent than the
 * subtle pastel highlight we had before.
 */
export function LiveValue({ code, value }: { code: string; value: number }) {
  const { overrides, flashes, enabled } = useSim();
  const current =
    enabled && overrides[code] !== undefined ? overrides[code] : value;
  const flash = flashes[code];

  // Tailwind shadow-colored utilities (Tailwind v4) give us a colored
  // glow without writing custom box-shadow CSS. The ring + bg + text
  // change land at the same time and decay together.
  const flashClass =
    flash === "up"
      ? "bg-emerald-500/30 text-emerald-700 ring-1 ring-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.45)] dark:bg-emerald-500/25 dark:text-emerald-300"
      : flash === "down"
        ? "bg-rose-500/30 text-rose-700 ring-1 ring-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.45)] dark:bg-rose-500/25 dark:text-rose-300"
        : "bg-transparent text-inherit ring-1 ring-transparent shadow-none";

  return (
    <span
      // -mx-1 px-1 keeps the cell width identical with or without the ring
      // so the row doesn't jiggle 2px when a flash mounts/unmounts.
      className={`-mx-1 inline-block rounded px-1 transition-all duration-700 ${flashClass}`}
    >
      {formatRial(current)}
    </span>
  );
}
