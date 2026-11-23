/* Tiny SVG charts for the CMS (no chart library). */

export function Spark({ values, color = "#0066FF", w = 110, h = 36 }: { values: number[]; color?: string; w?: number; h?: number }) {
  if (values.length < 2) return <svg width={w} height={h} />;
  const mx = Math.max(...values), mn = Math.min(...values);
  const pts = values.map((v, i) => [(i * w) / (values.length - 1), h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)]);
  const d = "M" + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L");
  const id = `s${Math.abs(values.reduce((a, v, i) => a + v * (i + 1), 0)).toString(36).slice(0, 6)}${color.slice(1)}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".22" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function LineChart({ a, b, labels, h = 200 }: { a: number[]; b?: number[]; labels: string[]; h?: number }) {
  const w = 760;
  if (a.length < 2) return <div className="flex h-50 items-center justify-center text-[#8494AB]">Not enough data yet.</div>;
  const line = (vals: number[], pad: number) => {
    const mx = Math.max(...vals) || 1;
    return "M" + vals.map((v, i) => `${((i * w) / (vals.length - 1)).toFixed(1)},${(h - 10 - (v / mx) * (h - pad)).toFixed(1)}`).join(" L");
  };
  const da = line(a, 30);
  return (
    <div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
        {[20, 70, 120, 170].map((y) => <line key={y} x1="0" x2={w} y1={y} y2={y} stroke="#EEF2F7" />)}
        <defs><linearGradient id="lc" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0066FF" stopOpacity=".18" /><stop offset="1" stopColor="#0066FF" stopOpacity="0" /></linearGradient></defs>
        <path d={`${da} L${w},${h} L0,${h} Z`} fill="url(#lc)" />
        <path d={da} fill="none" stroke="#0066FF" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        {b && <path d={line(b, 50)} fill="none" stroke="#7C3AED" strokeWidth="2" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-[#8494AB]"><span>{labels[0]}</span><span>{labels[labels.length - 1]}</span></div>
    </div>
  );
}
