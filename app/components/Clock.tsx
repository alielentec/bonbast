"use client";

import { useEffect, useState } from "react";

type FormatOpts = { tz?: string; persian?: boolean };

function format(iso: string, opts: FormatOpts = {}): string {
  // Locale extension `u-ca-persian` selects the Shamsi (Jalali) calendar
  // while `en` keeps digits and month names in English transliteration
  // (e.g. "Ordibehesht 12, 1405" instead of "اردیبهشت ۱۲، ۱۴۰۵").
  const locale = opts.persian ? "en-u-ca-persian" : "en-US";
  return new Date(iso).toLocaleString(locale, {
    timeZone: opts.tz,
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function shortTz(tz?: string): string {
  if (!tz) {
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "Local";
    }
  }
  const parts = tz.split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

export function TwoClocks({ updatedAt }: { updatedAt: string }) {
  const [localText, setLocalText] = useState<string | null>(null);
  const [localLabel, setLocalLabel] = useState<string>("Local");

  useEffect(() => {
    setLocalText(format(updatedAt));
    setLocalLabel(shortTz());
  }, [updatedAt]);

  return (
    <div className="flex flex-col items-end gap-0.5 text-xs">
      <ClockRow
        label="Tehran"
        sublabel="Shamsi"
        value={format(updatedAt, { tz: "Asia/Tehran", persian: true })}
      />
      <ClockRow
        label={localLabel}
        value={localText ?? "—"}
        muted={localText === null}
      />
    </div>
  );
}

function ClockRow({
  label,
  sublabel,
  value,
  muted,
}: {
  label: string;
  sublabel?: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 leading-tight">
      <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
        {sublabel && (
          <span className="ml-1 rounded bg-zinc-100 px-1 py-px text-[8px] font-medium normal-case tracking-normal text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {sublabel}
          </span>
        )}
      </span>
      <time
        suppressHydrationWarning
        className={`font-mono ${muted ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}`}
      >
        {value}
      </time>
    </div>
  );
}
