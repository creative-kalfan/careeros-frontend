import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { ArrowRight, Building2, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGenerateInterviewPrep, useInterviewPrepSessions } from "@/hooks/api/useInterviewPrep";
import { useApplications } from "@/hooks/api/useApplications";
import { INTERVIEW_TYPE_LABELS } from "@/types/interview-prep";

export interface InterviewPrepSearchParams {
  applicationId?: string;
  interviewId?: string;
}

export const Route = createFileRoute("/_app/interview-prep")({
  validateSearch: (search: Record<string, unknown>): InterviewPrepSearchParams => ({
    applicationId: typeof search.applicationId === "string" ? search.applicationId : undefined,
    interviewId: typeof search.interviewId === "string" ? search.interviewId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Interview Prep · CareerOS" },
      {
        name: "description",
        content:
          "Role-specific interview preparation grounded in your resume and the job description.",
      },
    ],
  }),
  component: InterviewPrepListPage,
});

function InterviewPrepListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  const { data, isLoading, isError, refetch } = useInterviewPrepSessions(search.applicationId);
  const { data: applications } = useApplications();
  const generate = useGenerateInterviewPrep();

  const sessions = data?.sessions ?? [];
  const contextApp = (applications ?? []).find((a) => a.id === search.applicationId);

  const handleGenerate = async (applicationId: string, interviewId?: string) => {
    setGenerating(true);
    try {
      const session = await generate.mutateAsync({
        application_id: applicationId,
        interview_id: interviewId,
      });
      toast.success("Preparation generated");
      navigate({ to: "/interview-prep/$sessionId", params: { sessionId: session.id } });
    } catch {
      toast.error("Generation failed — please retry");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        eyebrow="Interview Intelligence"
        title="Interview Prep"
        description="Role-specific questions grounded in your resume and the job — never generic."
        actions={
          contextApp && (
            <Button
              size="sm"
              className="gap-1.5"
              disabled={generating}
              onClick={() => handleGenerate(contextApp.id, search.interviewId)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generating ? "Generating…" : "Generate preparation"}
            </Button>
          )
        }
      />

      {contextApp && (
        <div className="workstation-panel flex items-center gap-3 rounded-xl p-3.5 text-sm">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <p className="min-w-0 grow truncate">
            Preparing for <span className="font-semibold">{contextApp.role}</span>
            <span className="text-muted-foreground"> at {contextApp.company}</span>
          </p>
          <Link
            to="/applications"
            className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            ← Mission Control
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load preparation sessions"
          description="Something went wrong fetching your interview prep."
          onRetry={() => refetch()}
        />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No preparation generated yet"
          description={
            search.applicationId
              ? "Generate your first preparation set for this interview — grounded in your resume and the job description."
              : "Open an application interview in Mission Control and choose “Prepare for Interview”."
          }
          action={
            search.applicationId ? (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={generating}
                onClick={() => handleGenerate(search.applicationId as string, search.interviewId)}
              >
                <Plus className="h-3.5 w-3.5" />
                {generating ? "Generating…" : "Generate preparation"}
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link to="/applications">Open Mission Control</Link>
              </Button>
            )
          }
        />
      ) : (
        <motion.ul variants={staggerItem} className="space-y-2.5">
          {sessions.map((s) => {
            const meta = s.source_metadata ?? {};
            return (
              <li key={s.id}>
                <Link
                  to="/interview-prep/$sessionId"
                  params={{ sessionId: s.id }}
                  className="glass group flex items-center gap-3 rounded-xl border border-border/80 p-4 shadow-xs transition-colors hover:border-primary/40"
                >
                  <div className="min-w-0 grow">
                    <p className="truncate text-sm font-medium">
                      {meta.job_title ?? "Interview preparation"}
                      {meta.company_name ? (
                        <span className="text-muted-foreground"> · {meta.company_name}</span>
                      ) : null}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="rounded-full text-[11px]">
                        {INTERVIEW_TYPE_LABELS[s.interview_type] ?? s.interview_type}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[11px]">
                        {s.status === "ready"
                          ? `${s.question_count} questions · ${s.prepared_count} prepared`
                          : s.status === "generating"
                            ? "Generating…"
                            : "Failed — retry available"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full font-mono text-[11px]">
                        v{s.version}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </li>
            );
          })}
        </motion.ul>
      )}
    </motion.div>
  );
}
