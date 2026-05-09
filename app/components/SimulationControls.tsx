"use client";

import { Play, Pause } from "lucide-react";
import { useSim } from "./SimulationProvider";

/**
 * Live-demo controls. Off by default; when toggled on, prices in all rate
 * tables get nudged ±1% every `intervalSec` seconds with a flash on the
 * affected cells. Useful for screencasts, marketing, and showing visitors
 * the page is alive without committing to real WebSocket updates.
 *
 * Visual contract: the toggle button changes color (zinc → emerald) when
 * the simulation is active, so the state is unambiguous at a glance.
 */
export function SimulationControls() {
  const { enabled, intervalSec, toggle, setIntervalSec } = useSim();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium shadow-sm transition ${
          enabled
            ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
        title={
          enabled
            ? "Stop the live-pricing demo"
            : "Start a live-pricing demo (random ±1% nudges every N seconds)"
        }
      >
        {enabled ? <Pause size={12} /> : <Play size={12} />}
        {enabled ? "Live demo" : "Demo"}
      </button>
      <label className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
        <input
          type="number"
          min={1}
          max={300}
          step={1}
          value={intervalSec}
          onChange={(e) => setIntervalSec(parseInt(e.target.value, 10))}
          className="h-8 w-12 rounded-md border border-zinc-200 bg-white px-1.5 text-center text-xs text-zinc-700 shadow-sm focus:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          aria-label="Tick interval in seconds"
        />
        sec
      </label>
    </div>
  );
}
