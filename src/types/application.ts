// Types for the Applications (Mission Control) domain
// Aligned with backend server action contracts and database schema

export type ApplicationStatus = "applied" | "assessment" | "interview" | "offer" | "rejected";

export type ApplicationStage =
  "saved" | "applied" | "assessment" | "interview" | "offer" | "accepted" | "rejected" | "archived";

export interface Application {
  id: string;
  user_id: string;
  job_title: string;
  company_name: string;
  status: ApplicationStatus;
  application_date: string;
  notes: string | null;
  // Extended fields that the frontend UI needs but backend may not provide yet
  // These will be derived/mapped from the core fields
  created_at?: string;
  updated_at?: string;
}

export interface CreateApplicationRequest {
  job_title: string;
  company_name: string;
  notes?: string;
}

export interface UpdateApplicationStatusRequest {
  id: string;
  status: ApplicationStatus;
}

export interface ApplicationListResponse {
  applications: Application[];
  total: number;
}

export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  interviewRate: number;
  offerRate: number;
  acceptanceRate: number;
  activeThisWeek: number;
  streakDays: number;
}

// Stage metadata for UI rendering
export const APPLICATION_STAGES: { id: ApplicationStage; label: string; tone: string }[] = [
  { id: "saved", label: "Saved", tone: "text-muted-foreground bg-muted/50 ring-border/60" },
  { id: "applied", label: "Applied", tone: "text-primary bg-primary/10 ring-primary/20" },
  { id: "assessment", label: "Assessment", tone: "text-accent bg-accent/10 ring-accent/25" },
  { id: "interview", label: "Interview", tone: "text-warning bg-warning/10 ring-warning/25" },
  { id: "offer", label: "Offer", tone: "text-success bg-success/10 ring-success/20" },
  { id: "accepted", label: "Accepted", tone: "text-success bg-success/15 ring-success/25" },
  {
    id: "rejected",
    label: "Rejected",
    tone: "text-destructive bg-destructive/10 ring-destructive/20",
  },
  { id: "archived", label: "Archived", tone: "text-muted-foreground bg-muted/40 ring-border/60" },
];

// Map from backend ApplicationStatus to frontend ApplicationStage
export function mapStatusToStage(status: ApplicationStatus): ApplicationStage {
  return status as ApplicationStage;
}

// Map from frontend ApplicationStage to backend ApplicationStatus
export function mapStageToStatus(stage: ApplicationStage): ApplicationStatus {
  if (stage === "saved" || stage === "accepted" || stage === "archived") {
    // These are frontend-only stages that map to "applied" if needed
    return "applied";
  }
  return stage as ApplicationStatus;
}
