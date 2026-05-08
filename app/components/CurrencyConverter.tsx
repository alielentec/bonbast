"use client";

import { useEffect, useMemo, useState } from "react";
import Flag from "react-flagpack";
import { ArrowLeftRight } from "lucide-react";
import type { FiatRate } from "@/app/lib/types";
import { convert } from "@/app/lib/convert";
import { detectCurrencyFromLocale } from "@/app/lib/country-currency";
import { ShareMenu } from "./ShareMenu";

const IRR_FLAG = "IR";

function formatShamsi(d: Date): string {
  return d.toLocaleString("en-u-ca-persian", {
    timeZone: "Asia/Tehran",
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLocal(d: Date): string {
  return d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function localTzLabel(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.split("/").pop()?.replace(/_/g, " ") ?? "Local";
  } catch {
    return "Local";
  }
}

type Option = { code: string; flagCode: string; nameEn: string };
type Side = "from" | "to";

const IRR_OPTION: Option = { code: "TOMAN", flagCode: "IR", nameEn: "Toman (Iran)" };

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1000) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  if (abs >= 1) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
  if (abs > 0) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(n);
  return "0";
}

export function CurrencyConverter({ rates }: { rates: FiatRate[] }) {
  const options = useMemo<Option[]>(
    () => [
      IRR_OPTION,
      ...rates.map((r) => ({ code: r.code, flagCode: r.flagCode, nameEn: r.nameEn })),
    ],
    [rates],
  );

  const [from, setFrom] = useState<string>("TOMAN");
  const [to, setTo] = useState<string>("USD");

  // Single source of truth: whichever side the user last typed in.
  // The other side is always derived via convert().
  const [activeSide, setActiveSide] = useState<Side>("from");
  const [activeValue, setActiveValue] = useState<string>("1000000");

  // After mount, refine "to" based on visitor's locale (USD fallback).
  // Only touches "to" — "from" stays IRR per spec.
  useEffect(() => {
    const detected = detectCurrencyFromLocale();
    if (detected && detected !== "TOMAN" && options.some((o) => o.code === detected)) {
      setTo(detected);
    }
  }, [options]);

  // Compute the "other" side from the active side. This recalculates
  // automatically when activeValue, currency selections, or rates change.
  const otherValue = useMemo(() => {
    const parsed = parseFloat(activeValue.replace(/,/g, ""));
    if (!Number.isFinite(parsed)) return "";
    const result =
      activeSide === "from"
        ? convert(parsed, from, to, rates)
        : convert(parsed, to, from, rates);
    return result === null ? "" : formatNumber(result);
  }, [activeValue, activeSide, from, to, rates]);

  const fromValue = activeSide === "from" ? activeValue : otherValue;
  const toValue = activeSide === "to" ? activeValue : otherValue;

  const handleChange = (side: Side) => (v: string) => {
    // Strip commas while typing so paste of formatted numbers also works.
    const cleaned = v.replace(/,/g, "");
    setActiveSide(side);
    setActiveValue(cleaned);
  };

  const swap = () => {
    // Flip currencies AND active side so the displayed values flip naturally:
    // "100 USD = 92 EUR"  →  "92 EUR = 100 USD"
    setFrom(to);
    setTo(from);
    setActiveSide(activeSide === "from" ? "to" : "from");
  };

  const fromOpt = options.find((o) => o.code === from);
  const toOpt = options.find((o) => o.code === to);
  const fxOne = useMemo(() => convert(1, from, to, rates), [from, to, rates]);

  // Mount gate. The share data depends on browser-only values
  // (current time, browser timezone), so we only render the ShareMenu
  // client-side to avoid hydration mismatches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const shareData = useMemo(() => {
    const now = new Date();
    // Always display formatted (comma-separated) numbers in the share output,
    // regardless of which side the user typed in raw.
    const reformat = (v: string): string => {
      const n = parseFloat(v.replace(/,/g, ""));
      return Number.isFinite(n) ? formatNumber(n) : v;
    };
    return {
      fromCode: from,
      fromAmount: reformat(fromValue || "0"),
      toCode: to,
      toAmount: reformat(toValue || "0"),
      ratePerOne:
        fxOne !== null && fromOpt && toOpt
          ? `1 ${fromOpt.code} ≈ ${formatNumber(fxOne)} ${toOpt.code}`
          : "",
      tehran: formatShamsi(now),
      local: formatLocal(now),
      localLabel: localTzLabel(),
    };
  }, [from, to, fromValue, toValue, fxOne, fromOpt, toOpt]);

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <header className="flex items-baseline justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-baseline gap-3 min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
            Currency Converter
          </h2>
          {fxOne !== null && fromOpt && toOpt && (
            <span className="hidden truncate font-mono text-[11px] text-zinc-500 sm:inline dark:text-zinc-400">
              1 {fromOpt.code} ≈ {formatNumber(fxOne)} {toOpt.code}
            </span>
          )}
        </div>
        {mounted && (
          <ShareMenu
            data={shareData}
            fromFlag={fromOpt?.flagCode ?? IRR_FLAG}
            toFlag={toOpt?.flagCode ?? IRR_FLAG}
          />
        )}
      </header>

      <div className="grid grid-cols-1 items-stretch gap-2 p-3 sm:grid-cols-[1fr_auto_1fr]">
        <ConverterSide
          label="From"
          options={options}
          selected={from}
          onSelect={setFrom}
          value={fromValue}
          onValueChange={handleChange("from")}
          onFocus={() => setActiveSide("from")}
        />

        <button
          type="button"
          onClick={swap}
          aria-label="Swap currencies"
          className="mx-auto flex h-9 w-9 items-center justify-center self-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-900 sm:my-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeftRight size={14} />
        </button>

        <ConverterSide
          label="To"
          options={options}
          selected={to}
          onSelect={setTo}
          value={toValue}
          onValueChange={handleChange("to")}
          onFocus={() => setActiveSide("to")}
        />
      </div>
    </section>
  );
}

function ConverterSide({
  label,
  options,
  selected,
  onSelect,
  value,
  onValueChange,
  onFocus,
}: {
  label: string;
  options: Option[];
  selected: string;
  onSelect: (code: string) => void;
  value: string;
  onValueChange: (v: string) => void;
  onFocus: () => void;
}) {
  const opt = options.find((o) => o.code === selected) ?? options[0];

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-zinc-200 bg-zinc-50/50 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/30">
      <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-[18px] w-6 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10">
          <Flag code={opt.flagCode} size="S" hasBorder={false} />
        </span>
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          aria-label={`${label} currency`}
          className="min-w-0 flex-1 truncate rounded border border-zinc-200 bg-white px-2 py-1 text-sm font-medium text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.code} — {o.nameEn}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={onFocus}
        aria-label={`${label} amount`}
        className="w-full rounded border border-zinc-200 bg-white px-2 py-1.5 text-right font-mono text-base tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
    </div>
  );
}
