import { apiConfig } from "./config";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "../types/api/index.ts";

export type CopilotMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata: Record<string, unknown>;
};

export type CopilotSession = {
  id: string;
  userId: string;
  context: "resume" | "ats" | "jobs" | "applications" | "general";
  messages: CopilotMessage[];
  createdAt: string;
  updatedAt: string;
};

export type SendMessageRequest = {
  sessionId?: string;
  context: CopilotSession["context"];
  message: string;
  metadata?: Record<string, unknown>;
};

export type CopilotApi = {
  sendMessage: (data: SendMessageRequest) => Promise<ApiResponse<CopilotMessage>>;
  getSession: (id: string) => Promise<ApiResponse<CopilotSession>>;
  getSessions: (
    params?: PaginationParams,
  ) => Promise<ApiResponse<PaginatedResponse<CopilotSession>>>;
  deleteSession: (id: string) => Promise<ApiResponse<void>>;
};

export const copilotApi: CopilotApi = {
  sendMessage: async (data: SendMessageRequest) => {
    // TODO: Implement API call
    throw new Error("Not implemented");
  },

  getSession: async (id: string) => {
    // TODO: Implement API call
    throw new Error("Not implemented");
  },

  getSessions: async (params?: PaginationParams) => {
    // TODO: Implement API call
    throw new Error("Not implemented");
  },

  deleteSession: async (id: string) => {
    // TODO: Implement API call
    throw new Error("Not implemented");
  },
};
