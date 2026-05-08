export function formatRial(value: number): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US").format(value);
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
