import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, FileText, BarChart3, Bot } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerOS — AI Career Operating System" },
      { name: "description", content: "A premium workspace for resumes, ATS optimization, job intelligence and applications." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="bg-linear-to-br from-primary to-accent bg-clip-text text-transparent">
              CareerOS
            </span>
            <span className="text-foreground"> — Your AI Career Operating System</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            A premium workspace that manages the complete job search lifecycle.
            From resume optimization to application tracking, powered by AI.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition hover:bg-accent"
            >
              Create account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-surface-elevated/30 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Everything you need to land your dream job
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            All-in-one platform for job seekers
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Resume Builder"
              description="Create and optimize your resume with AI-powered suggestions"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="ATS Analysis"
              description="Check how your resume performs against job descriptions"
            />
            <FeatureCard
              icon={<Briefcase className="h-8 w-8" />}
              title="Job Intelligence"
              description="Track applications and get personalized job recommendations"
            />
            <FeatureCard
              icon={<Bot className="h-8 w-8" />}
              title="AI Copilot"
              description="Get help with cover letters, interview prep, and more"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 rounded-xl bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}