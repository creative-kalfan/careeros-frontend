// ---------------------------------------------------------------------------
// UI-facing resume types (consumed by Resume workspace components)
// ---------------------------------------------------------------------------

export type ResumeSectionType = "summary" | "experience" | "education" | "skills" | "projects";

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
}

export interface ResumeSection {
  id: string;
  type: ResumeSectionType;
  title: string;
}

export interface ResumeContact {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
}

export interface ResumeData {
  id: string;
  name: string;
  targetRole: string;
  updatedAt: string;
  atsScore: number;
  contact: ResumeContact;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  sections: ResumeSection[];
}

// ---------------------------------------------------------------------------
// Backend DTOs (response shapes from backend)
// ---------------------------------------------------------------------------

/** The resume row in the database. */
export type ResumeRecord = {
  id: string;
  user_id: string;
  title: string;
  file_url?: string | null;
  original_filename?: string | null;
  storage_path?: string | null;
  parse_status: "pending" | "processing" | "completed" | "failed";
  content?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

/** Shape returned by POST /upload/resume */
export type UploadResumeResponse = {
  resume: ResumeRecord;
  parse: {
    status: "completed" | "failed" | "pending";
    versionId?: string;
    error?: string;
    extracted?: {
      name: string;
      email: string;
      phone: string;
      skills: number;
      experience: number;
      projects: number;
      education: number;
      certifications: number;
    };
  } | null;
};

/** Shape returned by POST /resumes/[id]/parse */
export type ParseResumeResponse = {
  resumeId: string;
  versionId: string;
  status: "completed" | "failed" | "processing";
  parsed: {
    personal: {
      fullName?: string;
      email?: string;
      phone?: string;
      location?: string;
      headline?: string;
      website?: string;
    };
    skillsCount: number;
    experienceCount: number;
    projectsCount: number;
    educationCount: number;
    certificationsCount: number;
  };
};

export type ResumeListRecord = {
  id: string;
  name: string;
  role: string;
  updatedAt: string;
  atsScore: number;
};

/** Backend response envelope: { success, data, meta? } */
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

export type ResumeListResponse = {
  resumes: ResumeListRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ResumeContent = {
  sections: Array<{
    id: string;
    type: string;
    title: string;
    order: number;
    visible: boolean;
    data: Record<string, unknown>;
  }>;
  meta?: {
    theme?: "classic" | "modern";
    fontSize?: number;
    parsedAt?: string;
  };
};