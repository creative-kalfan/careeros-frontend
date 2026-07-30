import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atsApi } from "../../api/ats";
import type { OptimizationSuggestion } from "../../api/ats";
import type { ResumeContent } from "../../types/resume";

export const atsQueryKeys = {
  all: ["ats"] as const,
  suggestions: (resumeId: string, reportId?: string) =>
    ["ats", "suggestions", resumeId, reportId] as const,
};

export function useAnalyzeResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { resumeId: string; jobDescription: string; persist?: boolean }) =>
      atsApi.analyze(data),
    onSuccess: (data, variables) => {
      if (data.report) {
        queryClient.setQueryData(
          atsQueryKeys.suggestions(variables.resumeId, data.report.id),
          { suggestions: [], reportId: data.report.id, baselineScores: { atsScore: data.report.atsScore, keywordMatchScore: data.report.keywordMatchScore, skillMatchScore: data.report.skillMatchScore, semanticSimilarityScore: data.report.semanticSimilarityScore } }
        );
      }
    },
  });
}

export function useOptimizationSuggestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      resumeId: string;
      content: ResumeContent;
      reportId?: string;
    }) => atsApi.getSuggestions(data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        atsQueryKeys.suggestions(variables.resumeId, variables.reportId),
        data
      );
    },
  });
}

export function useRecalculateATS() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      resumeId: string;
      content: ResumeContent;
      jobDescription?: string;
    }) => atsApi.recalculate(data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(atsQueryKeys.suggestions(variables.resumeId, data.current.reportId), {
        suggestions: [],
        reportId: data.current.reportId,
        baselineScores: { atsScore: data.current.atsScore, keywordMatchScore: data.current.keywordMatchScore, skillMatchScore: data.current.skillMatchScore, semanticSimilarityScore: data.current.semanticSimilarityScore },
      });
    },
  });
}

export function useAcceptSuggestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      resumeId: string;
      suggestion: OptimizationSuggestion;
      content: ResumeContent;
    }) => atsApi.acceptSuggestion(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: atsQueryKeys.suggestions(variables.resumeId) });
    },
  });
}
