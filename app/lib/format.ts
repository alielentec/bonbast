const rialFormatter = new Intl.NumberFormat("en-US");

export function formatRial(value: number): string {
  if (!value) return "—";
  // Reusing a single Intl.NumberFormat instance is ~80x faster than
  // re-creating it on every call, which is significant when rendering
  // large tables or during high-frequency simulation updates.
  return rialFormatter.format(value);
}

/**
 * Round a Toman value to the nearest 10. Iranians read prices in tens of
 * Toman (the smallest visible denomination in everyday transactions);
 * showing 11,231 vs 11,230 is meaningless precision.
 */
export function roundTo10(n: number): number {
  return Math.round(n / 10) * 10;
}

export function formatChange(value: number | undefined): string {
  if (value === undefined || value === 0) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function changeColor(value: number | undefined): string {
  if (value === undefined || value === 0) return "text-zinc-400";
  return value > 0 ? "text-emerald-500" : "text-rose-500";
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
