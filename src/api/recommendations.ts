import { apiConfig } from "./config";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../types/api/index.ts";

export type RecommendationPriority = "excellent" | "strong" | "good" | "possible";

export type RecommendationStatus = "NEW" | "VIEWED" | "SAVED" | "DISMISSED" | "APPLIED";

export interface RecommendationReason {
  type: string;
  message: string;
  weight: number;
  evidence?: string | null;
}

export interface Recommendation {
  id: string;
  jobId: string;
  resumeId: string;
  matchScore: number;
  skillMatch: number;
  keywordMatch: number;
  semanticSimilarity: number;
  recommendationReason: RecommendationReason[];
  priority: RecommendationPriority;
  status: RecommendationStatus;
  createdAt: string;
  job?: Record<string, unknown> | null;
}

export interface RecommendationListParams {
  status?: RecommendationStatus;
  sort?: "newest" | "highest-score";
  remote?: boolean;
  saved?: boolean;
  applied?: boolean;
  dismissed?: boolean;
  topMatches?: boolean;
  minScore?: number;
  priority?: RecommendationPriority;
  limit?: number;
}

export interface RecommendationsApi {
  getRecommendations: (params?: RecommendationListParams) => Promise<ApiResponse<{ recommendations: Recommendation[] }>>;
  getTopRecommendations: (limit?: number) => Promise<ApiResponse<{ recommendations: Recommendation[] }>>;
  refreshRecommendations: () => Promise<ApiResponse<{ result: unknown }>>;
  saveRecommendation: (id: string) => Promise<ApiResponse<{ recommendation: Recommendation }>>;
  dismissRecommendation: (id: string) => Promise<ApiResponse<{ recommendation: Recommendation }>>;
}

export const recommendationsApi: RecommendationsApi = {
  getRecommendations: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.status) searchParams.set("status", params.status);
    if (params.sort) searchParams.set("sort", params.sort);
    if (params.remote !== undefined) searchParams.set("remote", String(params.remote));
    if (params.saved !== undefined) searchParams.set("saved", String(params.saved));
    if (params.applied !== undefined) searchParams.set("applied", String(params.applied));
    if (params.dismissed !== undefined) searchParams.set("dismissed", String(params.dismissed));
    if (params.topMatches !== undefined) searchParams.set("topMatches", String(params.topMatches));
    if (params.minScore !== undefined) searchParams.set("minScore", String(params.minScore));
    if (params.priority) searchParams.set("priority", params.priority);
    if (params.limit) searchParams.set("limit", String(params.limit));

    const response = await fetch(`${apiConfig.baseUrl}/recommendations?${searchParams.toString()}`, {
      method: "GET",
      headers: apiConfig.defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch recommendations");
    }

    return response.json();
  },

  getTopRecommendations: async (limit = 5) => {
    const response = await fetch(`${apiConfig.baseUrl}/recommendations/top?limit=${limit}`, {
      method: "GET",
      headers: apiConfig.defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch top recommendations");
    }

    return response.json();
  },

  refreshRecommendations: async () => {
    const response = await fetch(`${apiConfig.baseUrl}/recommendations/refresh`, {
      method: "POST",
      headers: apiConfig.defaultHeaders,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to refresh recommendations");
    }

    return response.json();
  },

  saveRecommendation: async (id: string) => {
    const response = await fetch(`${apiConfig.baseUrl}/recommendations/save`, {
      method: "POST",
      headers: {
        ...apiConfig.defaultHeaders,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ recommendationId: id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to save recommendation");
    }

    return response.json();
  },

  dismissRecommendation: async (id: string) => {
    const response = await fetch(`${apiConfig.baseUrl}/recommendations/dismiss`, {
      method: "POST",
      headers: {
        ...apiConfig.defaultHeaders,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ recommendationId: id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to dismiss recommendation");
    }

    return response.json();
  },
};