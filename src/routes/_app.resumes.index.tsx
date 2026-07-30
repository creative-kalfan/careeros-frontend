import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Plus, Upload, ArrowUpRight, Clock, Gauge, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumes } from "@/hooks/api/useResumes";
import { getErrorMessage } from "@/utils/api-error";

export const Route = createFileRoute("/_app/resumes/")({
  head: () => ({
    meta: [
      { title: "Resumes · CareerOS" },
      { name: "description", content: "Version, tailor and manage every resume in one intelligent workspace." },
    ],
  }),
  component: ResumesPage,
});

function scoreTone(score: number) {
  if (score >= 85) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-destructive";
}

function ResumesPage() {
  const { data, isLoading, isError, error } = useResumes();
  const resumes = data?.resumes ?? [];

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          eyebrow="Workspace"
          title="Resumes"
          description="Version, tailor and manage every resume in one intelligent workspace."
        />
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-surface-elevated/30 py-24 text-center">
          <div className="max-w-[320px]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-destructive/25 to-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="mt-4 text-sm font-semibold">Couldn't load resumes</div>
            <div className="mt-1 text-xs text-muted-foreground">{getErrorMessage(error)}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-lg text-xs"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        eyebrow="Workspace"
        title="Resumes"
        description="Version, tailor and manage every resume in one intelligent workspace."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <Upload className="mr-1.5 h-4 w-4" /> Import
            </Button>
            <Button className="rounded-xl shadow-[var(--shadow-glow)]">
              <Plus className="mr-1.5 h-4 w-4" /> New resume
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass relative h-full overflow-hidden rounded-2xl border-border/60 p-5">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </Card>
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-surface-elevated/30 py-24 text-center">
          <div className="max-w-[280px]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/25">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-4 text-sm font-semibold">No resumes yet</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Upload your first resume to get started with AI-powered analysis.
            </div>
            <Button className="mt-4 rounded-xl text-xs shadow-[var(--shadow-glow)]">
              <Upload className="mr-1.5 h-4 w-4" /> Upload resume
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <Link
              key={r.id}
              to="/resumes/$id"
              params={{ id: r.id }}
              className="group animate-fade-in"
            >
              <Card className="glass relative h-full overflow-hidden rounded-2xl border-border/60 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevation-2)]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-linear-to-br from-primary/20 to-accent/10 blur-3xl transition group-hover:scale-125" />
                <div className="relative flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-background/50 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="relative mt-4">
                  <div className="truncate text-base font-semibold tracking-tight">{r.name}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{r.role || "No target role"}</div>
                </div>
                <div className="relative mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {r.updatedAt}
                  </span>
                  <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/50" />
                  <span className="inline-flex items-center gap-1">
                    <Gauge className="h-3 w-3" /> ATS
                    <span className={`font-mono font-semibold ${scoreTone(r.atsScore)}`}>{r.atsScore}</span>
                  </span>
                </div>
                <div className="relative mt-4 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="rounded-full text-[10px]">v1</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}