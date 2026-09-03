import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, AlertCircle, Sparkles, Target, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Career3DTopology } from "@/components/dashboard/career-3d-topology";
import {
  Widget,
  ExecutiveTelemetryRibbon,
  CareerActionDirectives,
  PipelineDistributionInstrument,
  ActivityTimeline,
  UpcomingList,
  QuickActionsGrid,
  InsightPill,
} from "@/components/dashboard/widgets";
import { useDashboardData } from "@/hooks/api/useDashboardData";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Command Center · CareerOS" },
      {
        name: "description",
        content:
          "Your executive career cockpit — real-time ATS telemetry, 3D skill topology, matching pool calibration, and high-impact directives.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, isError, refetch } = useDashboardData();

  const fallbackData = {
    greeting: "Welcome back",
    firstName: "Candidate",
    streakDays: 12,
    healthScore: {
      overall: 88,
      delta: 4,
      resume: 85,
      applications: 75,
      skills: 90,
      weeklyProgress: 72,
      weeklyGoalLabel: "5 of 7 daily actions",
    },
    recommendations: [],
    applicationsByStatus: [
      { label: "Applied", value: 14, color: "oklch(0.64 0.21 258)" },
      { label: "Screening", value: 6, color: "oklch(0.66 0.18 290)" },
      { label: "Interview", value: 3, color: "oklch(0.74 0.16 152)" },
      { label: "Offer", value: 1, color: "oklch(0.78 0.15 75)" },
    ],
    jobMatchDistribution: [
      { label: "High Match (85%+)", value: 8, color: "oklch(0.74 0.16 152)" },
      { label: "Medium Match (70-85%)", value: 14, color: "oklch(0.64 0.21 258)" },
      { label: "Exploratory (60-70%)", value: 5, color: "oklch(0.66 0.18 290)" },
    ],
    upcoming: [
      {
        id: "u-1",
        kind: "interview" as const,
        title: "Technical Architecture Screen",
        detail: "System Design & Distributed Patterns",
        when: "Tomorrow 2:00 PM",
        urgency: "today" as const,
      },
      {
        id: "u-2",
        kind: "deadline" as const,
        title: "Stripe Staff Engineer Application",
        detail: "Resume tailored · Pending final review",
        when: "In 2 days",
        urgency: "soon" as const,
      },
    ],
    recentActivity: [
      {
        id: "t-1",
        kind: "ats" as const,
        title: "ATS score increased to 85",
        detail: "Quantified metric improvements across 4 experience bullets.",
        time: "12m ago",
      },
      {
        id: "t-2",
        kind: "job" as const,
        title: "Discovered 8 high-fit positions",
        detail: "Matched 90%+ with Linear, Vercel, and Figma engineering roles.",
        time: "1h ago",
      },
      {
        id: "t-3",
        kind: "resume" as const,
        title: "Generated tailored variant for Senior Staff Engineer",
        detail: "Integrated system architecture and distributed consensus competencies.",
        time: "3h ago",
      },
    ],
  };

  const activeData = data || fallbackData;
  const matchCount = activeData.jobMatchDistribution.reduce((s, d) => s + d.value, 0);
  const highFitCount =
    activeData.jobMatchDistribution.find((d) => d.label.includes("High") || d.label.includes("90"))
      ?.value || 8;

  if (isError) {
    return (
      <div className="w-full max-w-[1536px] mx-auto flex flex-col items-center justify-center gap-4 px-4 sm:px-6 lg:px-8 py-20">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-base font-semibold">Failed to load command deck telemetry</h2>
        <p className="text-xs text-muted-foreground">
          Could not load your live workspace data. Please verify connectivity and try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-lg">
          Re-initialize Telemetry
        </Button>
      </div>
    );
  }

  // Structured High-Leverage Career Directives
  const careerDirectives = [
    {
      id: "d-tailor",
      title: "Tailor Resume for Top Match",
      detail: "Lead Platform Engineer (94% fit) · 3 suggested bullet refinements ready.",
      scoreImpact: "+12% Match Fit",
      badge: "Urgent Directive",
      tone: "primary" as const,
      actionLabel: "Open Studio",
      href: "/resumes",
      icon: "resume" as const,
    },
    {
      id: "d-ats",
      title: "Run ATS Diagnostics",
      detail: "Scan current active CV against latest Staff Engineer target JDs.",
      scoreImpact: "Target 90+",
      badge: "High Impact",
      tone: "accent" as const,
      actionLabel: "Run Scan",
      href: "/ats",
      icon: "ats" as const,
    },
    {
      id: "d-roles",
      title: "Review Recommended Roles",
      detail: `${highFitCount} fresh high-fit opportunities surfaced in your match pool today.`,
      scoreImpact: `${matchCount} Total Pool`,
      badge: "Market Match",
      tone: "success" as const,
      actionLabel: "View Pool",
      href: "/jobs",
      icon: "jobs" as const,
    },
    {
      id: "d-skills",
      title: "Align In-Demand Skill Gaps",
      detail: "Adding Distributed Systems benchmarking unlocks 14 additional tier-1 roles.",
      scoreImpact: "+18% Visibility",
      badge: "Skill Velocity",
      tone: "warning" as const,
      actionLabel: "Review Gaps",
      href: "/recommendations",
      icon: "skills" as const,
    },
  ];

  return (
    <motion.div
      className="w-full max-w-[1536px] mx-auto flex flex-col gap-5 px-4 sm:px-6 lg:px-8 py-5"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Flight Deck Header */}
      <motion.div variants={staggerItem}>
        <PageHeader
          eyebrow="Flight Deck • Command Center"
          title="Career Intelligence Cockpit"
          description="Real-time telemetry, 3D skill topology constellation, and high-impact tactical directives."
          actions={
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-lg text-xs font-mono">
                <Link to="/recommendations">
                  All Directives <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 1. TOP HORIZON: Sleek Executive Telemetry Ribbon */}
      <ExecutiveTelemetryRibbon
        greeting={activeData.greeting}
        name={activeData.firstName}
        streak={activeData.streakDays}
        health={{
          overall: activeData.healthScore.overall || 88,
          delta: (activeData.healthScore as any).delta ?? 4,
        }}
        resumeScore={activeData.healthScore.resume || 85}
        matchPoolCount={matchCount || 22}
        highFitCount={highFitCount}
        weeklyProgress={activeData.healthScore.weeklyProgress || 70}
        weeklyGoalLabel={activeData.healthScore.weeklyGoalLabel || "5 of 7 actions completed"}
      />

      {/* 2. PRIMARY COMMAND HORIZON: 2-Column Cockpit Layout */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Left Column (7 cols on xl / 12 on lg): 3D Career Vector & Skill Topology Canvas */}
        <div className="xl:col-span-7 col-span-12 flex flex-col">
          <Career3DTopology
            careerScore={activeData.healthScore.overall || 88}
            className="h-full"
          />
        </div>

        {/* Right Column (5 cols on xl / 12 on lg): High-Leverage Career Action Directives */}
        <div className="xl:col-span-5 col-span-12 flex flex-col">
          <CareerActionDirectives directives={careerDirectives} />
        </div>
      </motion.div>

      {/* 3. SECONDARY HORIZON: Streamlined Pipeline & Calibration */}
      <motion.div variants={staggerItem}>
        <PipelineDistributionInstrument
          applications={activeData.applicationsByStatus}
          matchDistribution={activeData.jobMatchDistribution}
        />
      </motion.div>

      {/* 4. TERTIARY HORIZON: Command Matrix & Telemetry Activity Stream */}
      <motion.section
        variants={staggerItem}
        aria-labelledby="tactical-deck"
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        {/* Left: Quick Command Matrix */}
        <Widget
          title="Tactical Command Matrix"
          subtitle="One-click operations & workspace launchers"
          span="lg:col-span-5 col-span-12"
        >
          <QuickActionsGrid
            items={[
              { id: "qa-1", label: "Upload / Sync Resume", icon: "upload", href: "/resumes" },
              { id: "qa-2", label: "Run ATS Diagnostics", icon: "sparkles", href: "/ats" },
              { id: "qa-3", label: "Explore Match Pool", icon: "search", href: "/jobs" },
              { id: "qa-4", label: "Open Copilot Studio", icon: "bot", href: "/copilot" },
              { id: "qa-5", label: "Pipeline Kanban Tracker", icon: "kanban", href: "/applications" },
              { id: "qa-6", label: "AI Recommendations", icon: "star", href: "/recommendations" },
            ]}
          />
        </Widget>

        {/* Right: Recent Audit & Activity Stream */}
        <Widget
          title="Operational Telemetry Stream"
          subtitle="Real-time audit log across your career workspace"
          span="lg:col-span-7 col-span-12"
          action={
            <Button asChild size="sm" variant="ghost" className="h-7 rounded-lg text-xs font-mono">
              <Link to="/recommendations">Full Audit</Link>
            </Button>
          }
        >
          {activeData.recentActivity.length > 0 ? (
            <ActivityTimeline items={activeData.recentActivity} />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
              <Activity className="h-6 w-6 text-primary/60 mb-2 animate-pulse" />
              <span>Telemetry stream active. Workspace events will record in real-time.</span>
            </div>
          )}
        </Widget>
      </motion.section>
    </motion.div>
  );
}
