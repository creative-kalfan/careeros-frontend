import { request } from "../utils/request";
import { API_ENDPOINTS } from "../constants/api";
import type {
  Application,
  ApplicationListResponse,
  ApplicationStats,
  CreateApplicationRequest,
  UpdateApplicationStatusRequest,
} from "../types/application";

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export type ApplicationsApi = {
  getAll: () => Promise<ApplicationListResponse>;
  getById: (id: string) => Promise<Application>;
  create: (data: CreateApplicationRequest) => Promise<Application>;
  updateStatus: (data: UpdateApplicationStatusRequest) => Promise<void>;
  delete: (id: string) => Promise<void>;
  getStats: () => Promise<ApplicationStats>;
};

// Backend response envelope: { success, data, meta? }
type BackendResponse<T> = {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
};

export const applicationsApi: ApplicationsApi = {
  getAll: async () => {
    const res = await request<BackendResponse<Application[]>>({
      method: "GET",
      path: API_ENDPOINTS.APPLICATIONS.LIST,
    });
    return {
      applications: res.data,
      total: res.meta?.total ?? res.data.length,
    };
  },

  getById: async (id: string) => {
    const res = await request<BackendResponse<Application>>({
      method: "GET",
      path: API_ENDPOINTS.APPLICATIONS.GET(id),
    });
    return res.data;
  },

  create: async (data: CreateApplicationRequest) => {
    const res = await request<BackendResponse<Application>>({
      method: "POST",
      path: API_ENDPOINTS.APPLICATIONS.CREATE,
      body: data,
    });
    return res.data;
  },

  updateStatus: async ({ id, status }: UpdateApplicationStatusRequest) => {
    await request<BackendResponse<void>>({
      method: "PATCH",
      path: API_ENDPOINTS.APPLICATIONS.UPDATE(id),
      body: { status },
    });
  },

  delete: async (id: string) => {
    await request<BackendResponse<void>>({
      method: "DELETE",
      path: API_ENDPOINTS.APPLICATIONS.DELETE(id),
    });
  },

  getStats: async () => {
    const res = await request<BackendResponse<ApplicationStats>>({
      method: "GET",
      path: API_ENDPOINTS.APPLICATIONS.STATS,
    });
    return res.data;
  },
};
