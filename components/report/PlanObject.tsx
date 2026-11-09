/** Top-view symbols, drawn in the app's drafting style. */
export function PlanObject({ kind, type, width, height }: { kind: string; type?: string; width: number; height: number }) {
  if (kind === "speaker") return <g className="fill-card stroke-primary" strokeWidth="1.4">
    <rect x={-9} y={-13} width={18} height={26} rx={2} />
    <circle cx={0} cy={4} r={5} className="fill-primary/15" /><circle cx={0} cy={-7} r={2} />
  </g>
  if (kind === "listening") return <g className="fill-card stroke-success" strokeWidth="1.5">
    <circle cx={0} cy={-5} r={5} /><path d="M-9 11 Q-9 2 0 2 Q9 2 9 11 Z" />
  </g>
  const w = Math.max(14, width), h = Math.max(12, height)
  const x = -w / 2, y = -h / 2
  if (["sofa", "sillon", "cama"].includes(type ?? "")) return <g className="fill-secondary stroke-muted-foreground" strokeWidth="1">
    <rect x={x} y={y} width={w} height={h} rx={3} />
    <rect x={x + 3} y={y + 3} width={w - 6} height={type === "cama" ? Math.min(10, h / 3) : Math.max(4, h - 8)} rx={2} className="fill-card" />
    {type === "sofa" && <line x1={0} y1={y + 3} x2={0} y2={h / 2 - 5} />}
    {type !== "cama" && <><line x1={x + 4} y1={y + 3} x2={x + 4} y2={h / 2 - 3} /><line x1={w / 2 - 4} y1={y + 3} x2={w / 2 - 4} y2={h / 2 - 3} /></>}
  </g>
  if (["mesa", "escritorio"].includes(type ?? "")) return <g className="fill-card stroke-muted-foreground" strokeWidth="1">
    <rect x={x} y={y} width={w} height={h} rx={2} />
    {type === "escritorio" ? <><rect x={-6} y={y + 3} width={12} height={6} rx={1} /><line x1={-4} y1={y + 11} x2={4} y2={y + 11} /></> : <><path d={`M${x + 4} ${y - 3} h${Math.max(6, w - 8)} M${x + 4} ${h / 2 + 3} h${Math.max(6, w - 8)}`} /></>}
  </g>
  if (["estanteria", "biblioteca", "placard"].includes(type ?? "")) return <g className="fill-secondary stroke-muted-foreground" strokeWidth="1">
    <rect x={x} y={y} width={w} height={h} rx={1} />
    {[.25, .5, .75].map(f => <line key={f} x1={x + 2} y1={y + h * f} x2={w / 2 - 2} y2={y + h * f} />)}
  </g>
  if (type?.startsWith("cortina")) return <g className="fill-none stroke-muted-foreground" strokeWidth="1.2">
    <rect x={x} y={y} width={w} height={h} rx={1} />
    {[.2, .4, .6, .8].map(f => <line key={f} x1={x + w * f} y1={y + 1} x2={x + w * f} y2={h / 2 - 1} />)}
  </g>
  if (type?.startsWith("alfombra")) return <g className="fill-secondary/60 stroke-muted-foreground" strokeWidth=".8">
    <rect x={x} y={y} width={w} height={h} rx={2} /><rect x={x + 3} y={y + 3} width={Math.max(1, w - 6)} height={Math.max(1, h - 6)} rx={1} fill="none" strokeDasharray="2 2" />
  </g>
  return <rect x={x} y={y} width={w} height={h} rx={2} className="fill-secondary stroke-muted-foreground" strokeWidth="1" />
}
