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
  // Upper bound for each currency's individual delay. Each currency
  // schedules its own next update at random(1..intervalSec) seconds.
  intervalSec: number;
  // Per-code current value when simulation has touched it. Empty when
  // simulation is disabled or hasn't ticked yet.
  overrides: Record<string, number>;
  // Per-code active flash. Cleared 1.4s after the tick that set it.
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

const FLASH_HOLD_MS = 1400; // how long the highlight stays "in" before fading
const PCT_DELTA = 0.01; // ±1% per the spec
// Fraction of all rate codes that are "alive" (running their own timer).
// 30% feels active without overwhelming — for ~40 codes this means ~12
// cells potentially updating, each at its own random cadence.
const ACTIVE_FRACTION = 0.3;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SimulationProvider({
  baseValues,
  children,
}: {
  baseValues: Record<string, number>;
  children: ReactNode;
}) {
  const [enabled, setEnabled] = useState(false);
  const [intervalSec, setIntervalSecState] = useState(5);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [flashes, setFlashes] = useState<Record<string, FlashKind>>({});

  // Mirror props/state into refs so the per-currency timers always read
  // the freshest values without re-arming when those values change.
  const baseRef = useRef(baseValues);
  baseRef.current = baseValues;
  const intervalRef = useRef(intervalSec);
  intervalRef.current = intervalSec;

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

  // The per-currency timer loop. Each "active" code self-reschedules with
  // a fresh random delay in [1s, intervalSec * 1s] every time it fires.
  // Reading intervalSec via ref avoids re-arming all timers when the user
  // tweaks the interval mid-run — they pick up the new bound on next fire.
  useEffect(() => {
    if (!enabled) return;

    let stopped = false;
    const codes = Object.keys(baseRef.current);
    if (codes.length === 0) return;
    // ~30% of all codes participate. The rest stay static this run.
    const activeCount = Math.max(3, Math.floor(codes.length * ACTIVE_FRACTION));
    const activeCodes = shuffle(codes).slice(0, activeCount);

    const fire = (code: string) => {
      if (stopped) return;
      // Compute the next value inside a functional state updater so we
      // always see the latest override chain (no stale closures).
      let newFlash: FlashKind | undefined;
      setOverrides((prev) => {
        const baseline = prev[code] ?? baseRef.current[code];
        if (baseline === undefined || baseline <= 0) return prev;
        const delta = (Math.random() * 2 - 1) * PCT_DELTA;
        const candidate = roundTo10(baseline * (1 + delta));
        // ±1% on small per-unit values can round to the original after
        // the round-to-10 — nudge by 10 in the chosen direction so the
        // user always sees motion when the simulation is "live".
        const nudged =
          candidate === baseline
            ? roundTo10(baseline + (delta >= 0 ? 10 : -10))
            : candidate;
        newFlash = nudged >= baseline ? "up" : "down";
        return { ...prev, [code]: nudged };
      });
      if (newFlash) {
        const f = newFlash;
        setFlashes((prev) => ({ ...prev, [code]: f }));
        window.setTimeout(() => {
          setFlashes((prev) => {
            // Only clear if still our flash — a more recent one supersedes.
            if (prev[code] !== f) return prev;
            const cleaned = { ...prev };
            delete cleaned[code];
            return cleaned;
          });
        }, FLASH_HOLD_MS);
      }
      schedule(code);
    };

    const schedule = (code: string) => {
      if (stopped) return;
      const max = Math.max(1, intervalRef.current);
      // Uniform distribution in [1s, intervalSec s] inclusive.
      const delaySec = max <= 1 ? 1 : 1 + Math.random() * (max - 1);
      window.setTimeout(() => fire(code), delaySec * 1000);
    };

    // Stagger initial firings too so they don't all bunch at t=0.
    for (const code of activeCodes) schedule(code);

    return () => {
      stopped = true;
    };
    // We intentionally exclude `intervalSec` from deps — the timers read
    // the latest value via intervalRef on every reschedule. This avoids
    // tearing down all timers and re-creating them every keystroke in the
    // interval input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

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
