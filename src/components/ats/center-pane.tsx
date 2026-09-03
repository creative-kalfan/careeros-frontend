import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import {
  Sparkles,
  Layers,
  Grid3x3,
  Gauge,
  Activity,
  Clock,
  BarChart3,
  Wand2,
  ShieldCheck,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  sectionScores,
  keywordHeatmap,
  radarAxes,
  scoreTimeline,
  optimizationTimeline,
  detectedSkills,
  missingSkills,
  qualityScores,
  compatibilityMatrix,
} from "@/lib/ats-data";

// NOTE: Backend endpoints missing for detailed section scores, radar, timeline, quality, compatibility.
// These remain mock until backend exposes ATS report breakdown endpoints.

function Section({
  id,
  icon: Icon,
  title,
  subtitle,
  right,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 animate-fade-in">
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {title}
          </div>
          {subtitle && (
            <div className="mt-1 truncate text-[13px] text-muted-foreground/90">{subtitle}</div>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function chartTooltipStyle() {
  return {
    background: "color-mix(in oklab, var(--surface-elevated) 90%, transparent)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 11,
    padding: "8px 10px",
    color: "var(--foreground)",
    boxShadow: "var(--shadow-elevation-2)",
  };
}

function SectionScoresCard() {
  return (
    <Card className="glass rounded-2xl border-border/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {sectionScores.map((s) => (
          <TooltipProvider key={s.id} delayDuration={150}>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="group cursor-help rounded-xl border border-border/60 bg-background/40 p-3 transition hover:-translate-y-0.5 hover:border-primary/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[13px] font-medium">{s.label}</div>
                    <span
                      className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] ${
                        s.status === "strong"
                          ? "bg-success/15 text-success"
                          : s.status === "ok"
                            ? "bg-warning/15 text-warning"
                            : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {s.score}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={s.score} className="h-1.5" />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Weight {s.weight}%</span>
                    <span className="capitalize">{s.status}</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                {s.hint}
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        ))}
      </div>
    </Card>
  );
}

function KeywordHeatmap() {
  return (
    <Card className="glass rounded-2xl border-border/60 p-4">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {keywordHeatmap.map((k) => {
          const intensity = k.present ? Math.max(0.2, k.frequency / 6) : 0;
          return (
            <TooltipProvider key={k.keyword} delayDuration={150}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`group cursor-help rounded-lg border p-2 text-[11px] transition ${
                      k.present ? "border-primary/30" : "border-dashed border-destructive/40"
                    }`}
                    style={{
                      background: k.present
                        ? `color-mix(in oklab, oklch(0.62 0.22 260) ${intensity * 60}%, transparent)`
                        : "color-mix(in oklab, var(--destructive) 8%, transparent)",
                    }}
                  >
                    <div className="truncate font-medium text-foreground/95">{k.keyword}</div>
                    <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                      <span>{k.present ? `×${k.frequency}` : "missing"}</span>
                      <span>imp {k.importance}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {k.present
                    ? `Used ${k.frequency}× · importance ${k.importance}/10`
                    : `Missing · importance ${k.importance}/10`}
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded bg-linear-to-r from-primary/20 to-primary" /> Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-6 rounded border border-dashed border-destructive/50" /> Missing
        </span>
      </div>
    </Card>
  );
}

function RadarBlock() {
  return (
    <Card className="glass rounded-2xl border-border/60 p-4">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarAxes} outerRadius="72%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
              stroke="transparent"
            />
            <Radar
              name="Target"
              dataKey="target"
              stroke="oklch(0.68 0.20 305 / 0.6)"
              fill="oklch(0.68 0.20 305)"
              fillOpacity={0.08}
              strokeDasharray="4 4"
            />
            <Radar
              name="You"
              dataKey="score"
              stroke="oklch(0.62 0.22 260)"
              fill="oklch(0.62 0.22 260)"
              fillOpacity={0.25}
            />
            <Tooltip contentStyle={chartTooltipStyle()} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ScoreTrend() {
  return (
    <Card className="glass rounded-2xl border-border/60 p-4">
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={scoreTimeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="score-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.62 0.22 260)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.62 0.22 260)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: 11 }}
            />
            <YAxis
              domain={[40, 100]}
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: 11 }}
            />
            <Tooltip contentStyle={chartTooltipStyle()} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="oklch(0.62 0.22 260)"
              strokeWidth={2}
              fill="url(#score-fill)"
            />
            <Line
              type="monotone"
              dataKey="keywords"
              stroke="oklch(0.68 0.20 305)"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center gap-4 text-[10.5px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" /> Overall
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> Keywords
        </span>
      </div>
    </Card>
  );
}

function OptimizationTimelineBlock() {
  const kindColor: Record<string, string> = {
    keyword: "bg-primary",
    format: "bg-info",
    clarity: "bg-accent",
    impact: "bg-success",
  };
  return (
    <Card className="glass rounded-2xl border-border/60 p-4">
      <ol className="relative space-y-4 pl-6">
        <span className="absolute inset-y-1 left-2 w-px bg-border" aria-hidden />
        {optimizationTimeline.map((e) => (
          <li key={e.id} className="relative">
            <span
              className={`absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${kindColor[e.kind]}`}
            />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium">{e.title}</span>
                  <Badge variant="secondary" className="rounded-full text-[9px] capitalize">
                    {e.kind}
                  </Badge>
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">{e.detail}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                  {e.time}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] ${
                  e.delta >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                }`}
              >
                {e.delta > 0 ? "+" : ""}
                {e.delta}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function KeywordFrequencyBlock() {
  const data = keywordHeatmap
    .filter((k) => k.present)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8)
    .map((k) => ({ name: k.keyword, count: k.frequency, importance: k.importance }));
  return (
    <Card className="glass rounded-2xl border-border/60 p-4">
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12 }}>
            <CartesianGrid stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={130}
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              style={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={chartTooltipStyle()}
              cursor={{ fill: "var(--muted)", opacity: 0.15 }}
            />
            <Bar dataKey="count" fill="oklch(0.62 0.22 260)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function SkillsBlock() {
  const categories: Array<{ id: "core" | "adjacent" | "tooling" | "leadership"; label: string }> = [
    { id: "core", label: "Core" },
    { id: "adjacent", label: "Adjacent" },
    { id: "tooling", label: "Tooling" },
    { id: "leadership", label: "Leadership" },
  ];
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card className="glass rounded-2xl border-border/60 p-4">
        <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>Detected skills</span>
          <span className="font-mono">{detectedSkills.length}</span>
        </div>
        <div className="space-y-3">
          {categories.map((c) => {
            const items = detectedSkills.filter((s) => s.category === c.id);
            if (!items.length) return null;
            return (
              <div key={c.id}>
                <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
                  {c.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-1 text-[11px] text-foreground/90"
                    >
                      {s.name}
                      <span className="font-mono text-[9px] text-success">{s.confidence}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card className="glass rounded-2xl border-border/60 p-4">
        <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>Missing skills</span>
          <span className="font-mono text-destructive">{missingSkills.length}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {missingSkills.map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] text-foreground/90"
            >
              + {s.name}
              <span className="rounded bg-background/40 px-1 font-mono text-[9px] text-muted-foreground capitalize">
                {s.category}
              </span>
            </span>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-border/70 bg-background/30 p-3 text-[11.5px] text-muted-foreground">
          Add these to unlock <span className="text-foreground">+11 ATS</span> across 6 target
          roles.
        </div>
      </Card>
    </div>
  );
}

function QualityScoresBlock() {
  const items: Array<{
    id: keyof typeof qualityScores;
    label: string;
    icon: React.ElementType;
    hint: string;
  }> = [
    { id: "grammar", label: "Grammar", icon: Wand2, hint: "0 style issues in the last edit." },
    {
      id: "formatting",
      label: "Formatting",
      icon: Layers,
      hint: "ATS-safe, single-column, no tables.",
    },
    {
      id: "readability",
      label: "Readability",
      icon: Activity,
      hint: "Grade 9. Recruiters skim in 6s.",
    },
    {
      id: "recruiter",
      label: "Recruiter",
      icon: ShieldCheck,
      hint: "Matches 84% of recruiter checklists.",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((i) => {
        const v = qualityScores[i.id];
        return (
          <Card key={i.id} className="glass rounded-2xl border-border/60 p-4">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <i.icon className="h-3.5 w-3.5 text-primary" />
                {i.label}
              </span>
            </div>
            <div className="mt-2 font-mono text-2xl font-semibold tracking-tight">{v}</div>
            <Progress value={v} className="mt-2 h-1" />
            <div className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">{i.hint}</div>
          </Card>
        );
      })}
    </div>
  );
}

function CompatibilityBlock() {
  return (
    <Card className="glass rounded-2xl border-border/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Recruiter & industry compatibility
        </div>
        <Badge variant="secondary" className="rounded-full text-[10px]">
          {qualityScores.industry} industry
        </Badge>
      </div>
      <div className="space-y-2.5">
        {compatibilityMatrix.map((c) => (
          <div key={c.name}>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {c.name}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">{c.score}</span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-border/70">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ${
                  c.score >= 85
                    ? "bg-linear-to-r from-success to-primary"
                    : c.score >= 75
                      ? "bg-linear-to-r from-primary to-accent"
                      : "bg-linear-to-r from-warning to-destructive"
                }`}
                style={{ width: `${c.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function CenterPane({ activeSection }: { activeSection: string }) {
  const [expanded, setExpanded] = useState<string[]>(["quality", "compatibility"]);
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-6">
      <Section
        id="analytics"
        icon={Sparkles}
        title="ATS Analytics"
        subtitle="Live diagnostics across keywords, semantics, structure and recruiter fit."
        right={
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Rescored 12s ago
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "Overall", value: 84, tone: "primary" },
            { label: "Keyword", value: 82, tone: "accent" },
            { label: "Semantic", value: 74, tone: "info" },
          ].map((s) => (
            <Card key={s.label} className="glass rounded-2xl border-border/60 p-4">
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {s.label} score
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-semibold tracking-tight">{s.value}</span>
                <span className="text-[11px] text-muted-foreground">/100</span>
              </div>
              <Progress value={s.value} className="mt-3 h-1" />
            </Card>
          ))}
        </div>
      </Section>

      <Section id="sections" icon={Layers} title="Section Scores">
        <SectionScoresCard />
      </Section>

      <Section id="heatmap" icon={Grid3x3} title="Keyword Heatmap">
        <KeywordHeatmap />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section id="radar" icon={Gauge} title="Radar Chart">
          <RadarBlock />
        </Section>
        <Section id="timeline" icon={Activity} title="Score Trend">
          <ScoreTrend />
        </Section>
      </div>

      <Section id="optimization" icon={Clock} title="Optimization Timeline">
        <OptimizationTimelineBlock />
      </Section>

      <Section id="frequency" icon={BarChart3} title="Keyword Frequency">
        <KeywordFrequencyBlock />
      </Section>

      <Section id="skills" icon={Sparkles} title="Detected & Missing Skills">
        <SkillsBlock />
      </Section>

      <Section id="quality" icon={ShieldCheck} title="Quality Scores">
        <Accordion
          type="multiple"
          value={expanded}
          onValueChange={setExpanded}
          className="glass overflow-hidden rounded-2xl border border-border/60"
        >
          <AccordionItem value="quality" className="border-b border-border/60">
            <AccordionTrigger className="px-4 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:no-underline">
              Grammar · Formatting · Readability · Recruiter
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <QualityScoresBlock />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="compatibility" className="border-none">
            <AccordionTrigger className="px-4 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:no-underline">
              Recruiter & industry compatibility
            </AccordionTrigger>
            <AccordionContent id="compatibility" className="px-4 pb-4">
              <CompatibilityBlock />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      {/* Active-section hint (visually subtle indicator for wide screens) */}
      <div className="pointer-events-none hidden text-[10px] text-muted-foreground/70 lg:block">
        Viewing: <span className="text-foreground">{activeSection}</span>
        <ChevronRight className="inline h-3 w-3" />
      </div>
    </div>
  );
}
