import { Bookmark, MapPin, Zap, Sparkles, Gauge } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/types/jobs";
import { formatSalary, statusMeta } from "@/lib/jobs";

export function JobList({
  jobs,
  selectedId,
  onSelect,
  loading,
  onToggleBookmark,
  query,
}: {
  jobs: Job[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  onToggleBookmark: (id: string) => void;
  query?: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold">
            {jobs.length.toLocaleString()} roles
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {query ? `for "${query}"` : "Sorted by match score"}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/50 bg-surface-elevated/40 p-3.5"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}

          {!loading &&
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={job.id === selectedId}
                onSelect={() => onSelect(job.id)}
                onToggleBookmark={() => onToggleBookmark(job.id)}
              />
            ))}

          {!loading && jobs.length === 0 && (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-surface-elevated/30 py-16 text-center">
              <div className="max-w-[220px]">
                <div className="text-sm font-semibold">No roles match</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Try widening filters or clearing your search.
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function JobCard({
  job,
  selected,
  onSelect,
  onToggleBookmark,
}: {
  job: Job;
  selected: boolean;
  onSelect: () => void;
  onToggleBookmark: () => void;
}) {
  const status = statusMeta(job.status);
  const matchScore = job.match?.overall;
  const atsScore = job.atsScore;
  const missingSkills = job.atsMissingSkills?.length ? job.atsMissingSkills : job.missingSkills;

  return (
    <button
      onClick={onSelect}
      className={`group relative block w-full rounded-2xl border p-3.5 text-left transition-all duration-200 will-change-transform ${
        selected
          ? "border-primary/50 bg-primary/[0.06] ring-1 ring-primary/30"
          : "border-border/50 bg-surface-elevated/40 hover:-translate-y-0.5 hover:border-border hover:bg-surface-elevated"
      }`}
    >
      {selected && (
        <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-gradient-to-b from-primary to-accent" />
      )}
      <div className="flex items-start gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-white shadow-elevation-1"
          style={{ background: job.companyBrand }}
          aria-hidden
        >
          {job.companyLogo}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[13.5px] font-semibold leading-tight">
                {job.role}
              </div>
              <div className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                {job.company} · {job.experience}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark();
              }}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition ${
                job.bookmarked
                  ? "text-warning"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
              aria-label="Bookmark"
            >
              <Bookmark
                className="h-3.5 w-3.5"
                fill={job.bookmarked ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[10px] ${
                job.workMode === "Remote"
                  ? "border-success/30 bg-success/10 text-success"
                  : job.workMode === "Hybrid"
                  ? "border-info/30 bg-info/10 text-info"
                  : job.workMode === "Unknown"
                  ? "border-border/60 bg-surface-elevated/50 text-muted-foreground"
                  : "border-border/60 bg-surface-elevated/50"
              }`}
            >
              {job.workMode}
            </span>
            <span className="rounded-full border border-border/60 bg-surface-elevated/50 px-1.5 py-0.5 font-mono text-[10px]">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            {matchScore != null && (
              <MatchPill icon={Sparkles} label="Match" value={matchScore} tone="primary" />
            )}
            {atsScore != null && atsScore > 0 ? (
              <MatchPill icon={Gauge} label="ATS" value={atsScore} tone="accent" />
            ) : (
              <span className="rounded-full border border-border/60 bg-surface-elevated/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ATS N/A
              </span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground">{job.postedAt}</span>
          </div>

          {missingSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {missingSkills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive"
                >
                  {skill}
                </span>
              ))}
              {missingSkills.length > 3 && (
                <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  +{missingSkills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="mt-2.5 flex items-center gap-1.5">
            <Badge
              variant="secondary"
              className="h-5 gap-1 rounded-full border-primary/30 bg-primary/10 px-1.5 text-[10px] text-primary"
            >
              <Sparkles className="h-2.5 w-2.5" />
              Quick Fix
            </Badge>
            {job.quickApply && (
              <Badge
                variant="secondary"
                className="h-5 gap-1 rounded-full border-success/30 bg-success/10 px-1.5 text-[10px] text-success"
              >
                <Zap className="h-2.5 w-2.5" />
                Optimize
              </Badge>
            )}
            {job.status !== "not_applied" && (
              <Badge
                variant="outline"
                className={`h-5 rounded-full border px-1.5 text-[10px] ${status.tone}`}
              >
                {status.label}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function MatchPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: "primary" | "accent";
}) {
  if (value == null) return null;
  const color =
    tone === "primary"
      ? "from-primary/25 to-primary/5 text-foreground ring-primary/25"
      : "from-accent/25 to-accent/5 text-foreground ring-accent/25";
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md bg-gradient-to-br px-1.5 py-0.5 text-[10.5px] font-medium ring-1 ${color}`}
    >
      <Icon className="h-2.5 w-2.5 opacity-80" />
      <span className="text-[9.5px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}