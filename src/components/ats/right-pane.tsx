import { useState } from "react";
import {
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  Zap,
  Check,
  ListChecks,
  GitBranch,
  Plus,
  ChevronRight,
  Wand2,
  ArrowLeftRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  criticalIssues,
  warnings,
  quickFixes,
  missingKeywords,
  actionChecklist,
  resumeVersions,
  type AtsRecommendation,
  type AtsChecklistItem,
} from "@/lib/ats-data";

// NOTE: Recommendations, quick fixes, missing keywords, and versions remain mock until
// backend exposes ATS recommendation/version endpoints.

function PaneSection({
  icon: Icon,
  title,
  action,
  children,
  tone = "primary",
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  tone?: "primary" | "destructive" | "warning" | "success";
}) {
  const toneClass = {
    primary: "text-primary",
    destructive: "text-destructive",
    warning: "text-warning",
    success: "text-success",
  }[tone];
  return (
    <section className="animate-fade-in">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${toneClass}`} />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function RecommendationCard({
  rec,
  toneRing,
}: {
  rec: AtsRecommendation;
  toneRing: string;
}) {
  return (
    <button className="group w-full rounded-xl border border-border/60 bg-surface-elevated/50 p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface-elevated">
      <div className="flex items-start gap-2">
        <span className={`mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${toneRing}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-[13px] font-medium">{rec.title}</div>
            <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
              {rec.impact}
            </span>
          </div>
          <div className="mt-1 line-clamp-2 text-[11.5px] text-muted-foreground">{rec.detail}</div>
          <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>{rec.section}</span>
            <span>·</span>
            <span>{rec.effort}</span>
            <span className="ml-auto flex items-center gap-1 text-primary opacity-0 transition group-hover:opacity-100">
              Fix <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function RightPane() {
  const [checklist, setChecklist] = useState<AtsChecklistItem[]>(actionChecklist);
  const [compareId, setCompareId] = useState<string | null>(null);

  const done = checklist.filter((c) => c.done).length;
  const total = checklist.length;
  const pct = Math.round((done / total) * 100);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        <PaneSection
          icon={Sparkles}
          title="AI Recommendations"
          action={
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {criticalIssues.length + warnings.length}
            </Badge>
          }
        >
          <Card className="glass rounded-2xl border-border/60 p-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Potential lift</span>
              <span className="font-mono text-success">+13 ATS</span>
            </div>
            <Button
              size="sm"
              className="mt-3 h-9 w-full rounded-lg bg-linear-to-r from-primary to-accent text-xs font-medium text-primary-foreground shadow-elevation-2 transition hover:shadow-glow"
            >
              <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Apply all safe fixes
            </Button>
          </Card>
        </PaneSection>

        <PaneSection icon={AlertOctagon} title="Critical Issues" tone="destructive">
          <div className="space-y-2">
            {criticalIssues.map((r) => (
              <RecommendationCard key={r.id} rec={r} toneRing="bg-destructive" />
            ))}
          </div>
        </PaneSection>

        <PaneSection icon={AlertTriangle} title="Warnings" tone="warning">
          <div className="space-y-2">
            {warnings.map((r) => (
              <RecommendationCard key={r.id} rec={r} toneRing="bg-warning" />
            ))}
          </div>
        </PaneSection>

        <PaneSection icon={Zap} title="Quick Fixes · One-click">
          <Card className="glass rounded-2xl border-border/60 p-2">
            <ul className="divide-y divide-border/60">
              {quickFixes.map((q) => (
                <li
                  key={q.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-surface-elevated/60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium">{q.title}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{q.detail}</div>
                  </div>
                  <span className="shrink-0 rounded-md bg-success/15 px-1.5 py-0.5 font-mono text-[10px] text-success">
                    {q.impact}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 shrink-0 rounded-md px-2 text-[11px]"
                  >
                    Apply
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </PaneSection>

        <PaneSection icon={Plus} title="Missing Keywords" tone="destructive">
          <Card className="glass rounded-2xl border-border/60 p-3">
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((k) => (
                <button
                  key={k}
                  className="group inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] text-foreground/90 transition hover:border-destructive/60"
                >
                  <Plus className="h-3 w-3 text-destructive" />
                  {k}
                </button>
              ))}
            </div>
            <Separator className="my-3" />
            <Button variant="outline" size="sm" className="h-8 w-full rounded-lg text-xs">
              Insert all into resume
            </Button>
          </Card>
        </PaneSection>

        <PaneSection
          icon={ListChecks}
          title="Action Checklist"
          action={
            <span className="font-mono text-[10px] text-muted-foreground">
              {done}/{total} · {pct}%
            </span>
          }
        >
          <Card className="glass rounded-2xl border-border/60 p-3">
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-border/70">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <ul className="space-y-1.5">
              {checklist.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition hover:bg-surface-elevated/60">
                    <Checkbox
                      checked={c.done}
                      onCheckedChange={(v) =>
                        setChecklist((prev) =>
                          prev.map((p) => (p.id === c.id ? { ...p, done: Boolean(v) } : p)),
                        )
                      }
                    />
                    <span
                      className={`min-w-0 flex-1 truncate text-[12px] ${
                        c.done ? "text-muted-foreground line-through" : "text-foreground/95"
                      }`}
                    >
                      {c.title}
                    </span>
                    <span className="shrink-0 rounded-md bg-background/50 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                      {c.group}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </Card>
        </PaneSection>

        <PaneSection
          icon={GitBranch}
          title="Resume Versions"
          action={
            <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[10px]">
              <ArrowLeftRight className="h-3 w-3" /> Compare
            </Button>
          }
        >
          <div className="space-y-1.5">
            {resumeVersions.map((v) => {
              const active = v.active;
              const compare = compareId === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setCompareId(compare ? null : v.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-primary/50 bg-primary/10"
                      : compare
                        ? "border-accent/50 bg-accent/10"
                        : "border-border/60 bg-surface-elevated/40 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-medium">{v.name}</span>
                        {active && (
                          <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                            live
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {v.updatedAt}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-sm">{v.score}</div>
                      <div
                        className={`text-[10px] ${
                          v.delta > 0 ? "text-success" : "text-muted-foreground"
                        }`}
                      >
                        {v.delta > 0 ? `+${v.delta}` : "—"}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </PaneSection>
      </div>
    </ScrollArea>
  );
}