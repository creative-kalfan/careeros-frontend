import { useMutation } from "@tanstack/react-query";
import { jobsApi } from "../../api/jobs";
import type { JobMatchResponse, NormalizedJob } from "../../types/jobs";

export function useMatchJobs() {
  const mutation = useMutation<JobMatchResponse, Error, { resumeText: string; job: NormalizedJob }>(
    {
      mutationFn: ({ resumeText, job }) => jobsApi.matchJobs({ resumeText, job }),
    },
  );

  return {
    matchJob: mutation.mutate,
    matchJobAsync: mutation.mutateAsync,
    matchResult: mutation.data,
    isMatching: mutation.isPending,
    matchError: mutation.error,
  };
}
