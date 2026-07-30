import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, RefreshCw, ThumbsUp, X } from "lucide-react";
import { useRecommendations, useTopRecommendations, useRefreshRecommendations, useSaveRecommendation, useDismissRecommendation } from "@/hooks/api/useRecommendations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_app/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations · CareerOS" },
      { name: "description", content: "Preference-aware matches blending ATS score with your career profile." },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { data, isLoading, error } = useRecommendations({ limit: 20, sort: "highest-score" });
  const { data: topData } = useTopRecommendations(5);
  const refreshMutation = useRefreshRecommendations();
  const saveMutation = useSaveRecommendation();
  const dismissMutation = useDismissRecommendation();

  const recommendations = data?.data?.recommendations ?? [];
  const topRecommendations = topData?.data?.recommendations ?? [];

  const handleSave = async (id: string) => {
    await saveMutation.mutateAsync(id);
  };

  const handleDismiss = async (id: string) => {
    await dismissMutation.mutateAsync(id);
  };

  const handleRefresh = async () => {
    await refreshMutation.mutateAsync();
  };

  const isSaving = saveMutation.isPending;
  const isDismissing = dismissMutation.isPending;
  const isRefreshing = refreshMutation.isPending;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "strong":
        return "bg-blue-100 text-blue-800";
      case "good":
        return "bg-yellow-100 text-yellow-800";
      case "possible":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-border/60 px-4 py-4 md:px-6">
        <PageHeader
          eyebrow="Intelligence"
          title="Recommendations"
          description="Preference-aware matches blending ATS score with your career profile."
          actions={
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
              {refreshMutation.isPending ? "Refreshing..." : "Refresh"}
            </Button>
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {error && (
          <Card className="mb-6 p-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Failed to load recommendations</p>
              <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
            </div>
          </Card>
        )}

        {!error && topRecommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Top Matches</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topRecommendations.map((rec) => (
                <Card key={rec.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{String(rec.job?.title ?? "Job")}</h3>
                          <p className="text-sm text-muted-foreground">{String(rec.job?.company ?? "")}</p>
                        </div>
                        <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                      </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(rec.matchScore)}`}>
                      {Math.round(rec.matchScore * 100)}%
                    </span>
                    <span className="text-sm text-muted-foreground">match</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-xs"
                      onClick={() => handleSave(rec.id)}
                      disabled={saveMutation.isPending}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs"
                      onClick={() => handleDismiss(rec.id)}
                      disabled={dismissMutation.isPending}
                    >
                      <X className="h-3.5 w-3.5" /> Dismiss
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!error && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">All Recommendations</h2>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                    <Skeleton className="mt-4 h-8 w-20" />
                  </Card>
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No recommendations yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete your profile and upload a resume to get personalized recommendations.
                </p>
                <Button className="mt-4" onClick={handleRefresh} disabled={refreshMutation.isPending}>
                  {refreshMutation.isPending ? "Generating..." : "Generate Recommendations"}
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{String(rec.job?.title ?? "Job")}</h3>
                        <p className="text-sm text-muted-foreground">{String(rec.job?.company ?? "")}</p>
                      </div>
                      <Badge className={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getScoreColor(rec.matchScore)}`}>
                        {Math.round(rec.matchScore * 100)}%
                      </span>
                      <span className="text-sm text-muted-foreground">match</span>
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                      <span>Skills: {Math.round(rec.skillMatch * 100)}%</span>
                      <span>Keywords: {Math.round(rec.keywordMatch * 100)}%</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs"
                        onClick={() => handleSave(rec.id)}
                        disabled={saveMutation.isPending}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1 text-xs"
                        onClick={() => handleDismiss(rec.id)}
                        disabled={dismissMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5" /> Dismiss
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
