import type {
  ResumeData,
  ResumeRecord,
  ResumeListRecord,
  ResumeContact,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  ResumeSection,
} from "../types/resume";

// ---------------------------------------------------------------------------
// Sample fallback for resume content when parsing hasn't completed yet.
// The UI components require a ResumeData shape; if the backend hasn't parsed
// the file yet, we show a minimal placeholder.
// ---------------------------------------------------------------------------

const DEFAULT_SECTIONS: ResumeSection[] = [
  { id: "s-summary", type: "summary", title: "Summary" },
  { id: "s-experience", type: "experience", title: "Experience" },
  { id: "s-skills", type: "skills", title: "Skills" },
  { id: "s-projects", type: "projects", title: "Projects" },
  { id: "s-education", type: "education", title: "Education" },
];

export function adaptResumeRecord(record: ResumeRecord): ResumeData {
  const now = Date.now();
  return {
    id: record.id,
    name: record.title || "Untitled Resume",
    targetRole: "",
    updatedAt: formatRelativeTime(record.updated_at),
    atsScore: 0,
    contact: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    sections: DEFAULT_SECTIONS,
  };
}

/** Build a ResumeData from parsed content if available, else from the record */
export function buildResumeData(
  record: ResumeRecord,
  parsedContent?: Record<string, unknown> | null,
): ResumeData {
  const base = adaptResumeRecord(record);
  if (!parsedContent) return base;

  const p = parsedContent as Record<string, unknown>;
  const personal = (p.personal as Record<string, string>) ?? {};

  return {
    ...base,
    targetRole: (p.targetRole as string) ?? "",
    contact: {
      fullName: (personal.fullName as string) ?? "",
      headline: (personal.headline as string) ?? "",
      email: (personal.email as string) ?? "",
      phone: (personal.phone as string) ?? "",
      location: (personal.location as string) ?? "",
      website: (personal.website as string) ?? "",
    },
    summary: (p.summary as string) ?? "",
    experience: (p.experience as ExperienceItem[]) ?? [],
    education: (p.education as EducationItem[]) ?? [],
    skills: (p.skills as string[]) ?? [],
    projects: (p.projects as ProjectItem[]) ?? [],
    sections: DEFAULT_SECTIONS,
  };
}

/** Adapt a ResumeRecord to the lightweight ResumeListRecord shape. */
export function adaptResumeListRecord(
  record: ResumeRecord,
): ResumeListRecord {
  return {
    id: record.id,
    name: record.title || "Untitled Resume",
    role: "",
    updatedAt: formatRelativeTime(record.updated_at),
    atsScore: 0,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}