import type { ComponentType, ReactNode } from "react";
import {
  Building2, Star, ArrowUpRight, CalendarClock, MessageSquare,
  FileText, CheckCircle2, Circle, AlertCircle, Sparkles,
  Briefcase, Users, ClipboardList, TrendingUp, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import type {
  ApplicationUI, FollowUpUI, StatsUI,
} from "@/lib/applications";
import { APPLICATION_STAGES } from "@/types/application";
import type { ApplicationStage } from "@/types/application";

export const stageMeta = Object.fromEntries(APPLICATION_STAGES.map((s) => [s.id, s])) as Record<ApplicationStage, (typeof APPLICATION_STAGES)[number]>;

/* ─────────────────────────────────────── Company logo */

export function CompanyLogo({ label, size = 40 }: { label: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-xl bg-linear-to-br from-background/70 to-background/40 font-mono text-sm font-semibold text-foreground/90 ring-1 ring-border/60"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {label}
    </div>
  );
}

/* ─────────────────────────────────────── Stage pill */

export function StagePill({ stage }: { stage: ApplicationStage }) {
  const meta = stageMeta[stage];
  if (!meta) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1", meta.tone)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

const urgencyStyle = {
  today: "text-destructive bg-destructive/10 ring-destructive/20",
  soon: "text-warning bg-warning/10 ring-warning/25",
  later: "text-muted-foreground bg-muted/40 ring-border/60",
} as const;

export function UrgencyChip({ urgency, label }: { urgency: keyof typeof urgencyStyle; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1", urgencyStyle[urgency])}>
      <CalendarClock className="h-3 w-3" /> {label}
    </span>
  );
}

/* ─────────────────────────────────────── Application card */

export function ApplicationCard({
  app, active, onSelect, compact,
}: {
  app: ApplicationUI; active?: boolean; onSelect?: (id: string) => void; compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(app.id)}
      className={cn(
        "group glass relative flex w-full flex-col gap-3 rounded-2xl border border-border/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-border motion-reduce:transition-none motion-reduce:hover:transform-none",
        active && "ring-2 ring-primary/40 border-primary/40 shadow-[var(--shadow-glow)]",
        compact && "p-3"
      )}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo label={app.logo} size={compact ? 34 : 40} />
        <div className="min-w-0 grow">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold">{app.company}</h3>
            {app.favorite && <Star className="h-3 w-3 fill-warning text-warning" />}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{app.role}</p>
        </div>
        {app.match > 0 && (
          <span className="shrink-0 font-mono text-[11px] font-semibold text-success">{app.match}%</span>
        )}
      </div>

      {!compact && (
        <div className="text-[11px] text-muted-foreground">
          {app.location && <span className="truncate">{app.location}</span>}
          {app.location && app.salary && <span className="mx-1.5">·</span>}
          {app.salary && <span>{app.salary}</span>}
        </div>
      )}

      <div className="relative h-1 overflow-hidden rounded-full bg-muted/40">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary via-accent to-success transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${app.progress}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <StagePill stage={app.stage} />
        {app.nextAction && (
          <UrgencyChip urgency={app.nextAction.urgency} label={app.nextAction.when} />
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">{app.updatedAt}</span>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────── Kanban column */

export function KanbanColumn({
  stage, apps, activeId, onSelect,
}: {
  stage: ApplicationStage; apps: ApplicationUI[]; activeId?: string; onSelect?: (id: string) => void;
}) {
  const meta = stageMeta[stage];
  return (
    <div className="flex min-w-[260px] flex-1 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {meta && <StagePill stage={stage} />}
          <span className="font-mono text-[11px] text-muted-foreground">{apps.length}</span>
        </div>
        <button className="rounded-md p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-background/50 hover:text-foreground" aria-label={`Add to ${meta?.label ?? stage}`}>+</button>
      </div>
      <div className="flex flex-col gap-3">
        {apps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-background/20 p-6 text-center text-xs text-muted-foreground">
            Empty
          </div>
        ) : (
          apps.map((a) => (
            <ApplicationCard key={a.id} app={a} active={a.id === activeId} onSelect={onSelect} compact />
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Timeline (weekly) */

export function AppTimeline({ items }: { items: ApplicationUI["history"] }) {
  return (
    <ol className="relative space-y-4 pl-5">
      <div className="absolute inset-y-1 left-[7px] w-px bg-border/60" />
      {items.map((e) => (
        <li key={e.id} className="relative">
          <span className={cn("absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background/60", "bg-muted-foreground")} />
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="truncate text-sm font-medium">{e.title}</h4>
            <span className="shrink-0 text-[11px] text-muted-foreground">{e.time}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>
        </li>
      ))}
    </ol>
  );
}

/* ─────────────────────────────────────── Interview rounds */

const roundStatus = {
  scheduled: { icon: CalendarClock, cls: "text-warning" },
  done: { icon: CheckCircle2, cls: "text-success" },
  upcoming: { icon: Circle, cls: "text-muted-foreground" },
  canceled: { icon: AlertCircle, cls: "text-destructive" },
} as const;

export function InterviewRounds({ rounds }: { rounds: ApplicationUI["interviews"] }) {
  if (rounds.length === 0) return <p className="text-xs text-muted-foreground">No interview rounds yet.</p>;
  return (
    <ul className="space-y-2">
      {rounds.map((r) => {
        const S = roundStatus[r.status as keyof typeof roundStatus] ?? roundStatus.upcoming;
        return (
          <li key={r.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/30 p-3">
            <S.icon className={cn("mt-0.5 h-4 w-4 shrink-0", S.cls)} />
            <div className="min-w-0 grow">
              <div className="flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-medium">{r.name}</h4>
                <span className="shrink-0 text-[11px] text-muted-foreground">{r.when}</span>
              </div>
              {r.interviewer && <p className="mt-0.5 text-xs text-muted-foreground">with {r.interviewer}</p>}
              {r.notes && <p className="mt-1 text-xs text-foreground/80">{r.notes}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ─────────────────────────────────────── Assessment list */

export function AssessmentList({ items }: { items: ApplicationUI["assessments"] }) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">No assessments.</p>;
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/30 p-3">
          <ClipboardList className="h-4 w-4 shrink-0 text-accent" />
          <div className="min-w-0 grow">
            <h4 className="truncate text-sm font-medium">{a.label}</h4>
            <p className="text-xs text-muted-foreground">Due {a.due}</p>
          </div>
          <Badge variant="secondary" className="rounded-full capitalize">{a.status}</Badge>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────────────── Follow-up row */

const followUpIcon: Record<string, ComponentType<{ className?: string }>> = {
  email: MessageSquare, call: Users, message: MessageSquare, task: ClipboardList,
};

export function FollowUpRow({ f }: { f: FollowUpUI }) {
  const Icon = followUpIcon[f.kind] ?? MessageSquare;
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-xl border border-border/50 bg-background/30 p-3",
      f.status === "completed" && "opacity-60"
    )}>
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-background/60 ring-1 ring-border/60">
        <Icon className="h-4 w-4 text-foreground/80" />
      </div>
      <div className="min-w-0 grow">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-medium">{f.company}</h4>
          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{f.due}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{f.note}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Career progress ring */

export function StatRing({
  value, label, tone = "primary",
}: { value: number; label: string; tone?: "primary" | "success" | "warning" | "accent" }) {
  const size = 72, stroke = 6, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * c;
  const toneClass = {
    primary: "text-primary", success: "text-success",
    warning: "text-warning", accent: "text-accent",
  }[tone];
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} className="fill-none stroke-border/60" />
          <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`} stroke="currentColor"
            className={cn("fill-none transition-[stroke-dasharray] duration-700 motion-reduce:transition-none", toneClass)} />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-mono text-sm font-semibold">{value}</span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────── Company card (right rail research) */

export function CompanyCard({ app }: { app: ApplicationUI }) {
  return (
    <Card className="glass rounded-2xl border-border/60 p-4">
      <div className="flex items-start gap-3">
        <CompanyLogo label={app.logo} />
        <div className="min-w-0 grow">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold">{app.company}</h3>
            <Building2 className="h-3 w-3 text-muted-foreground" />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{app.location || "Location not specified"}</p>
        </div>
        {app.glassdoor && (
          <span className="shrink-0 rounded-full bg-background/60 px-2 py-0.5 font-mono text-[11px] ring-1 ring-border/60">
            ★ {app.glassdoor.toFixed(1)}
          </span>
        )}
      </div>
      {app.culture && <p className="mt-3 text-xs text-foreground/80">{app.culture}</p>}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Salary</span>
        <span className="font-medium text-foreground/90">{app.salary || "Not specified"}</span>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────── AI tip card */

const aiKindIcon: Record<string, ComponentType<{ className?: string }>> = {
  prep: Sparkles, resume: FileText, research: Building2,
  negotiation: TrendingUp, followup: MessageSquare,
};

export function AiTipCard({ tip }: { tip: { id: string; kind: string; title: string; detail: string } }) {
  const Icon = aiKindIcon[tip.kind] ?? Bot;
  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border/50 bg-background/30 p-3 transition hover:border-border hover:bg-background/50">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-medium">{tip.title}</h4>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{tip.detail}</p>
      </div>
      <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </div>
  );
}

/* ─────────────────────────────────────── Section frame */

export function SectionCard({
  title, subtitle, action, children, icon: Icon,
}: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="glass rounded-2xl border-border/60 p-5">
      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </Card>
  );
}

/* ─────────────────────────────────────── Career stats strip */

export function StatsStrip({ applications, interviewRate, offerRate, acceptanceRate, streakDays }: StatsUI) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatBlock icon={Briefcase} label="Applications" value={applications} />
      <StatBlock icon={Users} label="Interview rate" value={`${interviewRate}%`} />
      <StatBlock icon={TrendingUp} label="Offer rate" value={`${offerRate}%`} />
      <StatBlock icon={CheckCircle2} label="Acceptance" value={`${acceptanceRate}%`} />
      <StatBlock icon={Sparkles} label="Streak" value={`${streakDays}d`} />
    </div>
  );
}

function StatBlock({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl border border-border/60 p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background/50 ring-1 ring-border/60">
        <Icon className="h-4 w-4 text-foreground/80" />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-none tracking-tight">{value}</div>
        <div className="mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── Checklist */

export function Checklist({ items }: { items: { id: string; label: string; done: boolean }[] }) {
  return (
    <ul className="space-y-2">
      {items.map((c) => (
        <li key={c.id} className="flex items-start gap-2.5 text-sm">
          {c.done ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          ) : (
            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className={cn(c.done && "text-muted-foreground line-through")}>{c.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────────────── Progress bar row */

export function LabeledProgress({ label, value, right }: { label: string; value: number; right?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="font-mono text-muted-foreground">{right ?? `${value}%`}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}