import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  KanbanSquare, LayoutList, CalendarDays, GanttChartSquare,
  Search, Filter, Star, Bot, Bookmark, Archive, XCircle,
  Trophy, Briefcase, ClipboardList, MessageSquare, Sparkles,
  Building2, PanelLeft, PanelRight, ChevronRight, StickyNote,
  Paperclip, Users, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplications, useApplicationStats } from "@/hooks/api/useApplications";
import { searchApplications, sidebarFilters } from "@/lib/applications";
import type { ApplicationStage } from "@/types/application";
import type { ApplicationUI } from "@/lib/applications";
import {
  ApplicationCard, KanbanColumn, AppTimeline, InterviewRounds,
  AssessmentList, FollowUpRow, CompanyCard, AiTipCard, SectionCard,
  StatsStrip, Checklist, LabeledProgress, CompanyLogo, StagePill,
  UrgencyChip, StatRing,
} from "@/components/mission/parts";
import { MonthCalendar } from "@/components/mission/calendar";

export const Route = createFileRoute("/_app/applications")({
  head: () => ({
    meta: [
      { title: "Mission Control · CareerOS" },
      { name: "description", content: "Timeline, kanban and calendar for every application, interview and offer you run." },
    ],
  }),
  component: MissionControl,
});

type ViewMode = "kanban" | "timeline" | "list" | "calendar";

const filterIcon = {
  all: LayoutList, interviews: Users, assessments: ClipboardList,
  offers: Trophy, rejected: XCircle, archived: Archive,
  saved: Bookmark, bookmarks: Star,
} as const;

