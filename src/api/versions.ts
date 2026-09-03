import { request } from "../utils/request";
import { API_ENDPOINTS } from "../constants/api";
import type {
  ResumeVersion,
  CreateVersionRequest,
  UpdateVersionRequest,
  VersionDiff,
} from "../types/version";

export type ApplyVersionOperationRequest = {
  operation: "replace" | "insert" | "delete";
  section: string;
  target_id?: string;
  replacement?: Record<string, unknown>;
  reason?: string;
  source?: string;
  child_id?: string;
  child_text?: string;
};

export const versionsApi = {
  list: async (resumeId: string): Promise<{ versions: ResumeVersion[] }> => {
    const res = await request<any>({ method: "GET", path: API_ENDPOINTS.VERSIONS.LIST(resumeId) });
    const list = res?.data ?? res?.versions ?? (Array.isArray(res) ? res : []);
    return { versions: Array.isArray(list) ? list : [] };
  },

  get: async (versionId: string): Promise<{ version: ResumeVersion }> => {
    const res = await request<any>({ method: "GET", path: API_ENDPOINTS.VERSIONS.GET(versionId) });
    return { version: res?.data ?? res?.version ?? res };
  },

  create: async (resumeId: string, data: CreateVersionRequest): Promise<{ version: ResumeVersion }> => {
    const res = await request<any>({ method: "POST", path: API_ENDPOINTS.VERSIONS.CREATE(resumeId), body: data });
    return { version: res?.data ?? res?.version ?? res };
  },

  update: async (versionId: string, data: UpdateVersionRequest): Promise<{ version: ResumeVersion }> => {
    const res = await request<any>({ method: "PATCH", path: API_ENDPOINTS.VERSIONS.UPDATE(versionId), body: data });
    return { version: res?.data ?? res?.version ?? res };
  },

  delete: async (versionId: string): Promise<{ deleted: boolean }> => {
    const res = await request<any>({ method: "DELETE", path: API_ENDPOINTS.VERSIONS.DELETE(versionId) });
    return { deleted: res?.data?.deleted ?? res?.deleted ?? true };
  },

  duplicate: async (versionId: string, newName?: string): Promise<{ version: ResumeVersion }> => {
    const res = await request<any>({
      method: "POST",
      path: API_ENDPOINTS.VERSIONS.DUPLICATE(versionId),
      body: { version_name: newName },
    });
    return { version: res?.data ?? res?.version ?? res };
  },

  setMaster: async (versionId: string): Promise<{ version: ResumeVersion }> => {
    const res = await request<any>({ method: "POST", path: API_ENDPOINTS.VERSIONS.SET_MASTER(versionId) });
    return { version: res?.data ?? res?.version ?? res };
  },

  diff: async (versionId: string): Promise<{ diff: VersionDiff }> => {
    const res = await request<any>({ method: "GET", path: API_ENDPOINTS.VERSIONS.DIFF(versionId) });
    return { diff: res?.data ?? res?.diff ?? res };
  },

  applyOperation: async (
    versionId: string,
    data: ApplyVersionOperationRequest,
  ): Promise<{ version: ResumeVersion }> => {
    const res = await request<any>({
      method: "POST",
      path: `/api/resumes/versions/${versionId}/apply-operation`,
      body: data,
    });
    return { version: res?.data ?? res?.version ?? res };
  },
};
