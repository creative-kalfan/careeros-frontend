// Feature-specific API hooks
export { useJobs, useJob, jobsQueryKeys } from "./useJobs";
export { useSearchJobs } from "./useSearchJobs";
export { useSaveJob } from "./useSaveJob";
export { useMatchJobs } from "./useMatchJobs";
export { useSavedJobs } from "./useSavedJobs";
export {
  useResumes,
  useResume,
  useCreateResume,
  useUpdateResume,
  useDeleteResume,
  useParseResume,
  useUploadResume,
  resumeQueryKeys,
} from "./useResumes";

export {
  useAnalyzeResume,
  useOptimizationSuggestions,
  useRecalculateATS,
  useAcceptSuggestion,
  atsQueryKeys,
} from "./useATS";

export {
  useApplications,
  useApplication,
  useApplicationStats,
  useCreateApplication,
  useUpdateApplicationStatus,
  useDeleteApplication,
  applicationQueryKeys,
} from "./useApplications";

export {
  useNotifications,
  useUnreadNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  NOTIFICATIONS_QUERY_KEY,
  NOTIFICATIONS_UNREAD_KEY,
  NOTIFICATIONS_PREFERENCES_KEY,
} from "./useNotifications";
