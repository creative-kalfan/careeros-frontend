export type ApplicationStatus =
  | "not_applied"
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type WorkMode = "Remote" | "Hybrid" | "On-site";

// Rich UI-facing job shape consumed by the Jobs module components.
// It is produced by adapting the backend NormalizedJob DTO (see src/lib/jobs.ts).
export type Job = {
  id: string;
  role: string;
  company: string;
  companyLogo: string; // derived initial fallback
  companyBrand: string; // deterministic gradient token
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  experience: string;
  education?: string;
  salaryMin: number; // in thousands
  salaryMax: number; // in thousands
  salaryCurrency: string;
  aiMatch: number;
  atsMatch: number;
  postedAt: string; // human label
  postedDaysAgo: number;
  quickApply: boolean;
  bookmarked: boolean;
  status: ApplicationStatus;
  techStack: string[];
  overview: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  recruiterNote?: string;
  matchedSkills: string[];
  missingSkills: string[];
  seniority: string;
  interviewProbability: number;
  keywordCompare: { keyword: string; inResume: boolean; inJob: boolean }[];
  marketSalary: { min: number; median: number; max: number };
  match?: {
    overall: number;
    skillMatch: number;
    resumeMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
    companyPreference: number;
    freshness: number;
    missingSkills: string[];
  };
  atsScore?: number;
  atsSkillMatch?: number;
  atsKeywordMatch?: number;
  atsMissingSkills?: string[];
  atsMissingKeywords?: string[];
  atsRecommendations?: string[];
  // New classification fields (migration 011)
  roleCategory?: string | null;
  applicationDeadline?: string | null;
};

// ---------------------------------------------------------------------------
// Backend DTOs (mirror of careeros-backend/types/job.ts)
// ---------------------------------------------------------------------------

export type NormalizedJob = {
  id?: string;
  externalJobId?: string | null;
  title: string;
  companyName: string;
  location?: string | null;
  employmentType?: string | null;
  experienceLevel?: string | null;
  salary?: string | null;
  currency?: string | null;
  description?: string | null;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  department?: string | null;
  remote?: boolean | null;
  applyUrl?: string | null;
  sourcePlatform?: string | null;
  postedDate?: string | null;
  expiresDate?: string | null;
  status?: string | null;
  lastSynced?: string | null;
  createdAt?: string;
  // New classification columns (migration 011)
  roleCategory?: string | null;
  applicationDeadline?: string | null;
  isActive?: boolean | null;
};

export type JobSearchFilters = {
  role?: string;
  location?: string;
  company?: string;
  roleCategory?: string;
  skills?: string[];
  experience?: string;
  remote?: boolean;
  employmentType?: string;
  sort?: "newest" | "oldest" | "best-match";
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
};

export type JobSearchResult = {
  jobs: NormalizedJob[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  nextCursor?: string | null;
};

export type JobMatchResult = {
  matchScore: number;
  skillMatchScore: number;
  keywordMatchScore: number;
  semanticSimilarityScore: number;
  missingSkills: string[];
  missingKeywords: string[];
  recommendations: string[];
};

export type SavedJobRecord = {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  jobs: NormalizedJob | NormalizedJob[] | null;
};

export type JobMatchResponse = {
  job: NormalizedJob;
  match: JobMatchResult;
};

export type JobSearchResponse = {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasMore: boolean;
};