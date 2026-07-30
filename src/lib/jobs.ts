import type {
  ApplicationStatus,
  EmploymentType,
  Job,
  JobSearchFilters,
  NormalizedJob,
  WorkMode,
} from "../types/jobs";

// ---------------------------------------------------------------------------
// Backend → UI adapter
// ---------------------------------------------------------------------------

const BRAND_GRADIENTS = [
  "linear-gradient(135deg,#5E6AD2,#8B5CF6)",
  "linear-gradient(135deg,#635BFF,#00D4FF)",
  "linear-gradient(135deg,#111,#444)",
  "linear-gradient(135deg,#F24E1E,#A259FF)",
  "linear-gradient(135deg,#10A37F,#0EA5E9)",
  "linear-gradient(135deg,#95BF47,#5E8E3E)",
  "linear-gradient(135deg,#C97C5D,#8B4513)",
  "linear-gradient(135deg,#F59E0B,#EA580C)",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function parseSalary(salary?: string | null): {
  min: number;
  max: number;
  currency: string;
} {
  if (!salary) return { min: 0, max: 0, currency: "USD" };
  // Examples: "$180k - $285k", "180000 - 285000 USD", "180-285k"
  const currencyMatch = salary.match(/[A-Z]{3}/);
  const currency = currencyMatch ? currencyMatch[0] : "USD";
  const numbers = salary.match(/\d[\d,]*/g) ?? [];
  const values = numbers.map((n) => Number(n.replace(/,/g, "")));
  if (values.length === 0) return { min: 0, max: 0, currency };
  const toThousands = (n: number) => (n >= 1000 ? Math.round(n / 1000) : n);
  const min = toThousands(values[0]);
  const max = values[1] ? toThousands(values[1]) : min;
  return { min, max, currency };
}

function daysAgoFromDate(date?: string | null): number {
  if (!date) return 0;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 0;
  const diff = Date.now() - parsed.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function humanPostedDate(date?: string | null): string {
  const days = daysAgoFromDate(date);
  if (days <= 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function toWorkMode(remote?: boolean | null, location?: string | null): WorkMode {
  const loc = (location ?? "").toLowerCase();
  if (remote === true || loc.includes("remote")) return "Remote";
  if (loc.includes("hybrid")) return "Hybrid";
  return "On-site";
}

function toEmploymentType(value?: string | null): EmploymentType {
  const v = (value ?? "").toLowerCase();
  if (v.includes("part")) return "Part-time";
  if (v.includes("contract")) return "Contract";
  if (v.includes("intern")) return "Internship";
  return "Full-time";
}

// Deterministic pseudo-match derived from backend signals so the UI keeps
// showing AI/ATS pills. The backend does not yet return a per-job match score.
function deriveMatchScore(job: NormalizedJob): number {
  const skills = job.skills?.length ?? 0;
  const hasDescription = job.description ? 1 : 0;
  const hasRequirements = job.requirements?.length ? 1 : 0;
  const base = 60 + Math.min(30, skills * 3) + hasDescription * 5 + hasRequirements * 5;
  return Math.min(98, base);
}

export function adaptJob(
  raw: NormalizedJob,
  overrides: Partial<Job> = {},
): Job {
  const id = raw.id ?? raw.externalJobId ?? crypto.randomUUID();
  const company = raw.companyName || "Unknown";
  const brand = BRAND_GRADIENTS[hashString(company) % BRAND_GRADIENTS.length];
  const salary = parseSalary(raw.salary);
  const postedDaysAgo = daysAgoFromDate(raw.postedDate ?? raw.createdAt);
  const aiMatch = deriveMatchScore(raw);
  const atsMatch = Math.max(40, Math.round(aiMatch * 0.9));

  return {
    id,
    role: raw.title || "Untitled Role",
    company,
    companyLogo: company.charAt(0).toUpperCase(),
    companyBrand: brand,
    location: raw.location ?? "Unknown",
    workMode: toWorkMode(raw.remote, raw.location),
    employmentType: toEmploymentType(raw.employmentType),
    experience: raw.experienceLevel ?? "Not specified",
    education: undefined,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    aiMatch,
    atsMatch,
    postedAt: humanPostedDate(raw.postedDate ?? raw.createdAt),
    postedDaysAgo,
    quickApply: false,
    bookmarked: false,
    status: "not_applied",
    techStack: raw.skills ?? [],
    overview: raw.description ?? "",
    responsibilities: raw.responsibilities ?? [],
    requirements: raw.requirements ?? [],
    benefits: [],
    recruiterNote: undefined,
    matchedSkills: [],
    missingSkills: [],
    seniority: raw.experienceLevel ?? "Not specified",
    interviewProbability: Math.round(aiMatch * 0.7),
    keywordCompare: [],
    marketSalary: { min: salary.min, median: salary.max, max: salary.max },
    // New classification fields (migration 011)
    roleCategory: raw.roleCategory ?? null,
    applicationDeadline: raw.applicationDeadline ?? null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// UI helpers (previously in jobs-data.ts mock file)
// ---------------------------------------------------------------------------

export function statusMeta(s: ApplicationStatus): { label: string; tone: string } {
  switch (s) {
    case "applied":
      return { label: "Applied", tone: "bg-info/15 text-info border-info/30" };
    case "interviewing":
      return { label: "Interviewing", tone: "bg-accent/15 text-accent border-accent/30" };
    case "offer":
      return { label: "Offer", tone: "bg-success/15 text-success border-success/30" };
    case "rejected":
      return { label: "Closed", tone: "bg-destructive/15 text-destructive border-destructive/30" };
    case "saved":
      return { label: "Saved", tone: "bg-warning/15 text-warning border-warning/30" };
    default:
      return { label: "New", tone: "bg-surface-elevated/60 text-muted-foreground border-border/60" };
  }
}

export function formatSalary(min: number, max: number, cur = "USD") {
  const s = cur === "USD" ? "$" : cur + " ";
  return `${s}${min}k – ${s}${max}k`;
}

export const filterOptions = {
  workMode: ["Remote", "Hybrid", "On-site"] as WorkMode[],
  employmentType: ["Full-time", "Part-time", "Contract", "Internship"] as EmploymentType[],
  experience: ["Entry", "Mid", "Senior", "Staff+"],
  postedDate: ["Last 24h", "Last 3 days", "Last week", "Last month"],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node",
    "Python",
    "Rust",
    "GraphQL",
    "Postgres",
    "Kubernetes",
  ],
  companies: [] as string[],
};

// Static UI affordances that do not require backend data.
export const savedSearchesMock = [
  { id: "s1", label: "Staff FE · Remote · $220k+", count: 34 },
  { id: "s2", label: "AI product · SF/NY", count: 18 },
  { id: "s3", label: "Design engineer · Hybrid", count: 12 },
];

export const recentSearchesMock = [
  "Staff frontend engineer",
  "Design engineer remote",
  "AI product engineer",
  "TypeScript React startup",
];

export const searchSuggestionsMock = [
  { type: "role", label: "Staff Frontend Engineer" },
  { type: "role", label: "Design Engineer" },
  { type: "role", label: "AI Product Engineer" },
  { type: "company", label: "Linear" },
  { type: "company", label: "Vercel" },
  { type: "skill", label: "TypeScript" },
  { type: "skill", label: "Next.js" },
  { type: "location", label: "Remote · US" },
];

// Maps the UI filter pane selections to backend JobSearchFilters.
export function buildSearchFilters(filters: {
  query?: string;
  workMode?: string[];
  employmentType?: string[];
  experience?: string[];
  skills?: string[];
  companies?: string[];
  sort?: JobSearchFilters["sort"];
  page?: number;
  pageSize?: number;
}): JobSearchFilters {
  const remote =
    filters.workMode?.includes("Remote") === true
      ? true
      : filters.workMode?.includes("On-site") === true
        ? false
        : undefined;

  // Send the query as role only — the backend searches title with ilike.
  // Sending it as both role AND location would over-restrict results.
  return {
    role: filters.query || undefined,
    company: filters.companies?.[0],
    employmentType: filters.employmentType?.[0],
    experience: filters.experience?.[0],
    skills: filters.skills,
    remote,
    sort: filters.sort,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}
