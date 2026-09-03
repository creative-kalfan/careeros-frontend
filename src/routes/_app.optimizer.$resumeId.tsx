import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Check,
  X,
  FileText,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ErrorState } from "@/components/shared/error-state";
import { useResume, useUpdateResume } from "@/hooks/api/useResumes";
import {
  useGenerateOptimization,
  useAcceptSuggestion,
  useReanalyze,
} from "@/hooks/api/useOptimization";
import type { OptimizationSuggestion } from "@/types/optimization";

export const Route = createFileRoute("/_app/optimizer/$resumeId")({
  head: () => ({
    meta: [
      { title: "Resume Optimizer · CareerOS" },
      { name: "description", content: "Optimize your resume with AI-powered suggestions." },
    ],
  }),
  component: OptimizerPage,
});

type ScoreSummary = {
  atsScore: number;
  keywordMatchScore: number;
  skillMatchScore: number;
  semanticSimilarityScore: number;
};

function OptimizerPage() {
  const { resumeId } = useParams({ from: "/_app/optimizer/$resumeId" });
  const { data: resume, isLoading, isError, error } = useResume(resumeId);
  const _updateResume = useUpdateResume();

  const generateMutation = useGenerateOptimization();
  const acceptMutation = useAcceptSuggestion(resumeId);
  const recalculateMutation = useReanalyze();

  const [activeTab, setActiveTab] = useState("suggestions");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [baselineScores, setBaselineScores] = useState<ScoreSummary | null>(null);
  const [currentScores, setCurrentScores] = useState<ScoreSummary | null>(null);
  const [optimizedContent, setOptimizedContent] = useState<Record<string, unknown> | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader eyebrow="Optimizer" title="Resume Optimizer" description="Loading..." />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 py-20">
        <ErrorState
          title="Failed to load resume"
          error={error}
          action={
            <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs">
              <Link to="/resumes">Back to resumes</Link>
            </Button>
          }
          className="max-w-md"
        />
      </div>
    );
  }

  if (!resume) return null;

  const handleGetSuggestions = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        resumeId,
        jobDescription,
        jobTitle: jobTitle || undefined,
        company: company || undefined,
      });
      setSuggestions(result.suggestions || []);
      setSessionId(result.sessionId);
      setBaselineScores(null);
      setCurrentScores(null);
      setOptimizedContent(null);
    } catch (err) {
      console.error("Failed to get suggestions:", err);
    }
  };

  const handleRecalculate = async () => {
    if (!sessionId) return;
    try {
      const result = await recalculateMutation.mutateAsync({
        resumeId,
        sessionId: sessionId!,
        jobDescription: jobDescription || "",
        jobTitle: jobTitle || undefined,
        company: company || undefined,
      });
      setCurrentScores({
        atsScore: result.currentScore,
        keywordMatchScore: 0,
        skillMatchScore: 0,
        semanticSimilarityScore: 0,
      });
      setBaselineScores({
        atsScore: result.previousScore,
        keywordMatchScore: 0,
        skillMatchScore: 0,
        semanticSimilarityScore: 0,
      });
    } catch (err) {
      console.error("Failed to recalculate:", err);
    }
  };

  const handleAcceptSuggestion = async (suggestion: OptimizationSuggestion) => {
    if (!sessionId) return;
    try {
      const result = await acceptMutation.mutateAsync({
        sessionId: sessionId!,
        suggestionId: suggestion.id,
        editedText: suggestion.suggestedText ?? undefined,
      });
      setOptimizedContent(result.updatedResume);
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch (err) {
      console.error("Failed to accept suggestion:", err);
    }
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  const scoreDiff =
    currentScores && baselineScores ? currentScores.atsScore - baselineScores.atsScore : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        eyebrow="Optimizer"
        title={`Optimize: ${resume.name || "Resume"}`}
        description="AI-powered suggestions to improve your ATS score."
        actions={
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs shadow-xs"
            >
              <Link to="/resumes">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
              </Link>
            </Button>
            <Button asChild size="sm" className="h-8 rounded-lg text-xs shadow-xs">
              <Link to="/resumes/$id" params={{ id: resumeId }}>
                Open in Studio <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* Canonical Bridge Banner */}
      <Card className="glass rounded-xl border border-primary/40 bg-primary/5 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/25">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                Next-Gen Two-Pane Resume Studio Available
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Edit side-by-side with live ATS scores, visual heatmaps, targeted bullet
                improvements, and version management.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0 rounded-lg text-xs shadow-xs">
            <Link to="/resumes/$id" params={{ id: resumeId }}>
              Launch Studio →
            </Link>
          </Button>
        </div>
      </Card>

      {/* Score comparison */}
      {baselineScores && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="glass rounded-xl border-border/80 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Baseline ATS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{baselineScores.atsScore}</div>
            </CardContent>
          </Card>
          {currentScores && (
            <>
              <Card className="glass rounded-xl border-border/80 shadow-xs">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Optimized ATS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{currentScores.atsScore}</div>
                </CardContent>
              </Card>
              <Card
                className={`glass rounded-xl border-border/80 shadow-xs ${scoreDiff > 0 ? "bg-success/5" : scoreDiff < 0 ? "bg-destructive/5" : ""}`}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Change
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div
                    className={`text-2xl font-bold ${scoreDiff > 0 ? "text-success" : scoreDiff < 0 ? "text-destructive" : ""}`}
                  >
                    {scoreDiff > 0 ? "+" : ""}
                    {scoreDiff}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Job description input */}
      <Card className="glass rounded-xl border-border/80 shadow-xs">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold">Target Job Description</CardTitle>
          <CardDescription className="text-xs">
            Paste a job description to get tailored suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="flex flex-col gap-2.5">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Target job title (optional)"
                className="h-9 rounded-lg border border-border/80 bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/60"
              />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Target company (optional)"
                className="h-9 rounded-lg border border-border/80 bg-surface-elevated px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/60"
              />
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description or requirements here…"
              className="h-24 w-full rounded-lg border border-border/80 bg-surface-elevated px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/60"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleGetSuggestions}
          disabled={generateMutation.isPending}
          className="h-8 rounded-lg text-xs shadow-xs"
        >
          {generateMutation.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          )}
          Get Suggestions
        </Button>
        <Button
          variant="outline"
          onClick={handleRecalculate}
          disabled={recalculateMutation.isPending || !sessionId}
          className="h-8 rounded-lg text-xs shadow-xs"
        >
          {recalculateMutation.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          Recalculate ATS
        </Button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass h-10 rounded-xl border border-border/80 bg-surface/50 p-1 shadow-xs">
            <TabsTrigger value="suggestions" className="rounded-lg text-xs">
              Suggestions ({suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="preview" className="rounded-lg text-xs">
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-4">
            <ScrollArea className="max-h-[500px]">
              <div className="flex flex-col gap-3">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="glass rounded-xl border-border/80 shadow-xs">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="rounded-md text-[10px]">
                              {suggestion.type}
                            </Badge>
                            <span className="text-xs font-medium">
                              {suggestion.section || "General"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {suggestion.explanation}
                          </p>
                          {suggestion.currentText && (
                            <div className="mt-2 rounded-lg border border-border/60 bg-surface-elevated/40 p-2.5 text-xs text-muted-foreground">
                              <span className="line-through opacity-70">
                                {suggestion.currentText}
                              </span>
                              <br />
                              <span className="text-success font-medium">
                                {suggestion.suggestedText}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            disabled={acceptMutation.isPending}
                          >
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => handleRejectSuggestion(suggestion.id)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <Card className="glass rounded-xl border-border/80 shadow-xs">
              <CardContent className="p-6">
                {optimizedContent ? (
                  <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/90">
                    {JSON.stringify(optimizedContent, null, 2)}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 text-muted-foreground/40" />
                    <p className="text-xs">Accept a suggestion to preview the optimized resume.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty state */}
      {suggestions.length === 0 && !generateMutation.isPending && (
        <div className="glass flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-surface/30 p-12 text-center shadow-xs">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-surface-elevated text-muted-foreground ring-1 ring-border/80 shadow-2xs">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">Get optimization suggestions</h3>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              Click &quot;Get Suggestions&quot; to receive AI-powered recommendations for improving
              your resume&apos;s ATS score.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
