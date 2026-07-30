import { request } from "../utils/request";
import { apiConfig } from "./config";
import { API_ENDPOINTS } from "../constants/api";
import { ApiClientError } from "../utils/api-error";
import { adaptResumeListRecord, buildResumeData } from "../lib/resume";
import type {
  ResumeData,
  ResumeListResponse,
  ResumeRecord,
  UploadResumeResponse,
  ParseResumeResponse,
} from "../types/resume";

// Backend response envelope: { success, data, meta? }
type BackendResponse<T> = {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export type ResumeApi = {
  getAll: () => Promise<ResumeListResponse>;
  getById: (id: string) => Promise<ResumeData>;
  create: (title: string) => Promise<ResumeData>;
  update: (id: string, data: { title?: string; content?: Record<string, unknown> }) => Promise<ResumeData>;
  delete: (id: string) => Promise<void>;
  upload: (file: File, title?: string, skipParse?: boolean) => Promise<UploadResumeResponse>;
  parse: (id: string) => Promise<ParseResumeResponse>;
};

export const resumeApi: ResumeApi = {
  getAll: async () => {
    const res = await request<BackendResponse<ResumeRecord[]>>({
      method: "GET",
      path: API_ENDPOINTS.RESUME.LIST,
    });
    const records = res.data ?? [];
    const resumes = records.map(adaptResumeListRecord);
    return {
      resumes,
      total: resumes.length,
      page: 1,
      pageSize: resumes.length || 20,
      totalPages: 1,
    };
  },

  getById: async (id: string) => {
    const res = await request<BackendResponse<ResumeRecord>>({
      method: "GET",
      path: API_ENDPOINTS.RESUME.GET(id),
    });
    return buildResumeData(res.data, res.data.content);
  },

  create: async (title: string) => {
    const res = await request<BackendResponse<ResumeRecord>>({
      method: "POST",
      path: API_ENDPOINTS.RESUME.CREATE,
      body: { title },
    });
    return buildResumeData(res.data, res.data.content);
  },

  update: async (id: string, data: { title?: string; content?: Record<string, unknown> }) => {
    const res = await request<BackendResponse<ResumeRecord>>({
      method: "PATCH",
      path: API_ENDPOINTS.RESUME.UPDATE(id),
      body: data,
    });
    return buildResumeData(res.data, res.data.content);
  },

  delete: async (id: string) => {
    await request<BackendResponse<void>>({
      method: "DELETE",
      path: API_ENDPOINTS.RESUME.DELETE(id),
    });
  },

  upload: async (file: File, title?: string, skipParse = false) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    formData.append("skipParse", String(skipParse));

    const url = `${apiConfig.baseUrl}${API_ENDPOINTS.RESUME.UPLOAD}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: { message: string; statusCode: number; code?: string };
        try {
          const body = await response.json();
          errorData = {
            message: body?.error?.message ?? body?.message ?? "Upload failed",
            statusCode: response.status,
            code: body?.error?.code,
          };
        } catch {
          errorData = {
            message: response.statusText || "Upload failed",
            statusCode: response.status,
          };
        }
        throw new ApiClientError(errorData);
      }

      const body = await response.json();
      return {
        resume: body.data,
        parse: (body.data as unknown as { parse: UploadResumeResponse["parse"] }).parse ?? null,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError({
        message: error instanceof Error ? error.message : "Upload failed",
        statusCode: 0,
        code: "NETWORK_ERROR",
      });
    }
  },

  parse: async (id: string) => {
    const res = await request<BackendResponse<ParseResumeResponse>>({
      method: "POST",
      path: API_ENDPOINTS.RESUME.PARSE(id),
    });
    return res.data;
  },
};