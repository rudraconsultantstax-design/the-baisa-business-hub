import { inr, inrCompact } from "@/lib/format";

// Validated dark categorical palette (see dataviz skill; passes all six checks
// on the app's #14141c surface). Colours follow the entity, assigned in order.
export const CAT = ["#3987e5", "#199e70", "#c98500", "#9085e9", "#e66767", "#d55181", "#d95926", "#008300"];
export const ACCENT = "#c9a24b";

// Horizontal bars — magnitude by category. Direct value labels (no legend needed:
// the row label names each bar). Native <title> gives the hover tooltip.
export function Bars({
  items,
  money = true,
  colored = false,
  labelWidth = 150
}: {
  items: { label: string; value: number; hint?: string }[];
  money?: boolean;
  colored?: boolean;
  labelWidth?: number;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const fmt = (v: number) => (money ? inrCompact(v) : String(v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, idx) => (
        <div key={it.label} style={{ display: "grid", gridTemplateColumns: `${labelWidth}px 1fr 62px`, gap: 10, alignItems: "center" }} title={it.hint || `${it.label}: ${money ? inr(it.value) : it.value}`}>
          <span style={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-2)" }}>{it.label}</span>
          <div style={{ background: "var(--bg-surface)", borderRadius: 6, height: 18, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max((it.value / max) * 100, it.value > 0 ? 3 : 0)}%`,
                height: "100%",
                borderRadius: 6,
                background: colored ? CAT[idx % CAT.length] : ACCENT
              }}
            />
          </div>
          <span className="mono" style={{ fontSize: "0.76rem", textAlign: "right", fontWeight: 600 }}>{fmt(it.value)}</span>
        </div>
      ))}
      {items.length === 0 && <p className="muted">No data yet.</p>}
    </div>
  );
}

// Single-series trend — change over time. Area + line, min/max direct labels.
export function AreaTrend({ points, height = 150, format }: { points: { label: string; value: number }[]; height?: number; format?: (v: number) => string }) {
  if (points.length < 2) return <p className="muted">Not enough data to plot a trend.</p>;
  const fmt = format || inrCompact;
  const W = 620;
  const H = height;
  const pad = { l: 8, r: 8, t: 14, b: 22 };
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = 0;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / (points.length - 1);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(H - pad.b).toFixed(1)} L${x(0).toFixed(1)},${(H - pad.b).toFixed(1)} Z`;
  const maxI = points.reduce((m, p, i) => (p.value > points[m].value ? i : m), 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Trend over time">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(maxI)} cy={y(points[maxI].value)} r="4" fill={ACCENT} />
      <text x={x(maxI)} y={y(points[maxI].value) - 8} fill="var(--text)" fontSize="11" textAnchor="middle" fontWeight="700">
        {fmt(points[maxI].value)}
      </text>
      {points.map((p, i) =>
        i % Math.ceil(points.length / 8) === 0 || i === points.length - 1 ? (
          <text key={i} x={x(i)} y={H - 6} fill="var(--text-3)" fontSize="10" textAnchor="middle">
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

// Donut — part-to-whole. Legend + direct % is provided alongside by the caller.
export function Donut({ items, size = 168 }: { items: { label: string; value: number }[]; size?: number }) {
  const total = items.reduce((a, i) => a + i.value, 0) || 1;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 20;
  let offset = 0;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Composition">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-surface)" strokeWidth={stroke} />
      {items.map((it, idx) => {
        const frac = it.value / total;
        const dash = frac * circ;
        const el = (
          <circle
            key={it.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={CAT[idx % CAT.length]}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          >
            <title>{`${it.label}: ${Math.round(frac * 100)}%`}</title>
          </circle>
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 2} textAnchor="middle" fill="var(--text)" fontSize="15" fontWeight="800">
        {items.length}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text-3)" fontSize="9">
        segments
      </text>
    </svg>
  );
}

export function Legend({ items }: { items: { label: string; value: number }[] }) {
  const total = items.reduce((a, i) => a + i.value, 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, idx) => (
        <div key={it.label} className="spread" style={{ fontSize: "0.8rem" }}>
          <span className="row" style={{ gap: 7 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: CAT[idx % CAT.length], display: "inline-block" }} />
            {it.label}
          </span>
          <b className="mono">{Math.round((it.value / total) * 100)}%</b>
        </div>
      ))}
    </div>
  );
}
