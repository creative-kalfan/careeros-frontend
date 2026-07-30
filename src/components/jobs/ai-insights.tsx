import {
  Sparkles,
  Gauge,
  Target,
  Check,
  X,
  TrendingUp,
  DollarSign,
  Trophy,
  BookOpen,
  Wand2,
  FileText,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Job, JobMatchResponse } from "@/types/jobs";

function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-in">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
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

function DualRing({ ai, ats }: { ai: number; ats: number }) {
  const size = 128;
  const stroke = 8;
  const r1 = (size - stroke) / 2;
  const r2 = r1 - 14;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ai-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(0.62 0.22 260)" />
            <stop offset="1" stopColor="oklch(0.68 0.20 305)" />
          </linearGradient>
          <linearGradient id="ats-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="oklch(0.68 0.20 305)" />
            <stop offset="1" stopColor="oklch(0.72 0.18 152)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r1} strokeWidth={stroke} className="fill-none stroke-border/60" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r1}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c1}
          strokeDashoffset={c1 - (ai / 100) * c1}
          className="fill-none stroke-[url(#ai-grad)] transition-[stroke-dashoffset] duration-700"
        />
        <circle cx={size / 2} cy={size / 2} r={r2} strokeWidth={stroke} className="fill-none stroke-border/60" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r2}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c2}
          strokeDashoffset={c2 - (ats / 100) * c2}
          className="fill-none stroke-[url(#ats-grad)] transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="text-[22px] font-semibold tracking-tight">{ai}%</div>
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            AI · ATS {ats}%
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <Progress value={value} className="h-1" />
    </div>
  );
}

