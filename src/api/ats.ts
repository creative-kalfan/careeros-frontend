import { request } from "../utils/request";
import { apiConfig } from "./config";
import { API_ENDPOINTS } from "../constants/api";
import { ApiClientError } from "../utils/api-error";
import type { ResumeContent } from "../types/resume";

export type AtsAnalysisResult = {
  atsScore: number;
  skillMatchScore: number;
  keywordMatchScore: number;
  semanticSimilarityScore: number;
  missingSkills: string[];
  missingKeywords: string[];
  recommendations: string[];
  matchedKeywords: string[];
  matchedSkills: string[];
  engineVersion?: string;
  extractedKeywords?: string[];
  extractedSkills?: string[];
};

export type AtsReport = {
  id: string;
  resumeId: string;
  jobDescription: string;
  atsScore: number;
  skillMatchScore: number;
  keywordMatchScore: number;
  semanticSimilarityScore: number;
  missingSkills: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  matchedKeywords: string[];
  recommendations: string[];
  engineVersion: string;
  createdAt: string;
};

export type AnalyzeResumeResponse = {
  result: AtsAnalysisResult;
  report?: AtsReport;
};

export type OptimizationSuggestion = {
  id: string;
  category: "skills" | "summary" | "experience" | "projects" | "education";
  kind: "add_skill" | "summary_rewrite" | "keyword_in_summary" | "experience_bullet" | "project_enhancement" | "education_detail";
  title: string;
  description: string;
  preview: string;
  status: "pending" | "accepted" | "rejected";
  payload: Record<string, unknown>;
};

export type OptimizationSuggestionsResponse = {
  suggestions: OptimizationSuggestion[];
  reportId: string;
  baselineScores: {
    atsScore: number;
    keywordMatchScore: number;
    skillMatchScore: number;
    semanticSimilarityScore: number;
  };
};

export type RecalculateAtsResponse = {
  previous: {
    atsScore: number;
    skillMatchScore: number;
    keywordMatchScore: number;
    semanticSimilarityScore: number;
  };
  current: {
    atsScore: number;
    skillMatchScore: number;
    keywordMatchScore: number;
    semanticSimilarityScore: number;
    reportId: string;
  };
  delta: {
    atsScore: number;
    skillMatchScore: number;
    keywordMatchScore: number;
    semanticSimilarityScore: number;
  };
};

export type AtsApi = {
  analyze: (data: {
    resumeId: string;
    jobDescription: string;
    persist?: boolean;
  }) => Promise<AnalyzeResumeResponse>;

  getSuggestions: (data: {
    resumeId: string;
    content: ResumeContent;
    reportId?: string;
  }) => Promise<OptimizationSuggestionsResponse>;

  recalculate: (data: {
    resumeId: string;
    content: ResumeContent;
    jobDescription?: string;
  }) => Promise<RecalculateAtsResponse>;

  acceptSuggestion: (data: {
    resumeId: string;
    suggestion: OptimizationSuggestion;
    content: ResumeContent;
  }) => Promise<{
    content: ResumeContent;
    versionId: string;
    versionName: string;
    suggestionId: string;
  }>;
};

export const atsApi: AtsApi = {
  analyze: async ({ resumeId, jobDescription, persist = true }) => {
    const res = await request<AnalyzeResumeResponse>({
      method: "POST",
      path: API_ENDPOINTS.ATS.ANALYZE,
      body: { resumeId, jobDescription, persist },
    });
    return res;
  },

  getSuggestions: async ({ resumeId, content, reportId }) => {
    const res = await request<OptimizationSuggestionsResponse>({
      method: "POST",
      path: `/optimizer/${resumeId}/suggestions`,
      body: { content, reportId },
    });
    return res;
  },

  recalculate: async ({ resumeId, content, jobDescription }) => {
    const res = await request<RecalculateAtsResponse>({
      method: "POST",
      path: `/optimizer/${resumeId}/recalculate-ats`,
      body: { content, jobDescription },
    });
    return res;
  },

  acceptSuggestion: async ({ resumeId, suggestion, content }) => {
    const res = await request<{
      content: ResumeContent;
      versionId: string;
      versionName: string;
      suggestionId: string;
    }>({
      method: "POST",
      path: `/optimizer/${resumeId}/accept`,
      body: { suggestion, content },
    });
    return res;
  },
};
