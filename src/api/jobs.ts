import { request } from "../utils/request";
import { API_ENDPOINTS } from "../constants/api";
import { adaptJob } from "../lib/jobs";
import type {
  Job,
  JobMatchResponse,
  JobSearchFilters,
  JobSearchResponse,
  NormalizedJob,
  SavedJobRecord,
} from "../types/jobs";

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export type JobsApi = {
  getJobs: (params?: JobSearchFilters) => Promise<JobSearchResponse>;
  searchJobs: (params?: JobSearchFilters) => Promise<JobSearchResponse>;
  getPersonalizedJobs: (
    params?: JobSearchFilters & { includeAts?: boolean },
  ) => Promise<JobSearchResponse>;
  getJob: (id: string) => Promise<Job>;
  saveJob: (jobId: string) => Promise<{ savedJob: SavedJobRecord }>;
  unsaveJob: (jobId: string) => Promise<void>;
  getSavedJobs: () => Promise<Job[]>;
  matchJobs: (params: { resumeText: string; job: NormalizedJob }) => Promise<JobMatchResponse>;
};

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

function toQueryString(params: JobSearchFilters): string {
  const sp = new URLSearchParams();
  if (params.role) sp.set("role", params.role);
  if (params.location) sp.set("location", params.location);
  if (params.company) sp.set("company", params.company);
  if (params.skills?.length) sp.set("skills", params.skills.join(","));
  if (params.experience) sp.set("experience", params.experience);
  if (params.remote !== undefined) sp.set("remote", String(params.remote));
  if (params.employmentType) sp.set("employmentType", params.employmentType);
  if (params.sort) sp.set("sort", params.sort);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function mapSearchResult(
  jobs: NormalizedJob[],
  meta?: BackendResponse<unknown>["meta"],
): JobSearchResponse {
  const totalPages = meta?.totalPages ?? 1;
  return {
    jobs: jobs.map((raw) => adaptJob(raw)),
    total: meta?.total ?? 0,
    page: meta?.page ?? 1,
    pageSize: meta?.pageSize ?? 20,
    totalPages,
    hasNext: meta?.hasNext ?? false,
    hasMore: meta?.hasNext ?? false,
  };
}

export const jobsApi: JobsApi = {
  getJobs: async (params?: JobSearchFilters) => {
    const res = await request<BackendResponse<NormalizedJob[]>>({
      method: "GET",
      path: `${API_ENDPOINTS.JOBS.LIST}${toQueryString(params ?? {})}`,
    });
    return mapSearchResult(res.data, res.meta);
  },

  searchJobs: async (params?: JobSearchFilters) => {
    const res = await request<BackendResponse<NormalizedJob[]>>({
      method: "POST",
      path: API_ENDPOINTS.JOBS.SEARCH,
      body: params ?? {},
    });
    return mapSearchResult(res.data, res.meta);
  },

  getJob: async (id: string) => {
    const res = await request<BackendResponse<{ job: NormalizedJob }>>({
      method: "GET",
      path: API_ENDPOINTS.JOBS.GET(id),
    });
    return adaptJob(res.data.job);
  },

  saveJob: async (jobId: string) => {
    const res = await request<BackendResponse<{ savedJob: SavedJobRecord }>>({
      method: "POST",
      path: API_ENDPOINTS.JOBS.SAVE,
      body: { jobId },
    });
    return res.data;
  },

  unsaveJob: async (jobId: string) => {
    await request<BackendResponse<void>>({
      method: "DELETE",
      path: API_ENDPOINTS.JOBS.UNSAVE(jobId),
    });
  },

  getSavedJobs: async () => {
    const res = await request<BackendResponse<{ savedJobs: SavedJobRecord[] }>>({
      method: "GET",
      path: API_ENDPOINTS.JOBS.SAVED,
    });
    return res.data.savedJobs
      .map((record) => {
        const raw = Array.isArray(record.jobs) ? record.jobs[0] : record.jobs;
        if (!raw) return null;
        return adaptJob(raw, { bookmarked: true });
      })
      .filter((job): job is Job => job !== null);
  },

  matchJobs: async ({ resumeText, job }) => {
    const res = await request<BackendResponse<JobMatchResponse>>({
      method: "POST",
      path: API_ENDPOINTS.JOBS.MATCH,
      body: { resumeText, job },
    });
    return res.data;
  },

  getPersonalizedJobs: async (params?: JobSearchFilters & { includeAts?: boolean }) => {
    const qs = toQueryString(params ?? {});
    const sp = new URLSearchParams(qs.replace(/^\?/, ""));
    if (params?.includeAts) sp.set("includeAts", "true");
    const finalQs = sp.toString();
    // The personalized endpoint now returns the standard { success, data, meta }
    // envelope — same as getJobs() and searchJobs(). adaptJob() preserves the
    // optional match/ATS score fields from the raw job objects.
    const res = await request<BackendResponse<NormalizedJob[]>>({
      method: "GET",
      path: `${API_ENDPOINTS.JOBS.PERSONALIZED}${finalQs ? `?${finalQs}` : ""}`,
    });
    return mapSearchResult(res.data, res.meta);
  },
};
