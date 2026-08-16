import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { jobsApi } from "../../api/jobs";
import type { Job, JobSearchFilters, JobSearchResponse } from "../../types/jobs";
import { useAuth } from "../../auth/useAuth";

export const jobsQueryKeys = {
  all: ["jobs"] as const,
  list: (filters: JobSearchFilters) => ["jobs", "list", filters] as const,
  personalized: (filters: JobSearchFilters & { includeAts?: boolean }) => ["jobs", "personalized", filters] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
  saved: ["jobs", "saved"] as const,
};

export function useJobs(filters: JobSearchFilters = {}) {
  return useQuery<JobSearchResponse>({
    queryKey: jobsQueryKeys.list(filters),
    queryFn: () => jobsApi.getJobs(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePersonalizedJobs(filters: JobSearchFilters & { includeAts?: boolean } = {}) {
  const { isAuthenticated, isInitialized } = useAuth();

  return useQuery<JobSearchResponse>({
    queryKey: jobsQueryKeys.personalized(filters),
    queryFn: () => jobsApi.getPersonalizedJobs(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    enabled: isInitialized && isAuthenticated,
  });
}

export function useJob(id: string | null) {
  return useQuery<Job>({
    queryKey: jobsQueryKeys.detail(id ?? ""),
    queryFn: () => jobsApi.getJob(id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}
