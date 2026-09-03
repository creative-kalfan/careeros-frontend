import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  FileText,
  Clock,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResumes } from "@/hooks/api/useResumes";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/constants/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/ats-history")({
  head: () => ({
    meta: [
      { title: "ATS History · CareerOS" },
      { name: "description", content: "View your ATS analysis history across all resumes." },
    ],
  }),
  component: ATSHistoryPage,
});

interface ATSReport {
  id: string;
  resume_id: string;
  job_description: string;
  ats_score: number;
  skill_match_score: number;
  keyword_match_score: number;
  semantic_similarity_score: number;
  missing_skills: string[];
  missing_keywords: string[];
  matched_skills: string[];
  matched_keywords: string[];
  recommendations: string[];
  engine_version: string;
  created_at: string;
}

function ATSHistoryPage() {
  const { data: resumesData, isLoading: resumesLoading } = useResumes();
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const resumeId = selectedResumeId || resumesData?.resumes?.[0]?.id || null;

  const {
    data: historyData,
    isLoading: historyLoading,
    isError,
  } = useQuery({
    queryKey: ["ats-history", resumeId],
    queryFn: () =>
      request<{ reports: ATSReport[]; total: number; page: number; pageSize: number }>({
        method: "GET",
        path: API_ENDPOINTS.ATS.HISTORY(resumeId!),
      }),
    enabled: !!resumeId,
    staleTime: 30_000,
  });

  const reports = useMemo(() => historyData?.reports || [], [historyData?.reports]);
  const resumes = resumesData?.resumes || [];

  const scoreTrend = useMemo(() => {
    if (reports.length < 2) return null;
    const sorted = [...reports].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const first = sorted[0].ats_score;
    const last = sorted[sorted.length - 1].ats_score;
    const diff = last - first;
    return { first, last, diff, improved: diff > 0 };
  }, [reports]);

  if (resumesLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader
          eyebrow="Analytics"
          title="ATS History"
          description="Loading your ATS analysis history..."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-20 items-center justify-center gap-4">
        <FileText className="h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold">No resumes yet</h2>
        <p className="text-sm text-muted-foreground">
          Upload a resume to start analyzing your ATS scores.
        </p>
        <Button asChild>
          <Link to="/resumes">Upload Resume</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        eyebrow="Analytics"
        title="ATS History"
        description="View your ATS analysis history across all resumes."
      />

      {/* Resume selector */}
      {resumes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {resumes.map((r: any) => (
            <Button
              key={r.id}
              variant={r.id === resumeId ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setSelectedResumeId(r.id)}
            >
              {r.title || "Untitled Resume"}
            </Button>
          ))}
        </div>
      )}

      {/* Score trend card */}
      {scoreTrend && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">{scoreTrend.last}</div>
              <div className="flex items-center gap-1 text-sm">
                {scoreTrend.improved ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : scoreTrend.diff === 0 ? (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={
                    scoreTrend.improved
                      ? "text-success"
                      : scoreTrend.diff === 0
                        ? ""
                        : "text-destructive"
                  }
                >
                  {scoreTrend.diff > 0 ? "+" : ""}
                  {scoreTrend.diff} pts
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                From {scoreTrend.first} over {reports.length} analyses
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports list */}
      {historyLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-lg font-semibold">Failed to load history</h2>
          <p className="text-sm text-muted-foreground">
            Could not load ATS history for this resume.
          </p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">No ATS analyses yet</h2>
          <p className="text-sm text-muted-foreground">
            Run an ATS analysis to see your history here.
          </p>
          <Button asChild>
            <Link to="/ats">Open ATS Studio</Link>
          </Button>
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="flex flex-col gap-4">
            {reports.map((report: ATSReport) => {
              const scoreColor =
                report.ats_score >= 80
                  ? "text-success"
                  : report.ats_score >= 60
                    ? "text-warning"
                    : "text-destructive";
              return (
                <Card key={report.id} className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${scoreColor}`}>
                            {report.ats_score}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {report.engine_version || "v1"}
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-muted-foreground">
                            Keyword match: {report.keyword_match_score}%
                          </span>
                          <span className="text-muted-foreground">
                            Skill match: {report.skill_match_score}%
                          </span>
                          <span className="text-muted-foreground">
                            Semantic similarity: {report.semantic_similarity_score}%
                          </span>
                        </div>
                        {report.missing_keywords.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Missing keywords:{" "}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {report.missing_keywords.slice(0, 5).join(", ")}
                              {report.missing_keywords.length > 5 &&
                                ` +${report.missing_keywords.length - 5} more`}
                            </span>
                          </div>
                        )}
                        {report.recommendations.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Recommendations:{" "}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {report.recommendations.length}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {report.job_description?.slice(0, 30)}...
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
