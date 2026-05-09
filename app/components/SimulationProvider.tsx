"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { roundTo10 } from "@/app/lib/format";

export type FlashKind = "up" | "down";

type SimState = {
  // True = ticking. False = display server-fetched values verbatim.
  enabled: boolean;
  // Tick frequency. Min 1s; max 300s to keep the input field reasonable.
  intervalSec: number;
  // Per-code current value when simulation has touched it. Empty when
  // simulation is disabled or hasn't ticked yet.
  overrides: Record<string, number>;
  // Per-code active flash. Cleared 1.2s after the tick that set it.
  flashes: Record<string, FlashKind>;
};

type SimAPI = SimState & {
  toggle: () => void;
  setIntervalSec: (s: number) => void;
};

const SimContext = createContext<SimAPI | null>(null);

/** Read sim state. Falls back to "off" when no provider — components stay
 *  usable in isolation (e.g. tests). */
export function useSim(): SimAPI {
  const ctx = useContext(SimContext);
  return (
    ctx ?? {
      enabled: false,
      intervalSec: 5,
      overrides: {},
      flashes: {},
      toggle: () => {},
      setIntervalSec: () => {},
    }
  );
}

const FLASH_HOLD_MS = 1200; // how long the highlight stays "in" before fading
const PICKS_PER_TICK_MIN = 3;
const PICKS_PER_TICK_MAX = 5;
const PCT_DELTA = 0.01; // ±1% per the spec

export function SimulationProvider({
  baseValues,
  children,
}: {
  // Map from rate code → server-fetched Toman value. Used as the "current"
  // value to perturb on each tick after we've started overriding it. We
  // re-key off the server values whenever they change (e.g. ISR refresh).
  baseValues: Record<string, number>;
  children: ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);
  const [intervalSec, setIntervalSecState] = useState(5);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [flashes, setFlashes] = useState<Record<string, FlashKind>>({});

  // Mirror the latest base values into a ref so the interval closure can
  // read them without re-subscribing every time the server data changes.
  const baseRef = useRef(baseValues);
  baseRef.current = baseValues;

  const toggle = useCallback(() => {
    setEnabled((v) => {
      const next = !v;
      // Stopping clears overrides so the user immediately sees real values.
      if (!next) {
        setOverrides({});
        setFlashes({});
      }
      return next;
    });
  }, []);

  const setIntervalSec = useCallback((s: number) => {
    if (!Number.isFinite(s)) return;
    setIntervalSecState(Math.max(1, Math.min(300, Math.round(s))));
  }, []);

  // The simulation loop. Recreated only when enable/interval changes so
  // the timer cadence is stable; mid-tick edits to baseValues or overrides
  // are read via refs (baseRef) and functional updaters.
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const codes = Object.keys(baseRef.current);
      if (codes.length === 0) return;

      const targetCount =
        PICKS_PER_TICK_MIN +
        Math.floor(Math.random() * (PICKS_PER_TICK_MAX - PICKS_PER_TICK_MIN + 1));
      const picks = new Set<string>();
      while (picks.size < Math.min(targetCount, codes.length)) {
        picks.add(codes[Math.floor(Math.random() * codes.length)]);
      }

      const flashUpdates: Record<string, FlashKind> = {};

      setOverrides((prev) => {
        const next = { ...prev };
        for (const code of picks) {
          // Use the previous override if any, else the latest server value.
          const current = prev[code] ?? baseRef.current[code];
          if (current === undefined || current <= 0) continue;
          const delta = (Math.random() * 2 - 1) * PCT_DELTA; // ±1%
          const candidate = roundTo10(current * (1 + delta));
          // After rounding to 10, very small values can equal current — nudge so
          // the user always sees motion when the simulation is "live".
          const nudged =
            candidate === current
              ? roundTo10(current + (delta >= 0 ? 10 : -10))
              : candidate;
          next[code] = nudged;
          flashUpdates[code] = nudged >= current ? "up" : "down";
        }
        return next;
      });

      // Stamp flashes; clear them after the hold window so CSS can fade.
      setFlashes((prev) => ({ ...prev, ...flashUpdates }));
      window.setTimeout(() => {
        setFlashes((prev) => {
          const cleaned = { ...prev };
          for (const code of Object.keys(flashUpdates)) {
            // Only clear if still our flash — a more recent tick takes priority.
            if (cleaned[code] === flashUpdates[code]) delete cleaned[code];
          }
          return cleaned;
        });
      }, FLASH_HOLD_MS);
    };

    const id = window.setInterval(tick, intervalSec * 1000);
    return () => window.clearInterval(id);
  }, [enabled, intervalSec]);

  return (
    <SimContext.Provider
      value={{
        enabled,
        intervalSec,
        overrides,
        flashes,
        toggle,
        setIntervalSec,
      }}
    >
      {children}
    </SimContext.Provider>
  );
}