function MissionControl() {
  const [filterId, setFilterId] = useState<string>("all");
  const [view, setView] = useState<ViewMode>("kanban");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  // Live backend data
  const { data: applications = [], isLoading, isError, error } = useApplications();
  const { data: stats } = useApplicationStats();

  // Derive the active application from the list
  const active = useMemo(() => {
    if (!activeId && applications.length > 0) {
      return applications[0];
    }
    return applications.find((a) => a.id === activeId) ?? (applications.length > 0 ? applications[0] : null);
  }, [applications, activeId]);

  // Update active ID when data loads
  useEffect(() => {
    if (!activeId && applications.length > 0) {
      setActiveId(applications[0].id);
    }
  }, [applications, activeId]);

  // Get the current sidebar filter definition
  const currentFilter = useMemo(() => {
    return sidebarFilters.find((s) => s.id === filterId) ?? sidebarFilters[0];
  }, [filterId]);

  // Filter application set
  const filtered = useMemo(() => {
    let list = applications;
    if (currentFilter.favorites) list = list.filter((a) => a.favorite);
    else if (currentFilter.stages.length) list = list.filter((a) => currentFilter.stages.includes(a.stage));
    if (query.trim()) {
      list = searchApplications(list, query);
    }
    return list;
  }, [currentFilter, query, applications]);

  const byStage = useMemo(() => {
    const groups: Record<string, ApplicationUI[]> = {};
    filtered.forEach((a) => {
      if (!groups[a.stage]) groups[a.stage] = [];
      groups[a.stage].push(a);
    });
    return groups;
  }, [filtered]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        (document.querySelector('input[data-mc-search]') as HTMLInputElement | null)?.focus();
        return;
      }
      if (e.key === "j" || e.key === "k") {
        const idx = filtered.findIndex((a) => a.id === activeId);
        const next = e.key === "j"
          ? Math.min(filtered.length - 1, idx + 1)
          : Math.max(0, idx - 1);
        if (filtered[next]) setActiveId(filtered[next].id);
      }
      if (e.key === "[") setLeftOpen((v) => !v);
      if (e.key === "]") setRightOpen((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, activeId]);

  const kanbanStages: ApplicationStage[] = ["saved", "applied", "assessment", "interview", "offer", "accepted", "rejected", "archived"];

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          eyebrow="Mission Control"
          title="Your hiring journey, orchestrated"
          description="Every application, interview and offer — with AI keeping you one step ahead."
        />
        <div className="grid gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 flex-1 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-center gap-4 px-4 py-20">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load applications</h2>
        <p className="text-sm text-muted-foreground">{(error as Error)?.message ?? "An unexpected error occurred"}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  // Empty state
  if (applications.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          eyebrow="Mission Control"
          title="Your hiring journey, orchestrated"
          description="Every application, interview and offer — with AI keeping you one step ahead."
        />
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 p-20">
          <Briefcase className="h-16 w-16 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">No applications yet</h2>
          <p className="text-sm text-muted-foreground">Start tracking your job applications by adding your first one.</p>
          <Button className="rounded-xl">Add your first application</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        eyebrow="Mission Control"
        title="Your hiring journey, orchestrated"
        description="Every application, interview and offer — with AI keeping you one step ahead."
        actions={
          <>
            <Button variant="ghost" size="icon" className="hidden rounded-xl lg:inline-flex" aria-label="Toggle filters" onClick={() => setLeftOpen((v) => !v)}>
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden rounded-xl xl:inline-flex" aria-label="Toggle AI assistant" onClick={() => setRightOpen((v) => !v)}>
              <PanelRight className="h-4 w-4" />
            </Button>
            <Button className="rounded-xl shadow-[var(--shadow-glow)]">
              <Sparkles className="mr-1.5 h-4 w-4" /> Add application
            </Button>
          </>
        }
      />

      {stats && (
        <StatsStrip
          applications={stats.applications}
          interviewRate={stats.interviewRate}
          offerRate={stats.offerRate}
          acceptanceRate={stats.acceptanceRate}
          streakDays={stats.streakDays}
        />
      )}

      {/* Toolbar */}
      <div className="glass flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 p-2 sm:p-2.5">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-mc-search
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, role, location…    ⌘M"
            className="h-9 rounded-xl border-border/60 bg-background/40 pl-8 text-sm"
          />
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="kanban" className="gap-1.5 rounded-lg text-xs"><KanbanSquare className="h-3.5 w-3.5" /><span className="hidden sm:inline">Kanban</span></TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5 rounded-lg text-xs"><GanttChartSquare className="h-3.5 w-3.5" /><span className="hidden sm:inline">Timeline</span></TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5 rounded-lg text-xs"><LayoutList className="h-3.5 w-3.5" /><span className="hidden sm:inline">List</span></TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5 rounded-lg text-xs"><CalendarDays className="h-3.5 w-3.5" /><span className="hidden sm:inline">Calendar</span></TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" className="h-9 rounded-xl"><Filter className="mr-1.5 h-3.5 w-3.5" /> Filters</Button>
      </div>

      {/* Three-pane layout */}
      <div className={cn(
        "grid gap-4 transition-[grid-template-columns] duration-300 motion-reduce:transition-none",
        leftOpen && rightOpen && "xl:grid-cols-[220px_minmax(0,1fr)_320px] lg:grid-cols-[220px_minmax(0,1fr)]",
        leftOpen && !rightOpen && "lg:grid-cols-[220px_minmax(0,1fr)]",
        !leftOpen && rightOpen && "xl:grid-cols-[minmax(0,1fr)_320px]",
        !leftOpen && !rightOpen && "grid-cols-1",
      )}>
        {/* LEFT SIDEBAR */}
        {leftOpen && (
          <aside className="glass hidden rounded-2xl border border-border/60 p-3 lg:block">
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Views</div>
            <nav className="flex flex-col gap-0.5">
              {sidebarFilters.map((f) => {
                const Icon = (filterIcon as Record<string, typeof LayoutList>)[f.id] ?? LayoutList;
                const count = f.favorites
                  ? applications.filter((a) => a.favorite).length
                  : f.stages.length
                    ? applications.filter((a) => f.stages.includes(a.stage)).length
                    : applications.filter((a) => !["saved", "archived"].includes(a.stage)).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilterId(f.id)}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition",
                      filterId === f.id
                        ? "bg-background/60 text-foreground ring-1 ring-border/60"
                        : "text-muted-foreground hover:bg-background/30 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 truncate">{f.label}</span>
                    <span className="ml-auto font-mono text-[10px]">{count}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Time</div>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => setView("calendar")} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-background/30 hover:text-foreground">
                <CalendarDays className="h-4 w-4" /> Calendar
              </button>
              <button onClick={() => setView("timeline")} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-background/30 hover:text-foreground">
                <GanttChartSquare className="h-4 w-4" /> Timeline
              </button>
            </div>
          </aside>
        )}

        {/* CENTER */}
        <section className="min-w-0">
          {view === "kanban" && (
            <ScrollArea className="glass rounded-2xl border border-border/60 p-3">
              <div className="flex min-w-max gap-3">
                {kanbanStages.map((s) => (
                  <KanbanColumn key={s} stage={s} apps={byStage[s] ?? []} activeId={active?.id} onSelect={setActiveId} />
                ))}
              </div>
            </ScrollArea>
          )}

          {view === "list" && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => (
                <ApplicationCard key={a.id} app={a} active={a.id === active?.id} onSelect={setActiveId} />
              ))}
            </div>
          )}

          {view === "timeline" && (
            <div className="glass rounded-2xl border border-border/60 p-5">
              <h3 className="mb-4 text-sm font-semibold">Weekly hiring timeline</h3>
              <div className="space-y-6">
                {filtered.map((a) => (
                  <div key={a.id} className="grid grid-cols-[minmax(0,180px)_1fr] gap-4">
                    <button onClick={() => setActiveId(a.id)} className="flex items-start gap-2 text-left">
                      <CompanyLogo label={a.logo} size={32} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{a.company}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{a.role}</div>
                      </div>
                    </button>
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <StagePill stage={a.stage} />
                        {a.nextAction && <UrgencyChip urgency={a.nextAction.urgency} label={`${a.nextAction.label} · ${a.nextAction.when}`} />}
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-muted/40">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-primary via-accent to-success" style={{ width: `${a.progress}%` }} />
                      </div>
                      <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground">
                        <span>Updated {a.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "calendar" && (
            <div className="glass rounded-2xl border border-border/60 p-5">
              <MonthCalendar year={2026} month={6} events={[]} />
            </div>
          )}

          {/* Application detail */}
          {active && (
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <SectionCard title={active.company} subtitle={active.role} icon={Building2}
                action={<StagePill stage={active.stage} />}>
                <div className="flex items-start gap-3">
                  <CompanyLogo label={active.logo} size={44} />
                  <div className="min-w-0 grow text-xs text-muted-foreground">
                    {active.location && <div>{active.location}</div>}
                    {active.salary && <div className="mt-0.5 text-foreground/90">{active.salary}</div>}
                    {active.recruiter && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Users className="h-3 w-3" /> {active.recruiter.name} · {active.recruiter.role}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <LabeledProgress label="Pipeline progress" value={active.progress} />
                </div>
                {active.notes && (
                  <div className="mt-4 rounded-xl border border-border/50 bg-background/30 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      <StickyNote className="h-3 w-3" /> Notes
                    </div>
                    <p className="text-xs text-foreground/85">{active.notes}</p>
                  </div>
                )}
                {active.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {active.attachments.map((f) => (
                      <span key={f.id} className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/40 px-2 py-1 text-[11px]">
                        <Paperclip className="h-3 w-3" /> {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Interview rounds" subtitle="Schedule & notes" icon={Users}>
                <InterviewRounds rounds={active.interviews} />
                {active.assessments.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Assessments</div>
                    <AssessmentList items={active.assessments} />
                  </div>
                )}
              </SectionCard>

              <SectionCard title="History" subtitle="Every touchpoint" icon={ChevronRight}>
                <AppTimeline items={active.history} />
              </SectionCard>
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR */}
        {rightOpen && (
          <aside className="hidden flex-col gap-4 xl:flex">
            <SectionCard title="Company research" icon={Building2}>
              {active && <CompanyCard app={active} />}
            </SectionCard>

            <SectionCard title="Career progress" icon={Trophy}>
              {stats && (
                <div className="flex items-center justify-around">
                  <StatRing value={stats.interviewRate} label="Interview" tone="primary" />
                  <StatRing value={stats.offerRate} label="Offer" tone="accent" />
                  <StatRing value={stats.acceptanceRate} label="Accept" tone="success" />
                </div>
              )}
            </SectionCard>
          </aside>
        )}
      </div>

      {/* Follow-up section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Follow-ups" subtitle="Pending & completed" icon={MessageSquare}>
          <p className="text-xs text-muted-foreground">Follow-ups will appear here as you track your applications.</p>
        </SectionCard>

        <SectionCard title="Interview center" subtitle="Upcoming, past & question bank" icon={Briefcase}>
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Upcoming</div>
              <InterviewRounds
                rounds={applications
                  .flatMap((a) => a.interviews.map((r) => ({ ...r, name: `${a.company} · ${r.name}` })))
                  .filter((r) => r.status === "scheduled")
                  .slice(0, 4)}
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}