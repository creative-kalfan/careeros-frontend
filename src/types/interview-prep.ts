// Types for the Interview Preparation domain
// Aligned with the backend interview prep service (sql/migrations/019_interview_prep.sql)

export type InterviewPrepCategory =
  | "behavioral"
  | "technical"
  | "role_specific"
  | "resume_deep_dive"
  | "situational"
  | "company_context";

export type InterviewPrepDifficulty = "foundational" | "intermediate" | "advanced";

export type InterviewPrepStatus = "generating" | "ready" | "failed";

export type InterviewType =
  "technical" | "behavioral" | "hiring_manager" | "recruiter" | "assessment" | "general";

export interface AnswerFramework {
  type: string;
  steps: string[];
  guidance: string;
}

export interface InterviewPrepQuestion {
  id: string;
  session_id: string;
  category: InterviewPrepCategory;
  question: string;
  difficulty: InterviewPrepDifficulty;
  rationale: string | null;
  resume_evidence: string[];
  talking_points: string[];
  answer_framework: AnswerFramework;
  star_guidance: string | null;
  expected_signals: string[];
  related_jd_requirements: string[];
  gaps: string[];
  question_order: number;
  is_prepared: boolean;
  is_bookmarked: boolean;
  created_at?: string;
}

export interface InterviewPrepSession {
  id: string;
  user_id: string;
  application_id: string;
  interview_id: string | null;
  job_id: string | null;
  status: InterviewPrepStatus;
  interview_type: InterviewType;
  interview_name: string | null;
  source_resume_id: string | null;
  source_fingerprint: string | null;
  source_metadata: {
    job_title?: string;
    company_name?: string;
    interview_name?: string;
    scheduled_at?: string;
    gaps?: string[];
    assumption_note?: string;
    assumed_type?: boolean;
    question_count_requested?: number;
  };
  question_count: number;
  prepared_count: number;
  version: number;
  error: string | null;
  generated_at: string | null;
  created_at?: string;
  updated_at?: string;
  // Derived by the backend service
  questions?: InterviewPrepQuestion[];
  prepared_total?: number;
  bookmarked_total?: number;
  remaining?: number;
  by_category?: Partial<Record<InterviewPrepCategory, number>>;
  is_stale?: boolean;
  stale_reason?: string | null;
}

export interface GeneratePrepRequest {
  application_id: string;
  interview_id?: string;
  resume_id?: string;
  job_id?: string;
  question_count?: number;
  async_mode?: boolean;
}

export interface InterviewPrepListResponse {
  sessions: InterviewPrepSession[];
  total: number;
}

export const INTERVIEW_PREP_CATEGORIES: {
  id: InterviewPrepCategory;
  label: string;
  tone: string;
}[] = [
  { id: "behavioral", label: "Behavioral", tone: "text-accent bg-accent/10 ring-accent/25" },
  { id: "technical", label: "Technical", tone: "text-primary bg-primary/10 ring-primary/20" },
  {
    id: "role_specific",
    label: "Role-specific",
    tone: "text-warning bg-warning/10 ring-warning/25",
  },
  {
    id: "resume_deep_dive",
    label: "Resume deep-dive",
    tone: "text-success bg-success/10 ring-success/20",
  },
  { id: "situational", label: "Situational", tone: "text-accent bg-accent/10 ring-accent/25" },
  {
    id: "company_context",
    label: "Company & context",
    tone: "text-muted-foreground bg-muted/50 ring-border/60",
  },
];

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  technical: "Technical",
  behavioral: "Behavioral",
  hiring_manager: "Hiring manager",
  recruiter: "Recruiter / HR",
  assessment: "Assessment",
  general: "General",
};

export function categoryLabel(category: InterviewPrepCategory): string {
  return INTERVIEW_PREP_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}
