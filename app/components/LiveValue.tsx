"use client";

import { formatRial } from "@/app/lib/format";
import { useSim } from "./SimulationProvider";

/**
 * Just the formatted price text. Reads the simulator override when one
 * exists; otherwise renders the server value verbatim.
 *
 * The flash background/glow lives on the parent <td> (in RateRow) so it
 * fills the entire cell. Doing it there gives a much larger highlight
 * surface than wrapping just the digit string would.
 */
export function LiveValue({ code, value }: { code: string; value: number }) {
  const { overrides, enabled } = useSim();
  const current =
    enabled && overrides[code] !== undefined ? overrides[code] : value;
  return <>{formatRial(current)}</>;
}
