export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  RESUME: {
    LIST: "/resume",
    EDITOR: "/resume/:id",
    NEW: "/resume/new",
  },
  ATS: {
    ANALYZER: "/ats",
    HISTORY: "/ats/history",
  },
  JOBS: {
    SEARCH: "/jobs",
    SAVED: "/jobs/saved",
  },
  APPLICATIONS: {
    LIST: "/applications",
    DETAIL: "/applications/:id",
  },
  COPILOT: "/copilot",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;
