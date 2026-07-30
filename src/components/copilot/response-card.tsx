import type { ResponseCard } from "@/lib/copilot-data";
import { Check, Sparkles, TrendingUp } from "lucide-react";

export function ResponseCardView({ card }: { card: ResponseCard }) {
  if (card.type === "ats") {
    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-border/70 bg-surface-elevated/70 shadow-elevation-1">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> {card.title}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-2xl font-bold text-transparent tabular-nums">
              {card.score}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
              <TrendingUp className="h-3 w-3" />+{card.delta}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 text-xs">
          <div>
            <div className="mb-1.5 font-medium text-muted-foreground">Matched</div>
            <div className="flex flex-wrap gap-1">
              {card.keywords.matched.map((k) => (
                <span key={k} className="rounded-md bg-success/10 px-1.5 py-0.5 text-success">
                  {k}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 font-medium text-muted-foreground">Missing</div>
            <div className="flex flex-wrap gap-1">
              {card.keywords.missing.map((k) => (
                <span key={k} className="rounded-md bg-warning/10 px-1.5 py-0.5 text-warning">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (card.type === "checklist") {
    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-border/70 bg-surface-elevated/70 shadow-elevation-1">
        <div className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {card.title}
        </div>
        <ul className="divide-y divide-border/60">
          {card.items.map((it, i) => (
            <li key={i} className="flex items-center gap-2.5 px-4 py-2.5 text-sm">
              <span
                className={
                  "grid h-4 w-4 place-items-center rounded-md border " +
                  (it.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/40")
                }
              >
                {it.done && <Check className="h-3 w-3" />}
              </span>
              <span className={it.done ? "text-muted-foreground line-through" : ""}>{it.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (card.type === "table") {
    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-border/70 bg-surface-elevated/70 shadow-elevation-1">
        <div className="border-b border-border/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {card.title}
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60 text-left text-muted-foreground">
              {card.columns.map((c) => (
                <th key={c} className="px-4 py-2 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {card.rows.map((row, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 tabular-nums">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  // job-match
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border/70 bg-surface-elevated/70 shadow-elevation-1">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {card.title}
          </div>
          <div className="mt-0.5 text-sm font-semibold">{card.company}</div>
        </div>
        <div className="bg-linear-to-r from-primary to-accent bg-clip-text text-2xl font-bold text-transparent tabular-nums">
          {card.score}%
        </div>
      </div>
      <div className="space-y-2.5 p-4">
        {card.factors.map((f) => (
          <div key={f.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{f.label}</span>
              <span className="tabular-nums">{f.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-accent"
                style={{ width: `${f.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