function PillMark({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[9.5px] uppercase tracking-wider ${
        ok
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
    >
      {ok ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

function SalaryScale({
  min,
  median,
  max,
  roleMin,
  roleMax,
}: {
  min: number;
  median: number;
  max: number;
  roleMin: number;
  roleMax: number;
}) {
  const clamp = (v: number) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  const left = clamp(roleMin);
  const right = clamp(roleMax);
  const med = clamp(median);
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-mono">${min}k</span>
        <span>Market range</span>
        <span className="font-mono">${max}k</span>
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-surface-elevated/80">
        <div
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-primary to-accent"
          style={{ left: `${left}%`, right: `${100 - right}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-foreground/70"
          style={{ left: `${med}%` }}
          title={`Median $${median}k`}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">This role</span>
        <span className="font-mono font-semibold">
          ${roleMin}k – ${roleMax}k
        </span>
      </div>
    </div>
  );
}

export function AIInsights({
  job,
  matchResult,
  isMatching,
  onRunMatch,
}: {
  job: Job;
  matchResult?: JobMatchResponse;
  isMatching?: boolean;
  onRunMatch?: () => void;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        <Section
          icon={Sparkles}
          title="Resume Match"
          action={
            onRunMatch ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 rounded-md px-2 text-[10px] text-primary"
                onClick={onRunMatch}
                disabled={isMatching}
              >
                {isMatching ? "Analyzing…" : "Run match"}
              </Button>
            ) : undefined
          }
        >
          {matchResult ? (
            <Card className="glass rounded-2xl border-border/60 p-4">
              <div className="flex items-center gap-4">
                <DualRing ai={matchResult.match.matchScore} ats={matchResult.match.skillMatchScore} />
                <div className="min-w-0 flex-1 space-y-2">
                  <Row label="Skill match" value={matchResult.match.skillMatchScore} />
                  <Row label="Keyword match" value={matchResult.match.keywordMatchScore} />
                  <Row label="Semantic" value={matchResult.match.semanticSimilarityScore} />
                </div>
              </div>
              {matchResult.match.recommendations.length > 0 && (
                <ul className="mt-3 space-y-1 text-[12px] text-foreground/85">
                  {matchResult.match.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ) : (
            <Card className="glass rounded-2xl border-border/60 p-4">
              <div className="flex items-center gap-4">
                <DualRing ai={job.aiMatch} ats={job.atsMatch} />
                <div className="min-w-0 flex-1 space-y-2">
                  <Row label="Skills" value={82} />
                  <Row label="Experience" value={74} />
                  <Row label="Domain" value={68} />
                  <Row label="Seniority" value={90} />
                </div>
              </div>
            </Card>
          )}
        </Section>

        <Section icon={Gauge} title="ATS Compatibility">
          <Card className="glass rounded-2xl border-border/60 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Format & keywords</span>
              <span className="font-mono font-semibold">{job.atsMatch}%</span>
            </div>
            <Progress value={job.atsMatch} className="mt-2 h-1.5" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { l: "Format", v: 92 },
                { l: "Density", v: 78 },
                { l: "Parser", v: 88 },
              ].map((c) => (
                <div key={c.l} className="rounded-lg border border-border/60 bg-background/40 p-2 text-center">
                  <div className="font-mono text-sm">{c.v}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{c.l}</div>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section icon={Target} title="Skills">
          <Card className="glass rounded-2xl border-border/60 p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-success">
              <Check className="h-3 w-3" /> Matched
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.matchedSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-1 text-[11px] text-foreground/90"
                >
                  <Check className="h-3 w-3 text-success" />
                  {s}
                </span>
              ))}
            </div>
            {job.missingSkills.length > 0 && (
              <>
                <div className="mb-1.5 mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-destructive">
                  <X className="h-3 w-3" /> Missing
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] text-foreground/90"
                    >
                      <X className="h-3 w-3 text-destructive" />
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Section>

        <Section icon={FileText} title="Keyword Comparison">
          <Card className="glass rounded-2xl border-border/60 p-3.5">
            <div className="space-y-1.5">
              {job.keywordCompare.map((k) => (
                <div
                  key={k.keyword}
                  className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-lg border border-border/40 bg-background/30 px-2.5 py-1.5"
                >
                  <span className="truncate text-xs">{k.keyword}</span>
                  <PillMark ok={k.inResume} label="Resume" />
                  <PillMark ok={k.inJob} label="Job" />
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <div className="grid grid-cols-2 gap-2">
          <Section icon={TrendingUp} title="Career Fit">
            <Card className="glass rounded-2xl border-border/60 p-3">
              <div className="text-lg font-semibold">Strong</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Aligned with your last 3 roles
              </div>
            </Card>
          </Section>
          <Section icon={Trophy} title="Seniority">
            <Card className="glass rounded-2xl border-border/60 p-3">
              <div className="text-lg font-semibold">{job.seniority}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">Matches your level</div>
            </Card>
          </Section>
        </div>

        <Section icon={DollarSign} title="Salary Comparison">
          <Card className="glass rounded-2xl border-border/60 p-3.5">
            <SalaryScale
              min={job.marketSalary.min}
              median={job.marketSalary.median}
              max={job.marketSalary.max}
              roleMin={job.salaryMin}
              roleMax={job.salaryMax}
            />
          </Card>
        </Section>

        <Section icon={Trophy} title="Interview Probability">
          <Card className="glass rounded-2xl border-border/60 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Estimated
                </div>
                <div className="mt-0.5 text-3xl font-semibold tracking-tight">
                  {job.interviewProbability}%
                </div>
              </div>
              <Badge
                variant="secondary"
                className="rounded-full border-success/30 bg-success/10 text-[10px] text-success"
              >
                +12 vs avg
              </Badge>
            </div>
            <Progress value={job.interviewProbability} className="mt-3 h-1.5" />
          </Card>
        </Section>

        <div className="space-y-2">
          <Button className="h-10 w-full rounded-xl shadow-[var(--shadow-glow)]">
            <Wand2 className="mr-2 h-4 w-4" />
            Optimize Resume
          </Button>
          <Button variant="outline" className="h-10 w-full rounded-xl">
            <FileText className="mr-2 h-4 w-4" />
            Generate Cover Letter
          </Button>
        </div>

        <Section icon={BookOpen} title="Interview Readiness">
          <Card className="glass relative overflow-hidden rounded-2xl border-border/60 p-4">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.10] via-transparent to-accent/[0.10]" />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Coming soon
              </div>
              <div className="mt-1 text-sm font-semibold">
                Practice tailored to {job.company}
              </div>
              <div className="mt-1 text-[11.5px] text-muted-foreground">
                Behavioral, system design and role-specific drills generated from the JD.
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-8 rounded-lg text-xs"
                disabled
              >
                Join waitlist
              </Button>
            </div>
          </Card>
        </Section>
      </div>
    </ScrollArea>
  );
}