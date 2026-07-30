import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Widget, CommandHero, PriorityTile,
  TrendAreaChart, DualLineChart, DonutChart, DistributionBars,
  ActivityHeatmap, SkillGapList, GoalList,
  RecommendationRow, ActivityTimeline, UpcomingList,
  QuickActionsGrid, AchievementCard, InsightPill,
} from "@/components/dashboard/widgets";
import {
  currentUser, healthScore, priorities, resumeHealthTrend, atsTrend,
  applicationsByStatus, weeklyActivity, jobMatchDistribution,
  skillGaps, careerGoals, recommendations, timeline, upcoming,
  quickActions, achievements, insights,
} from "@/lib/dashboard-data";

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
        greeting={currentUser.greeting}
        name={currentUser.firstName}
        streak={currentUser.streakDays}
        health={{ overall: healthScore.overall, delta: healthScore.delta }}
        resume={healthScore.resume}
        weekly={healthScore.weeklyProgress}
        weeklyLabel={healthScore.weeklyGoalLabel}
      />

      {/* Insights ribbon */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((i) => <InsightPill key={i.id} i={i} />)}
      </div>

      {/* Section 1 — Today's priorities */}
      <section aria-labelledby="priorities" className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="priorities" className="text-lg font-semibold tracking-tight">Today's priorities</h2>
            <p className="text-sm text-muted-foreground">The 6 highest-leverage actions across your workspace.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {priorities.map((p) => <PriorityTile key={p.id} p={p} />)}
        </div>
      </section>

      {/* Section 2 — Career analytics: 12-col grid */}
      <section aria-labelledby="analytics" className="flex flex-col gap-4">
        <div>
          <h2 id="analytics" className="text-lg font-semibold tracking-tight">Career analytics</h2>
          <p className="text-sm text-muted-foreground">Momentum across resume, applications and skills.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-8 xl:grid-cols-12">
          <Widget title="Resume health" subtitle="Weekly ATS trajectory" span="xl:col-span-5 lg:col-span-4">
            <TrendAreaChart data={resumeHealthTrend} />
          </Widget>

          <Widget title="ATS this week" subtitle="Your resume vs. cohort median" span="xl:col-span-4 lg:col-span-4">
            <DualLineChart data={atsTrend} />
            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-full bg-primary" />You</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-full bg-accent" />Median</span>
            </div>
          </Widget>

          <Widget title="Applications" subtitle="By pipeline status" span="xl:col-span-3 lg:col-span-4">
            <DonutChart data={applicationsByStatus} centerLabel="Total" />
          </Widget>

          <Widget title="Weekly activity" subtitle="Actions per day, last 7 weeks" span="xl:col-span-5 lg:col-span-4">
            <ActivityHeatmap data={weeklyActivity} />
          </Widget>

          <Widget title="Job match distribution" subtitle="61 tracked roles" span="xl:col-span-4 lg:col-span-4">
            <DistributionBars data={jobMatchDistribution} />
          </Widget>

          <Widget title="Skill gap progress" subtitle="Target vs. current" span="xl:col-span-3 lg:col-span-4">
            <SkillGapList items={skillGaps} />
          </Widget>

          <Widget title="Career goals" subtitle="This quarter" span="xl:col-span-12 lg:col-span-8">
            <GoalList items={careerGoals} />
          </Widget>
        </div>
      </section>

      {/* Section 3 + 4 + 5 + 6: layout grid */}
      <section className="grid gap-4 lg:grid-cols-8 xl:grid-cols-12">
        {/* AI Recommendations */}
        <Widget
          title="AI recommendations"
          subtitle="Tailored to your goals and target roles"
          span="xl:col-span-7 lg:col-span-5"
          action={
            <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg text-xs">
              <Link to="/recommendations">See all</Link>
            </Button>
          }
        >
          <div className="-mx-2 divide-y divide-border/40">
            {recommendations.map((r) => (
              <div key={r.id} className="px-2 first:pt-0 last:pb-0">
                <RecommendationRow r={r} />
              </div>
            ))}
          </div>
        </Widget>

        {/* Upcoming */}
        <Widget title="Upcoming" subtitle="Interviews, deadlines and follow-ups"
          span="xl:col-span-5 lg:col-span-3">
          <UpcomingList items={upcoming} />
        </Widget>

        {/* Recent activity */}
        <Widget title="Recent activity" subtitle="Latest across your workspace"
          span="xl:col-span-7 lg:col-span-5">
          <ActivityTimeline items={timeline} />
        </Widget>

        {/* Quick actions */}
        <Widget title="Quick actions" subtitle="Jump back into work"
          span="xl:col-span-5 lg:col-span-3">
          <QuickActionsGrid items={quickActions} />
        </Widget>
      </section>

      {/* Section 7 — Achievements */}
      <section aria-labelledby="achievements" className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="achievements" className="text-lg font-semibold tracking-tight">Achievements</h2>
            <p className="text-sm text-muted-foreground">Milestones that mark your career momentum.</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {achievements.filter((a) => a.earned).length} / {achievements.length} earned
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((a) => <AchievementCard key={a.id} a={a} />)}
        </div>
      </section>
    </div>
  );
}
