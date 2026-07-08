export function inr(n: number | undefined | null): string {
  const v = Number(n || 0);
  return "₹" + Math.round(v).toLocaleString("en-IN");
}

export function inrCompact(n: number | undefined | null): string {
  const v = Number(n || 0);
  if (Math.abs(v) >= 100000) return "₹" + (v / 100000).toFixed(1) + "L";
  if (Math.abs(v) >= 1000) return "₹" + (v / 1000).toFixed(1) + "k";
  return "₹" + Math.round(v);
}

export function pct(n: number | undefined | null, digits = 0): string {
  return (Number(n || 0) * 100).toFixed(digits) + "%";
}

export function titleCase(s: string): string {
  return s.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function dateShort(s: string): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
