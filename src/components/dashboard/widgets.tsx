import { Link } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import {
  Sparkles, Target, Clock, Users, GraduationCap, AlertTriangle,
  FileText, Search, Bot, KanbanSquare, Upload, ArrowUpRight,
  TrendingUp, Trophy, Flame, Calendar, CheckCircle2, CircleDashed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Area, AreaChart, Bar, BarChart, Cell, Line, LineChart,
  PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type {
  PriorityCard, TrendPoint, StatusSlice, ActivityHeat,
  SkillGap, CareerGoal, Recommendation, TimelineEvent,
  UpcomingItem, Achievement, CareerInsight,
} from "@/lib/dashboard-data";

/* ─────────────────────────────────────── Widget shell */

export function Widget({
  title, subtitle, action, children, className, span,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  span?: string;
}) {
  return (
    <Card className={cn("glass rounded-2xl border-border/60 p-5 sm:p-6", span, className)}>
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold tracking-tight sm:text-[15px]">{title}</h2>
          {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </Card>
  );
}

/* ─────────────────────────────────────── Progress ring */

export function ProgressRing({
  value, size = 96, stroke = 8, label, sublabel, tone = "primary",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  tone?: "primary" | "success" | "warning" | "accent";
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * c;
  const toneClass = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    accent: "text-accent",
  }[tone];
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          className="fill-none stroke-border/60" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${dash} ${c}`}
          className={cn("fill-none transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none", toneClass)}
          stroke="currentColor" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-mono text-xl font-semibold leading-none tracking-tight">{label ?? clamped}</div>
          {sublabel && <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Hero */

export function CommandHero({
  greeting, name, streak, health, resume, weekly, weeklyLabel,
}: {
  greeting: string;
  name: string;
  streak: number;
  health: { overall: number; delta: number };
  resume: number;
  weekly: number;
  weeklyLabel: string;
}) {
  return (
    <Card className="glass-strong relative overflow-hidden rounded-3xl border-border/60 p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-linear-to-br from-primary/25 via-accent/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-linear-to-tr from-success/15 to-transparent blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <Flame className="h-3 w-3 text-warning" /> {streak}-day streak
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
            {greeting}, <span className="text-foreground/90">{name}</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-[15px]">
            Your career health is <span className="font-medium text-foreground">strong</span> and trending up.
            You're <span className="font-medium text-foreground">3 quick fixes</span> away from ATS 91.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button asChild className="rounded-xl shadow-[var(--shadow-glow)]">
              <Link to="/resumes/$id" params={{ id: "senior-pm-2026" }}>
                <Sparkles className="mr-1.5 h-4 w-4" /> Continue resume
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/jobs"><Search className="mr-1.5 h-4 w-4" /> Browse jobs</Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-xl">
              <Link to="/ats"><Target className="mr-1.5 h-4 w-4" /> ATS breakdown</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={health.overall} tone="primary" sublabel="Health" />
            <div className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
              <ArrowUpRight className="h-3 w-3" />+{health.delta}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={resume} tone="accent" sublabel="Resume" />
            <div className="text-xs text-muted-foreground">ATS score</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={weekly} tone="success" sublabel="Week" />
            <div className="truncate text-xs text-muted-foreground">{weeklyLabel}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────── Priorities */

const priorityIcon: Record<PriorityCard["kind"], ComponentType<{ className?: string }>> = {
  resume: Sparkles,
  jobs: Target,
  followup: Users,
  interview: Calendar,
  skills: GraduationCap,
  expiring: AlertTriangle,
};

const accentClass: Record<PriorityCard["accent"], string> = {
  primary: "text-primary bg-primary/10 ring-primary/20",
  success: "text-success bg-success/10 ring-success/20",
  warning: "text-warning bg-warning/10 ring-warning/25",
  destructive: "text-destructive bg-destructive/10 ring-destructive/20",
  accent: "text-accent bg-accent/10 ring-accent/25",
};

export function PriorityTile({ p }: { p: PriorityCard }) {
  const Icon = priorityIcon[p.kind];
  return (
    <a
      href={p.href}
      className="group glass relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 p-4 transition hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--shadow-glow)] motion-reduce:transition-none motion-reduce:hover:transform-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1", accentClass[p.accent])}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {p.count !== undefined && (
          <Badge variant="secondary" className="rounded-full font-mono text-[11px]">{p.count}</Badge>
        )}
      </div>
      <div className="mt-3 min-w-0 grow">
        <h3 className="text-sm font-semibold leading-snug">{p.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.detail}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{p.meta}</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/90">
          {p.cta} <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────── Charts */

const chartAxis = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };
const gridStroke = "hsl(var(--border) / 0.5)";

export function TrendAreaChart({ data, color = "hsl(var(--primary))" }: { data: TrendPoint[]; color?: string }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.5} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={chartAxis} />
          <YAxis tickLine={false} axisLine={false} tick={chartAxis} domain={[40, 100]} />
          <Tooltip
            cursor={{ stroke: gridStroke }}
            contentStyle={{
              background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))",
              borderRadius: 12, fontSize: 12,
            }}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#areaFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DualLineChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={chartAxis} />
          <YAxis tickLine={false} axisLine={false} tick={chartAxis} domain={[50, 100]} />
          <Tooltip
            cursor={{ stroke: gridStroke }}
            contentStyle={{
              background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))",
              borderRadius: 12, fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="secondary" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, centerLabel }: { data: StatusSlice[]; centerLabel: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <div className="relative h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={44} outerRadius={68} paddingAngle={2} dataKey="value" stroke="none">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))",
                borderRadius: 12, fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="font-mono text-xl font-semibold">{total}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{centerLabel}</div>
          </div>
        </div>
      </div>
      <ul className="space-y-1.5 text-xs">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-mono text-foreground/90">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DistributionBars({ data }: { data: StatusSlice[] }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={chartAxis} />
          <YAxis tickLine={false} axisLine={false} tick={chartAxis} />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
            contentStyle={{
              background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))",
              borderRadius: 12, fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─────────────────────────────────────── Heatmap */

export function ActivityHeatmap({ data }: { data: ActivityHeat[] }) {
  const buckets = data[0]?.values.length ?? 7;
  return (
    <div className="grid gap-1.5">
      {data.map((row) => (
        <div key={row.day} className="grid grid-cols-[32px_1fr] items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{row.day}</span>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${buckets}, minmax(0, 1fr))` }}>
            {row.values.map((v, i) => (
              <div
                key={i}
                className="aspect-square rounded-[4px] ring-1 ring-inset ring-border/40 transition"
                style={{
                  background: v === 0
                    ? "hsl(var(--muted) / 0.35)"
                    : `hsl(var(--primary) / ${0.2 + v * 0.18})`,
                }}
                title={`${row.day} · ${v} actions`}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {[0.2, 0.4, 0.6, 0.8].map((o) => (
          <span key={o} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: `hsl(var(--primary) / ${o})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Skill gap + goals */

export function SkillGapList({ items }: { items: SkillGap[] }) {
  return (
    <ul className="space-y-4">
      {items.map((s) => (
        <li key={s.skill}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="truncate font-medium">{s.skill}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{s.current}→{s.target} · {s.jobs} jobs</span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-muted/40">
            <div className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-700 motion-reduce:transition-none"
              style={{ width: `${s.current}%` }} />
            <div className="absolute inset-y-0 w-0.5 bg-foreground/60"
              style={{ left: `${s.target}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function GoalList({ items }: { items: CareerGoal[] }) {
  return (
    <ul className="space-y-3.5">
      {items.map((g) => (
        <li key={g.id}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="truncate">{g.label}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{g.progress}% · {g.target}</span>
          </div>
          <Progress value={g.progress} className="h-1.5" />
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────────────── Recommendations */

const recIcon: Record<Recommendation["kind"], ComponentType<{ className?: string }>> = {
  job: Target,
  resume: FileText,
  learning: GraduationCap,
  insight: TrendingUp,
  interview: Calendar,
};

export function RecommendationRow({ r }: { r: Recommendation }) {
  const Icon = recIcon[r.kind];
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-border/60 hover:bg-background/30 motion-reduce:transition-none">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background/50 text-foreground/80 ring-1 ring-border/60">
        <Icon className="h-[16px] w-[16px]" />
      </div>
      <div className="min-w-0 grow">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-medium">{r.title}</h4>
          {r.score !== undefined && (
            <Badge variant="secondary" className="rounded-full font-mono text-[10px]">{r.score}%</Badge>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.detail}</p>
      </div>
      <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">{r.meta}</span>
    </div>
  );
}

/* ─────────────────────────────────────── Timeline */

const timelineDot: Record<TimelineEvent["kind"], string> = {
  resume: "bg-primary",
  ats: "bg-success",
  job: "bg-accent",
  application: "bg-warning",
  interview: "bg-foreground",
};

export function ActivityTimeline({ items }: { items: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-4 pl-5">
      <div className="absolute inset-y-1 left-[7px] w-px bg-border/60" />
      {items.map((e) => (
        <li key={e.id} className="relative">
          <span className={cn("absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background/60", timelineDot[e.kind])} />
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="truncate text-sm font-medium">{e.title}</h4>
            <span className="shrink-0 text-[11px] text-muted-foreground">{e.time}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{e.detail}</p>
        </li>
      ))}
    </ol>
  );
}

/* ─────────────────────────────────────── Upcoming */

const urgencyStyle: Record<UpcomingItem["urgency"], string> = {
  today: "text-destructive bg-destructive/10 ring-destructive/20",
  soon: "text-warning bg-warning/10 ring-warning/25",
  later: "text-muted-foreground bg-muted/40 ring-border/60",
};

export function UpcomingList({ items }: { items: UpcomingItem[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((u) => (
        <li key={u.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/30 p-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background/60 ring-1 ring-border/60">
            <Calendar className="h-4 w-4 text-foreground/80" />
          </div>
          <div className="min-w-0 grow">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-medium">{u.title}</h4>
              <span className={cn("ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1", urgencyStyle[u.urgency])}>
                {u.when}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{u.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────────────── Quick actions */

const qaIcon: Record<string, ComponentType<{ className?: string }>> = {
  upload: Upload, search: Search, sparkles: Sparkles, file: FileText,
  bot: Bot, kanban: KanbanSquare,
};

export function QuickActionsGrid({
  items,
}: {
  items: ReadonlyArray<{ id: string; label: string; icon: string; href: string }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((a) => {
        const Icon = qaIcon[a.icon] ?? Sparkles;
        return (
          <a
            key={a.id}
            href={a.href}
            className="group flex flex-col items-start gap-2 rounded-xl border border-border/60 bg-background/40 p-3 transition hover:-translate-y-0.5 hover:border-border hover:bg-background/60 motion-reduce:transition-none motion-reduce:hover:transform-none"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition group-hover:bg-primary/15">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-medium leading-tight">{a.label}</span>
          </a>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────── Achievements */

const tierRing: Record<Achievement["tier"], string> = {
  bronze: "from-amber-700/40 to-amber-500/10 text-amber-500",
  silver: "from-slate-400/40 to-slate-300/10 text-slate-300",
  gold: "from-yellow-500/40 to-yellow-300/10 text-yellow-400",
  platinum: "from-primary/40 to-accent/10 text-primary",
};

export function AchievementCard({ a }: { a: Achievement }) {
  return (
    <div className={cn(
      "relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 p-4 transition",
      a.earned ? "bg-background/40" : "bg-background/20 opacity-90"
    )}>
      <div className={cn("absolute -right-8 -top-8 h-24 w-24 rounded-full bg-linear-to-br blur-2xl", tierRing[a.tier])} />
      <div className="relative flex items-start justify-between">
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl bg-background/60 ring-1 ring-border/60", tierRing[a.tier].split(" ").pop())}>
          <Trophy className="h-[18px] w-[18px]" />
        </div>
        {a.earned ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : (
          <CircleDashed className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="relative mt-3 min-w-0">
        <h4 className="text-sm font-semibold">{a.title}</h4>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.detail}</p>
      </div>
      <div className="relative mt-3">
        {a.earned ? (
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Earned · {a.earnedAt}</span>
        ) : (
          <>
            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>In progress</span>
              <span className="font-mono">{a.progress}%</span>
            </div>
            <Progress value={a.progress ?? 0} className="h-1" />
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Insight ribbon */

const insightStyle: Record<CareerInsight["kind"], string> = {
  trend: "from-primary/15 to-transparent text-primary",
  opportunity: "from-success/15 to-transparent text-success",
  gap: "from-warning/15 to-transparent text-warning",
};

export function InsightPill({ i }: { i: CareerInsight }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border/60 bg-linear-to-r p-4", insightStyle[i.kind])}>
      <div className="flex items-start gap-3">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
            {i.kind === "trend" ? "Trend" : i.kind === "opportunity" ? "Opportunity" : "Gap"}
          </div>
          <p className="mt-0.5 text-sm text-foreground/90">{i.text}</p>
        </div>
      </div>
    </div>
  );
}
