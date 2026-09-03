import { apiConfig } from "./config";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../types/api/index.ts";

export type DashboardStats = {
  totalResumes: number;
  totalApplications: number;
  totalSavedJobs: number;
  atsAnalysesCount: number;
  profileCompletion: number;
};

export type ActivityItem = {
  id: string;
  type:
    "resume_created" | "application_submitted" | "ats_analysis" | "job_saved" | "recommendation";
  title: string;
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
};

export type DashboardApi = {
  getStats: () => Promise<ApiResponse<DashboardStats>>;
  getRecentActivity: (
    params?: PaginationParams,
  ) => Promise<ApiResponse<PaginatedResponse<ActivityItem>>>;
  getWeeklyProgress: () => Promise<
    ApiResponse<{
      applicationsSubmitted: number[];
      atsScores: number[];
      labels: string[];
    }>
  >;
};

export const dashboardApi: DashboardApi = {
  getStats: async () => {
    // TODO: Implement API call
    throw new Error("Not implemented");
  },

  getRecentActivity: async (params?: PaginationParams) => {
    // TODO: Implement API call
    throw new Error("Not implemented");
  },

  getWeeklyProgress: async () => {
    // TODO: Implement API call
    throw new Error("Not implemented");
  },
};
