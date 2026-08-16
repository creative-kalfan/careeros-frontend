import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, RefreshCw, Check, X, AlertCircle, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useResume, useUpdateResume } from "@/hooks/api/useResumes";
import { useOptimizationSuggestions, useRecalculateATS, useAcceptSuggestion } from "@/hooks/api/useATS";
import { getErrorMessage } from "@/utils/api-error";

export const Route = createFileRoute("/_app/optimizer/$resumeId")({
  head: () => ({
    meta: [
      { title: "Resume Optimizer · CareerOS" },
      { name: "description", content: "Optimize your resume with AI-powered suggestions." },
    ],
  }),
  component: OptimizerPage,
});

function OptimizerPage() {
  const { resumeId } = useParams({ from: "/_app/optimizer/$resumeId" });
  const { data: resume, isLoading, isError, error } = useResume(resumeId);
  const updateResume = useUpdateResume();

  const suggestionsMutation = useOptimizationSuggestions();
  const recalculateMutation = useRecalculateATS();
  const acceptMutation = useAcceptSuggestion();

  const [activeTab, setActiveTab] = useState("suggestions");
  const [jobDescription, setJobDescription] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [reportId, setReportId] = useState<string | undefined>();
  const [baselineScores, setBaselineScores] = useState<any>(null);
  const [currentScores, setCurrentScores] = useState<any>(null);
  const [optimizedContent, setOptimizedContent] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeader eyebrow="Optimizer" title="Resume Optimizer" description="Loading..." />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 py-20">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load resume</h2>
        <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
        <Button asChild variant="outline"><Link to="/resumes">Back to resumes</Link></Button>
      </div>
    );
  }

  if (!resume) return null;

  // Convert ResumeData sections to the content format expected by the optimizer API
  const resumeContent = {
    sections: (resume as any).sections || [],
    summary: (resume as any).summary || "",
    experience: (resume as any).experience || [],
    education: (resume as any).education || [],
    skills: (resume as any).skills || [],
    projects: (resume as any).projects || [],
  };

  const handleGetSuggestions = async () => {
    try {
      const result = await suggestionsMutation.mutateAsync({
        resumeId,
        content: resumeContent as any,
        reportId,
      });
      setSuggestions(result.suggestions || []);
      setReportId(result.reportId);
      setBaselineScores(result.baselineScores);
      setCurrentScores(null);
      setOptimizedContent(null);
    } catch (err) {
      console.error("Failed to get suggestions:", err);
    }
  };

  const handleRecalculate = async () => {
    try {
      const result = await recalculateMutation.mutateAsync({
        resumeId,
        content: optimizedContent || resumeContent as any,
        jobDescription: jobDescription || undefined,
      });
      setCurrentScores(result.current);
      setBaselineScores(result.previous);
      setReportId(result.current.reportId);
    } catch (err) {
      console.error("Failed to recalculate:", err);
    }
  };

  const handleAcceptSuggestion = async (suggestion: any) => {
    try {
      const result = await acceptMutation.mutateAsync({
        resumeId,
        suggestion,
        content: optimizedContent || resumeContent as any,
      });
      setOptimizedContent(result.content);
      // Refresh suggestions
      await handleGetSuggestions();
    } catch (err) {
      console.error("Failed to accept suggestion:", err);
    }
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  const scoreDiff = currentScores && baselineScores
    ? currentScores.atsScore - baselineScores.atsScore
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader
        eyebrow="Optimizer"
        title={`Optimize: ${resume.name || "Resume"}`}
        description="AI-powered suggestions to improve your ATS score."
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/resumes"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
          </Button>
        }
      />

      {/* Score comparison */}
      {baselineScores && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Baseline ATS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{baselineScores.atsScore}</div>
            </CardContent>
          </Card>
          {currentScores && (
            <>
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Optimized ATS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentScores.atsScore}</div>
                </CardContent>
              </Card>
              <Card className={`border-border/60 ${scoreDiff > 0 ? "bg-success/5" : scoreDiff < 0 ? "bg-destructive/5" : ""}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${scoreDiff > 0 ? "text-success" : scoreDiff < 0 ? "text-destructive" : ""}`}>
                    {scoreDiff > 0 ? "+" : ""}{scoreDiff}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Job description input */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Target Job Description</CardTitle>
          <CardDescription>Paste a job description to get tailored suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description here..."
              className="flex-1 h-20 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleGetSuggestions}
          disabled={suggestionsMutation.isPending}
          className="rounded-xl"
        >
          {suggestionsMutation.isPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-1 h-4 w-4" />
          )}
          Get Suggestions
        </Button>
        <Button
          variant="outline"
          onClick={handleRecalculate}
          disabled={recalculateMutation.isPending}
          className="rounded-xl"
        >
          {recalculateMutation.isPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-4 w-4" />
          )}
          Recalculate ATS
        </Button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="rounded-xl">
            <TabsTrigger value="suggestions" className="rounded-lg">
              Suggestions ({suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="preview" className="rounded-lg">
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-4">
            <ScrollArea className="max-h-[500px]">
              <div className="flex flex-col gap-3">
                {suggestions.map((suggestion: any) => (
                  <Card key={suggestion.id} className="border-border/60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {suggestion.category}
                            </Badge>
                            <span className="text-sm font-medium">{suggestion.title}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
                          {suggestion.preview && (
                            <div className="mt-2 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                              {suggestion.preview}
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
            <Card className="border-border/60">
              <CardContent className="p-6">
                {optimizedContent ? (
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(optimizedContent, null, 2)}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
                    <FileText className="h-12 w-12" />
                    <p className="text-sm">Accept a suggestion to preview the optimized resume.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty state */}
      {suggestions.length === 0 && !suggestionsMutation.isPending && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Sparkles className="h-12 w-12 text-muted-foreground/40" />
          <h2 className="text-lg font-semibold">Get optimization suggestions</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Click "Get Suggestions" to receive AI-powered recommendations for improving your resume's ATS score.
          </p>
        </div>
      )}
    </div>
  );
}