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
  if (!loc) {
    if (remote === false) return "On-site";
    return "Unknown";
  }
  return "On-site";
}

function toEmploymentType(value?: string | null): EmploymentType {
  const v = (value ?? "").toLowerCase();
  if (!v) return "Not specified";
  if (v.includes("part")) return "Part-time";
  if (v.includes("contract")) return "Contract";
  if (v.includes("intern")) return "Internship";
  return "Full-time";
}

// The backend JobOut schema returns snake_case fields (company_name,
// apply_url, posted_date, etc.) while older clients may use camelCase
// (companyName, applyUrl). These helpers normalize both so adaptJob works
// regardless of which casing the backend currently emits.
type Raw = Record<string, unknown>;

function pick(raw: Raw, snake: string, camel: string): unknown {
  const v = raw[snake] ?? raw[camel];
  return v;
}

function pickStr(raw: Raw, snake: string, camel: string): string | undefined {
  const v = pick(raw, snake, camel);
  return typeof v === "string" ? v : undefined;
}

// Strip HTML tags from backend description fields (e.g. "<h2><strong>Who we
// are</strong></h2>") so the UI shows clean plain text, not raw tags.
function stripHtml(value?: string | null): string {
  if (!value) return "";
  const lt = String.fromCharCode(38) + "lt;";
  const gt = String.fromCharCode(38) + "gt;";
  const amp = String.fromCharCode(38) + "amp;";
  const quot = String.fromCharCode(38) + "quot;";
  const ap = String.fromCharCode(38) + "#39;";
  return value
    .replace(/<[^>]*>/g, " ")
    .split(lt).join("<")
    .split(gt).join(">")
    .split(amp).join("&")
    .split(quot).join(String.fromCharCode(34))
    .split(ap).join(String.fromCharCode(39))
    .replace(/\s+/g, " ")
    .trim();
}

// Raw jobs from the personalized endpoint include optional match/ATS score
// fields that are not part of the base NormalizedJob DTO. This type widens
// NormalizedJob with those optional fields so adaptJob can preserve them.
type RawJobWithScores = NormalizedJob &
  Partial<
    Pick<
      Job,
      | "match"
      | "atsScore"
      | "atsSkillMatch"
      | "atsKeywordMatch"
      | "atsMissingSkills"
      | "atsMissingKeywords"
      | "atsRecommendations"
    >
  >;

// Derives the list of skills the user has that are present in the job.
// The backend personalized endpoint returns match.missingSkills/skills
// (whichever casing). We treat any job skill that is NOT in the missing
// list as a matched skill. When no match data is available we return an
// empty array rather than fabricating data.
function deriveMatchedSkills(raw: RawJobWithScores): string[] {
  const r = raw as unknown as Raw;
  const jobSkills = (r.skills as string[]) ?? [];
  const matchMissing = pick(r, "missingSkills" as never, "missingSkills") as
    | string[]
    | undefined;
  const missing = (raw.atsMissingSkills ?? matchMissing ?? []) as string[];
  if (jobSkills.length === 0 || missing.length === 0) return [];
  const missingLower = new Set(missing.map((s) => s.toLowerCase()));
  return jobSkills.filter((s) => !missingLower.has(s.toLowerCase()));
}

