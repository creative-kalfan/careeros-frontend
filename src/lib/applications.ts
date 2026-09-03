// Data transformation layer for Applications (Mission Control)
// Maps backend API data to the UI format expected by components

import type {
  Application,
  ApplicationStage,
  ApplicationStatus,
  ApplicationStats,
} from "../types/application";

// Extended UI-facing Application type with all the display fields
export interface ApplicationUI {
  id: string;
  company: string;
  logo: string;
  role: string;
  location: string;
  salary: string;
  stage: ApplicationStage;
  match: number;
  favorite?: boolean;
  postedAt: string;
  updatedAt: string;
  nextAction?: { label: string; when: string; urgency: "today" | "soon" | "later" };
  recruiter?: { id: string; name: string; role: string; email?: string; last?: string };
  contacts: { id: string; name: string; role: string; last?: string }[];
  notes: string;
  attachments: { id: string; name: string; kind: string; size: string }[];
  history: { id: string; time: string; title: string; detail: string; kind: string }[];
  interviews: {
    id: string;
    name: string;
    when: string;
    interviewer?: string;
    status: string;
    notes?: string;
  }[];
  assessments: { id: string; label: string; due: string; status: string }[];
  culture?: string;
  glassdoor?: number;
  progress: number;
}

export interface FollowUpUI {
  id: string;
  company: string;
  role: string;
  due: string;
  kind: "email" | "call" | "message" | "task";
  status: "pending" | "completed";
  note: string;
}

export interface CalendarEventUI {
  id: string;
  day: number;
  month: number;
  year: number;
  hour?: number;
  title: string;
  company: string;
  kind: "interview" | "deadline" | "followup" | "assessment";
}

export interface StatsUI {
  applications: number;
  interviewRate: number;
  offerRate: number;
  acceptanceRate: number;
  streakDays: number;
  activeThisWeek?: number;
}

// Transform backend Application to frontend ApplicationUI
export function transformApplication(app: Application): ApplicationUI {
  const stage = app.status as ApplicationStage;
  const progress = getProgressForStage(stage);

  return {
    id: app.id,
    company: app.company_name,
    logo: app.company_name.charAt(0).toUpperCase(),
    role: app.job_title,
    location: "",
    salary: "",
    stage,
    match: 0,
    postedAt: app.application_date ? formatDate(app.application_date) : "",
    updatedAt: app.updated_at ? timeAgo(app.updated_at) : "",
    notes: app.notes ?? "",
    contacts: [],
    attachments: [],
    history: [
      {
        id: `${app.id}-history-1`,
        time: timeAgo(app.application_date),
        title: "Applied",
        detail: `Application submitted for ${app.job_title} at ${app.company_name}`,
        kind: "status",
      },
    ],
    interviews: [],
    assessments: [],
    progress,
  };
}

// Transform backend Application array to ApplicationUI array
export function transformApplications(apps: Application[]): ApplicationUI[] {
  return apps.map(transformApplication);
}

// Calculate progress percentage based on stage
function getProgressForStage(stage: ApplicationStage): number {
  const progressMap: Record<ApplicationStage, number> = {
    saved: 5,
    applied: 20,
    assessment: 40,
    interview: 60,
    offer: 85,
    accepted: 100,
    rejected: 100,
    archived: 100,
  };
  return progressMap[stage] ?? 0;
}

// Format date string
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Simple time-ago formatter
function timeAgo(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

// Compute stats from applications
export function computeStats(apps: ApplicationUI[]): StatsUI {
  const total = apps.filter((a) => a.stage !== "saved" && a.stage !== "archived").length;
  const withInterviews = apps.filter(
    (a) => a.stage === "interview" || a.stage === "offer" || a.stage === "accepted",
  ).length;
  const withOffers = apps.filter((a) => a.stage === "offer" || a.stage === "accepted").length;
  const accepted = apps.filter((a) => a.stage === "accepted").length;

  return {
    applications: total,
    interviewRate: total > 0 ? Math.round((withInterviews / total) * 100) : 0,
    offerRate: withInterviews > 0 ? Math.round((withOffers / withInterviews) * 100) : 0,
    acceptanceRate: withOffers > 0 ? Math.round((accepted / withOffers) * 100) : 0,
    streakDays: 0,
    activeThisWeek: 0,
  };
}

// Group applications by stage
export function groupByStage(apps: ApplicationUI[]): Record<ApplicationStage, ApplicationUI[]> {
  const groups: Record<ApplicationStage, ApplicationUI[]> = {
    saved: [],
    applied: [],
    assessment: [],
    interview: [],
    offer: [],
    accepted: [],
    rejected: [],
    archived: [],
  };
  apps.forEach((app) => {
    if (groups[app.stage]) {
      groups[app.stage].push(app);
    }
  });
  return groups;
}

// Filter applications based on filter id
export function filterApplications(
  apps: ApplicationUI[],
  filterId: string,
  favorites: boolean,
  stages: ApplicationStage[],
): ApplicationUI[] {
  let filtered = apps;
  if (favorites) {
    filtered = filtered.filter((a) => a.favorite);
  } else if (stages.length > 0) {
    filtered = filtered.filter((a) => stages.includes(a.stage));
  }
  return filtered;
}

// Search applications by query
export function searchApplications(apps: ApplicationUI[], query: string): ApplicationUI[] {
  if (!query.trim()) return apps;
  const q = query.toLowerCase();
  return apps.filter(
    (a) =>
      a.company.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q),
  );
}

// Sidebar filters configuration
export interface SidebarFilter {
  id: string;
  label: string;
  stages: ApplicationStage[];
  favorites?: boolean;
}

export const sidebarFilters: SidebarFilter[] = [
  {
    id: "all",
    label: "All applications",
    stages: ["applied", "assessment", "interview", "offer", "accepted", "rejected"],
  },
  { id: "interviews", label: "Interviews", stages: ["interview"] },
  { id: "assessments", label: "Assessments", stages: ["assessment"] },
  { id: "offers", label: "Offers", stages: ["offer", "accepted"] },
  { id: "rejected", label: "Rejected", stages: ["rejected"] },
  { id: "archived", label: "Archived", stages: ["archived"] },
  { id: "saved", label: "Saved", stages: ["saved"] },
  { id: "bookmarks", label: "Bookmarks", stages: [], favorites: true },
];
