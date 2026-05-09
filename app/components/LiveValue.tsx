"use client";

import { formatRial } from "@/app/lib/format";
import { useSim } from "./SimulationProvider";

/**
 * The price cell. When the simulation provider is active and has an
 * override for this code, render the override and run an up/down flash.
 * Otherwise, render the server value verbatim.
 *
 * Animation: a single `transition-colors` rule fades the background in
 * when `flash` is set (via tailwind class) and fades it out when it
 * clears 1.2s later — symmetrical "enter and exit" with no JS animation
 * frames needed.
 */
export function LiveValue({ code, value }: { code: string; value: number }) {
  const { overrides, flashes, enabled } = useSim();
  const current = enabled && overrides[code] !== undefined ? overrides[code] : value;
  const flash = flashes[code];

  const flashClass =
    flash === "up"
      ? "bg-emerald-500/25 ring-1 ring-emerald-400/40"
      : flash === "down"
        ? "bg-rose-500/25 ring-1 ring-rose-400/40"
        : "bg-transparent ring-1 ring-transparent";

  return (
    <span
      // -mx-1 px-1 keeps the cell width identical with or without the ring.
      // Otherwise the row would jiggle by 2px when the highlight appears.
      className={`-mx-1 inline-block rounded px-1 transition-all duration-700 ${flashClass}`}
    >
      {formatRial(current)}
    </span>
  );
}