export function adaptJob(
  raw: RawJobWithScores,
  overrides: Partial<Job> = {},
): Job {
  const r = raw as unknown as Raw;
  const company =
    pickStr(r, "company_name", "companyName") ||
    pickStr(r, "company", "company") ||
    "Unknown";
  const brand = BRAND_GRADIENTS[hashString(company) % BRAND_GRADIENTS.length];
  const salary = parseSalary(pickStr(r, "salary", "salary"));
  const postedRaw =
    pickStr(r, "posted_date", "postedDate") ||
    pickStr(r, "created_at", "createdAt");
  const postedDaysAgo = daysAgoFromDate(postedRaw);
  // Match/ATS scores come from the backend (personalized endpoint returns
  // match.overall (or match_overall) and ats_score). Default to 0.
  const matchObj =
    (r.match as Raw | undefined) ??
    (r.matchScore as Raw | undefined) ??
    undefined;
  const matchOverall =
    (matchObj && Number(pick(matchObj, "overall", "overall"))) || 0;
  const atsMatchRaw = pick(r, "ats_score", "atsScore");
  const atsMatch = atsMatchRaw != null && atsMatchRaw !== 0 ? Number(atsMatchRaw) : undefined;
  const description = stripHtml(pickStr(r, "description", "description"));
  const expLevel = pickStr(r, "experience_level", "experienceLevel");
  const roleCat = pickStr(r, "role_category", "roleCategory");
  const appDeadline = pickStr(r, "application_deadline", "applicationDeadline");
  const applyUrl =
    pickStr(r, "apply_url", "applyUrl") ||
    pickStr(r, "url", "url") ||
    null;
  const location = pickStr(r, "location", "location") ?? "Unknown";
  const remote =
    r.remote === true ? true : r.remote === false ? false : null;
  const emplType = pickStr(r, "employment_type", "employmentType");
  const postedLabel = humanPostedDate(postedRaw);

  // Match breakdown from snake_case or camelCase.
  const skillMatch =
    (matchObj && Number(pick(matchObj, "skill_match", "skillMatch"))) || 0;
  const resumeMatch =
    (matchObj && Number(pick(matchObj, "resume_match", "resumeMatch"))) || 0;
  const experienceMatch =
    (matchObj && Number(pick(matchObj, "experience_match", "experienceMatch"))) || 0;
  const locationMatch =
    (matchObj && Number(pick(matchObj, "location_match", "locationMatch"))) || 0;
  const salaryMatch =
    (matchObj && Number(pick(matchObj, "salary_match", "salaryMatch"))) || 0;
  const companyPreference =
    (matchObj && Number(pick(matchObj, "company_preference", "companyPreference"))) || 0;
  const freshness =
    (matchObj && Number(pick(matchObj, "freshness", "freshness"))) || 0;
  const missingSkills = (
    (matchObj && pick(matchObj, "missing_skills", "missingSkills")) ||
    []
  ) as string[];

  const overall = matchOverall;

  return {
    id: (pickStr(r, "id", "id") as string) ?? crypto.randomUUID(),
    role: pickStr(r, "title", "title") || "Untitled Role",
    company,
    companyLogo: company.charAt(0).toUpperCase(),
    companyBrand: brand,
    location,
    workMode: toWorkMode(remote, location),
    employmentType: toEmploymentType(emplType),
    experience: expLevel ?? "Not specified",
    education: undefined,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    aiMatch: overall,
    atsMatch,
    postedAt: postedLabel,
    postedDaysAgo,
    quickApply: false,
    bookmarked: false,
    status: "not_applied",
    techStack: (r.skills as string[]) ?? [],
    overview: description,
    responsibilities: (r.responsibilities as string[]) ?? [],
    requirements: (r.requirements as string[]) ?? [],
    benefits: [],
    recruiterNote: undefined,
    matchedSkills: deriveMatchedSkills(raw),
    missingSkills:
      (raw.atsMissingSkills as string[]) ??
      missingSkills,
    seniority: expLevel ?? "Not specified",
    interviewProbability: Math.round(overall * 0.7),
    keywordCompare: [],
    marketSalary: { min: salary.min, median: salary.max, max: salary.max },
    roleCategory: roleCat ?? null,
    applicationDeadline: appDeadline ?? null,
    applyUrl,
    match: matchObj
      ? {
          overall,
          skillMatch,
          resumeMatch,
          experienceMatch,
          locationMatch,
          salaryMatch,
          companyPreference,
          freshness,
          missingSkills,
        }
      : undefined,
    atsScore: atsMatch,
    atsSkillMatch: Number(pick(r, "ats_skill_match", "atsSkillMatch") ?? 0) || undefined,
    atsKeywordMatch: Number(pick(r, "ats_keyword_match", "atsKeywordMatch") ?? 0) || undefined,
    atsMissingSkills: (pick(r, "ats_missing_skills", "atsMissingSkills") as string[]) ?? undefined,
    atsMissingKeywords: (pick(r, "ats_missing_keywords", "atsMissingKeywords") as string[]) ?? undefined,
    atsRecommendations: (pick(r, "ats_recommendations", "atsRecommendations") as string[]) ?? undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// UI helpers
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
  if (min === 0 && max === 0) return "Not disclosed";
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

// Maps the UI filter pane selections to backend JobSearchFilters.
export function buildSearchFilters(filters: {
  query?: string;
  role?: string;
  location?: string;
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

  return {
    role: filters.role || filters.query || undefined,
    location: filters.location || undefined,
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