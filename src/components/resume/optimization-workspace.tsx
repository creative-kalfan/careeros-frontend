"use client";

import { useState, useMemo, useEffect } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, History, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-tooltip";
import { OptimizationSuggestionCard } from "./optimization-suggestion-card";
import {
  useGenerateOptimization,
  useAcceptSuggestion,
  useRejectSuggestion,
  useReanalyze,
  useOptimizationHistory,
} from "@/hooks/api/useOptimization";
import type {
  OptimizationSuggestion,
  OptimizationHistoryItem,
  ReanalyzeResponse,
  OptimizationView,
} from "@/types/optimization";

type OptimizationWorkspaceProps = {
  resumeId: string;
  versionId?: string;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
  baselineAtsScore?: number | null;
  atsReportId?: string;
  onClose?: () => void;
  autoGenerate?: boolean;
};

export function OptimizationWorkspace({
  resumeId,
  versionId,
  jobDescription,
  jobTitle,
  company,
  baselineAtsScore,
  atsReportId,
  onClose,
  autoGenerate,
}: OptimizationWorkspaceProps) {
  const { toast } = useToast();

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [view, setView] = useState<OptimizationView>("all");
  const [expanded, setExpanded] = useState(true);
  const [reanalysis, setReanalysis] = useState<ReanalyzeResponse | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const generateMutation = useGenerateOptimization();
  const acceptMutation = useAcceptSuggestion(resumeId);
  const rejectMutation = useRejectSuggestion(resumeId);
  const reanalyzeMutation = useReanalyze();
  const { data: historyData } = useOptimizationHistory(resumeId);

  useEffect(() => {
    if (!autoGenerate) return;
    if (!jobDescription.trim()) {
      toast.error("Job description is required for optimization");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const result = await generateMutation.mutateAsync({
          resumeId,
          versionId,
          jobDescription,
          jobTitle,
          company,
          atsReportId,
        });
        if (!cancelled) {
          setSessionId(result.sessionId);
          setSuggestions(result.suggestions);
          setView("all");
          setReanalysis(null);
          toast.success(result.message || "Suggestions generated");
          // Auto-close dialog — suggestions appear in LeftPane via session query
          onClose?.();
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to generate suggestions");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoGenerate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        resumeId,
        versionId,
        jobDescription,
        jobTitle,
        company,
        atsReportId,
      });
      setSessionId(result.sessionId);
      setSuggestions(result.suggestions);
      setView("all");
      setReanalysis(null);
      toast.success(result.message || "Suggestions generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate suggestions");
    }
  };

  const handleAccept = async (suggestionId: string, editedText?: string) => {
    if (!sessionId) return;
    try {
      const result = await acceptMutation.mutateAsync({
        sessionId,
        suggestionId,
        editedText,
      });
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, status: result.status } : s)),
      );
      toast.success(result.message || "Suggestion accepted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept suggestion");
    }
  };

  const handleReject = async (suggestionId: string) => {
    if (!sessionId) return;
    try {
      const result = await rejectMutation.mutateAsync({
        sessionId,
        suggestionId,
      });
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, status: result.status } : s)),
      );
      toast.success(result.message || "Suggestion rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject suggestion");
    }
  };

  const handleReanalyze = async () => {
    if (!sessionId) return;
    setIsReanalyzing(true);
    try {
      const result = await reanalyzeMutation.mutateAsync({
        resumeId,
        sessionId,
        jobDescription,
        jobTitle,
        company,
      });
      setReanalysis(result);
      toast.success(result.message || "Re-analysis complete");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Re-analysis failed");
    } finally {
      setIsReanalyzing(false);
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (view === "all") return suggestions;
    if (view === "accepted")
      return suggestions.filter((s) => s.status === "accepted" || s.status === "edited");
    if (view === "rejected") return suggestions.filter((s) => s.status === "rejected");
    if (view === "summary") return suggestions.filter((s) => s.type === "professional_summary");
    if (view === "experience") return suggestions.filter((s) => s.type === "experience_bullet");
    if (view === "projects") return suggestions.filter((s) => s.type === "project_bullet");
    if (view === "skills") return suggestions.filter((s) => s.type === "skills_alignment");
    return suggestions;
  }, [suggestions, view]);

  const counts = useMemo(
    () => ({
      all: suggestions.length,
      summary: suggestions.filter((s) => s.type === "professional_summary").length,
      experience: suggestions.filter((s) => s.type === "experience_bullet").length,
      projects: suggestions.filter((s) => s.type === "project_bullet").length,
      skills: suggestions.filter((s) => s.type === "skills_alignment").length,
      accepted: suggestions.filter((s) => s.status === "accepted" || s.status === "edited").length,
      rejected: suggestions.filter((s) => s.status === "rejected").length,
    }),
    [suggestions],
  );

  const scoreDelta = reanalysis?.delta ?? null;

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Resume Optimization</h3>
          {sessionId && (
            <Badge variant="secondary" className="text-[10px]">
              {suggestions.length} suggestions
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((e) => !e)}
            className="h-7 w-7"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!sessionId ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Generate AI-powered suggestions to improve your resume for this specific job.
                </p>
                {baselineAtsScore !== null && baselineAtsScore !== undefined && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">Baseline ATS Score:</span>
                    <Badge variant="outline" className="text-[10px]">
                      {baselineAtsScore}/100
                    </Badge>
                  </div>
                )}
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full"
                  size="sm"
                >
                  {generateMutation.isPending ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Wand2 className="h-3.5 w-3.5 mr-2" /> Optimize Resume
                    </>
                  )}
                </Button>
              </div>

              {historyData?.history && historyData.history.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <History className="h-3.5 w-3.5" />
                    <span>Optimization History</span>
                  </div>
                  <div className="space-y-2">
                    {historyData.history.slice(0, 5).map((item: OptimizationHistoryItem) => (
                      <div
                        key={
                          item.sessionId ?? `hist-${item.createdAt}-${item.jobTitle ?? "untitled"}`
                        }
                        className="flex items-center justify-between rounded-md border border-border/40 p-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">
                            {item.jobTitle || "Untitled"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.company || "No company"} •{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.baselineScore !== null && item.finalScore !== null && (
                            <Badge variant="outline" className="text-[10px]">
                              {item.finalScore - item.baselineScore >= 0 ? "+" : ""}
                              {(item.finalScore - item.baselineScore).toFixed(1)}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px]">
                            {item.acceptedCount}/{item.suggestionsCount}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {scoreDelta !== null && (
                <div
                  className={`rounded-lg border p-3 ${scoreDelta >= 0 ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"}`}
                >
                  <p className="text-sm font-medium">
                    Score {scoreDelta >= 0 ? "improved" : "changed"} by {scoreDelta >= 0 ? "+" : ""}
                    {scoreDelta.toFixed(1)} points
                  </p>
                  {baselineAtsScore !== null && (
                    <p className="text-xs text-muted-foreground">
                      {baselineAtsScore} → {reanalysis?.currentScore}
                    </p>
                  )}
                </div>
              )}

              <Tabs value={view} onValueChange={(v) => setView(v as OptimizationView)}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="all" className="text-[10px] h-7 px-2">
                    All ({counts.all})
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="text-[10px] h-7 px-2">
                    Summary ({counts.summary})
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="text-[10px] h-7 px-2">
                    Exp ({counts.experience})
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="text-[10px] h-7 px-2">
                    Proj ({counts.projects})
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="text-[10px] h-7 px-2">
                    Skills ({counts.skills})
                  </TabsTrigger>
                  <TabsTrigger value="accepted" className="text-[10px] h-7 px-2">
                    Done ({counts.accepted})
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="text-[10px] h-7 px-2">
                    Skip ({counts.rejected})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-3 pr-2">
                  {filteredSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      {suggestions.length === 0
                        ? "No suggestions generated yet."
                        : "No suggestions match the current filter."}
                    </div>
                  ) : (
                    filteredSuggestions.map((suggestion) => (
                      <OptimizationSuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onAccept={(editedText) => handleAccept(suggestion.id, editedText)}
                        onReject={() => handleReject(suggestion.id)}
                        isAccepting={acceptMutation.isPending}
                        isRejecting={rejectMutation.isPending}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>

              <Separator />

              <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-muted-foreground">
                  {suggestions.filter((s) => s.status === "pending").length} pending •{" "}
                  {
                    suggestions.filter((s) => s.status === "accepted" || s.status === "edited")
                      .length
                  }{" "}
                  accepted • {suggestions.filter((s) => s.status === "rejected").length} rejected
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Regenerate
                  </Button>
                  <Button size="sm" onClick={handleReanalyze} disabled={isReanalyzing}>
                    {isReanalyzing ? (
                      <>Analyzing...</>
                    ) : (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
