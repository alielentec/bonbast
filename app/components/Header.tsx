import { Activity, RefreshCw } from "lucide-react";
import { TwoClocks } from "./Clock";

export function Header({ updatedAt }: { updatedAt: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live Market Rates
        </div>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
          Iran Currency, Gold &amp; Crypto
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Free market rates updated hourly. Prices in Iranian Toman (1 Toman = 10 Rials).
        </p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex flex-col items-end gap-0.5">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-400">
            <Activity size={10} />
            Updated
          </span>
          <TwoClocks updatedAt={updatedAt} />
        </div>
        <button
          type="button"
          aria-label="Refresh rates"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>
    </header>
  );
}
