import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "../../api/applications";
import { transformApplication, transformApplications, computeStats } from "../../lib/applications";
import type { ApplicationUI, StatsUI } from "../../lib/applications";
import type { CreateApplicationRequest, ApplicationStatus } from "../../types/application";

export const applicationQueryKeys = {
  all: ["applications"] as const,
  list: ["applications", "list"] as const,
  detail: (id: string) => ["applications", "detail", id] as const,
  stats: ["applications", "stats"] as const,
};

/**
 * Hook to fetch all applications.
 * Returns transformed UI-ready application data.
 */
export function useApplications() {
  return useQuery({
    queryKey: applicationQueryKeys.list,
    queryFn: async () => {
      const response = await applicationsApi.getAll();
      return transformApplications(response.applications);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch application stats.
 */
export function useApplicationStats() {
  const query = useApplications();

  return useQuery<StatsUI>({
    queryKey: applicationQueryKeys.stats,
    queryFn: () => {
      // Compute stats from the list query cache if available
      const apps = query.data ?? [];
      return computeStats(apps);
    },
    enabled: query.isSuccess,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch a single application by ID.
 */
export function useApplication(id: string | null) {
  return useQuery({
    queryKey: applicationQueryKeys.detail(id ?? ""),
    queryFn: async () => {
      const app = await applicationsApi.getById(id as string);
      return transformApplication(app);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new application.
 */
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation<ApplicationUI, Error, CreateApplicationRequest>({
    mutationFn: async (data) => {
      const app = await applicationsApi.create(data);
      return transformApplication(app);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.stats });
    },
  });
}

/**
 * Hook to update application status.
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; status: ApplicationStatus }>({
    mutationFn: ({ id, status }) => applicationsApi.updateStatus({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.stats });
    },
  });
}

/**
 * Hook to delete an application with optimistic removal.
 */
export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previous?: ApplicationUI[] }>({
    mutationFn: (id: string) => applicationsApi.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: applicationQueryKeys.list });
      const previous = queryClient.getQueryData<ApplicationUI[]>(applicationQueryKeys.list);
      if (previous) {
        queryClient.setQueryData<ApplicationUI[]>(
          applicationQueryKeys.list,
          previous.filter((app) => app.id !== id),
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(applicationQueryKeys.list, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.stats });
    },
  });
}