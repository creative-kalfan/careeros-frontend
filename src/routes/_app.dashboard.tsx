import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Widget, CommandHero, PriorityTile,
  TrendAreaChart, DualLineChart, DonutChart, DistributionBars,
  ActivityHeatmap, SkillGapList, GoalList,
  RecommendationRow, ActivityTimeline, UpcomingList,
  QuickActionsGrid, AchievementCard, InsightPill,
} from "@/components/dashboard/widgets";
import { useDashboardData } from "@/hooks/api/useDashboardData";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Command Center · CareerOS" },
      { name: "description", content: "Your daily career workspace — priorities, analytics, recommendations and next best actions." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, isError, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
        <PageHeader
          eyebrow="Command Center"
          title="Your career, at a glance"
          description="Loading your dashboard..."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center gap-4 px-4 py-20">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground">Could not load your dashboard data. Please try again.</p>
        <Button variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  if (!data) return null;

  // Static data that doesn't need API calls
  const staticPriorities = [
    { id: "p-jobs", kind: "jobs" as const, title: "Browse personalized jobs", detail: "View jobs matched to your profile.", meta: `${data.jobMatchDistribution.reduce((s, d) => s + d.value, 0)} tracked`, cta: "Browse", href: "/jobs", accent: "primary" as const },
    { id: "p-apps", kind: "followup" as const, title: "Track your applications", detail: "Stay on top of your application pipeline.", meta: `${data.applicationsByStatus.reduce((s, d) => s + d.value, 0)} total`, cta: "View", href: "/applications", accent: "success" as const },
    { id: "p-ats", kind: "resume" as const, title: "Check your ATS score", detail: "Analyze your resume against job descriptions.", meta: "ATS Studio", cta: "Open", href: "/ats", accent: "accent" as const },
    { id: "p-recs", kind: "skills" as const, title: `${data.recommendations.length} recommendations`, detail: "Personalized actions to improve your profile.", meta: "AI-powered", cta: "Review", href: "/recommendations", accent: "warning" as const },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8">
      <PageHeader
        eyebrow="Command Center"
        title="Your career, at a glance"
        description="Priorities, momentum and next best actions — updated in real time."
        actions={
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/recommendations">
              All recommendations <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* Hero */}
      <CommandHero
        greeting={data.greeting}
        name={data.firstName}
        streak={data.streakDays}
        health={{ overall: data.healthScore.overall, delta: 0 }}
        resume={data.healthScore.resume}
        weekly={data.healthScore.weeklyProgress}
        weeklyLabel={data.healthScore.weeklyGoalLabel}
      />

      {/* Insights ribbon */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.recommendations.length > 0 && (
          <InsightPill i={{ id: "i-recs", text: `${data.recommendations.length} personalized recommendations available.`, emphasis: `${data.recommendations.length} recs`, kind: "opportunity" }} />
        )}
        {data.applicationsByStatus.length > 0 && (
          <InsightPill i={{ id: "i-apps", text: `${data.applicationsByStatus.reduce((s, d) => s + d.value, 0)} applications tracked.`, emphasis: `${data.applicationsByStatus.reduce((s, d) => s + d.value, 0)} apps`, kind: "trend" }} />
        )}
        {data.jobMatchDistribution.length > 0 && (
          <InsightPill i={{ id: "i-jobs", text: `${data.jobMatchDistribution.reduce((s, d) => s + d.value, 0)} jobs in your match pool.`, emphasis: `${data.jobMatchDistribution.reduce((s, d) => s + d.value, 0)} jobs`, kind: "opportunity" }} />
        )}
        <InsightPill i={{ id: "i-default", text: "Use ATS Studio to score your resume against any job description.", emphasis: "ATS Studio", kind: "gap" }} />
      </div>

      {/* Section 1 — Today's priorities */}
      <section aria-labelledby="priorities" className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="priorities" className="text-lg font-semibold tracking-tight">Today's priorities</h2>
            <p className="text-sm text-muted-foreground">High-leverage actions across your workspace.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staticPriorities.map((p) => <PriorityTile key={p.id} p={p} />)}
        </div>
      </section>

      {/* Section 2 — Career analytics */}
      <section aria-labelledby="analytics" className="flex flex-col gap-4">
        <div>
          <h2 id="analytics" className="text-lg font-semibold tracking-tight">Career analytics</h2>
          <p className="text-sm text-muted-foreground">Momentum across applications and matches.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-8 xl:grid-cols-12">
          <Widget title="Applications" subtitle="By pipeline status" span="xl:col-span-4 lg:col-span-4">
            {data.applicationsByStatus.length > 0 ? (
              <DonutChart data={data.applicationsByStatus} centerLabel={String(data.applicationsByStatus.reduce((s, d) => s + d.value, 0))} />
            ) : (
              <p className="text-sm text-muted-foreground p-4">No applications yet. Start tracking your applications.</p>
            )}
          </Widget>

          <Widget title="Job match distribution" subtitle="Personalized matches" span="xl:col-span-4 lg:col-span-4">
            {data.jobMatchDistribution.reduce((s, d) => s + d.value, 0) > 0 ? (
              <DistributionBars data={data.jobMatchDistribution} />
            ) : (
              <p className="text-sm text-muted-foreground p-4">No matches yet. Update your profile to get matched.</p>
            )}
          </Widget>

          <Widget title="Health score" subtitle="Your career momentum" span="xl:col-span-4 lg:col-span-4">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="text-4xl font-bold">{data.healthScore.overall}</div>
              <p className="text-sm text-muted-foreground mt-2">Overall score</p>
              <div className="mt-4 w-full space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Applications</span>
                  <span>{data.healthScore.applications}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${data.healthScore.applications}%` }} />
                </div>
              </div>
            </div>
          </Widget>
        </div>
      </section>

      {/* Section 3 + 4 + 5: layout grid */}
      <section className="grid gap-4 lg:grid-cols-8 xl:grid-cols-12">
        {/* AI Recommendations */}
        <Widget
          title="AI recommendations"
          subtitle="Tailored to your profile"
          span="xl:col-span-7 lg:col-span-5"
          action={
            <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg text-xs">
              <Link to="/recommendations">See all</Link>
            </Button>
          }
        >
          {data.recommendations.length > 0 ? (
            <div className="-mx-2 divide-y divide-border/40">
              {data.recommendations.map((r) => (
                <div key={r.id} className="px-2 first:pt-0 last:pb-0">
                  <RecommendationRow r={r} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground p-4">No recommendations yet. Complete your profile to get started.</p>
          )}
        </Widget>

        {/* Upcoming */}
        <Widget title="Upcoming" subtitle="Interviews, deadlines and follow-ups"
          span="xl:col-span-5 lg:col-span-3">
          {data.upcoming.length > 0 ? (
            <UpcomingList items={data.upcoming} />
          ) : (
            <p className="text-sm text-muted-foreground p-4">No upcoming items. Track your applications to stay organized.</p>
          )}
        </Widget>

        {/* Recent activity */}
        <Widget title="Recent activity" subtitle="Latest across your workspace"
          span="xl:col-span-7 lg:col-span-5">
          {data.recentActivity.length > 0 ? (
            <ActivityTimeline items={data.recentActivity} />
          ) : (
            <p className="text-sm text-muted-foreground p-4">No recent activity. Start using CareerOS to see your activity here.</p>
          )}
        </Widget>

        {/* Quick actions */}
        <Widget title="Quick actions" subtitle="Jump back into work"
          span="xl:col-span-5 lg:col-span-3">
          <QuickActionsGrid items={[
            { id: "qa-1", label: "Upload resume", icon: "upload", href: "/resumes" },
            { id: "qa-2", label: "Search jobs", icon: "search", href: "/jobs" },
            { id: "qa-3", label: "Optimize resume", icon: "sparkles", href: "/ats" },
            { id: "qa-4", label: "Open Copilot", icon: "bot", href: "/copilot" },
            { id: "qa-5", label: "Application tracker", icon: "kanban", href: "/applications" },
            { id: "qa-6", label: "Recommendations", icon: "star", href: "/recommendations" },
          ] as const} />
        </Widget>
      </section>
    </div>
  );
}
