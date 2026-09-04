import { useState } from "react";
import {
  Bookmark,
  MapPin,
  Sparkles,
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  SearchX,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types/jobs";
import { formatSalary, getMatchTier } from "@/lib/jobs";

export function JobList({
  jobs,
  selectedId,
  onSelect,
  loading,
  onToggleBookmark,
  query,
  onClearFilters,
  page = 1,
  total,
  pageSize = 20,
  isFetching,
}: {
  jobs: Job[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  onToggleBookmark: (id: string) => void;
  query?: string;
  onClearFilters?: () => void;
  page?: number;
  total?: number;
  pageSize?: number;
  isFetching?: boolean;
}) {
  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = total !== undefined ? Math.min(startIdx + jobs.length - 1, total) : jobs.length;
  const hasRange = total !== undefined && total > jobs.length && jobs.length > 0;

  const countLabel = loading
    ? "Searching opportunities..."
    : isFetching
      ? "Updating..."
      : hasRange
        ? `Showing ${startIdx.toLocaleString()}–${endIdx.toLocaleString()} of ${total.toLocaleString()} opportunities`
        : total !== undefined
          ? `${total.toLocaleString()} ${total === 1 ? "opportunity" : "opportunities"}`
          : `${jobs.length.toLocaleString()} opportunities`;

  return (
    <div className="flex h-full flex-col select-none">
      {/* Header bar: count + status */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5 bg-surface/40">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold tracking-tight text-foreground truncate">
            {countLabel}
          </span>
          {isFetching && !loading && (
            <span
              className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary"
              aria-label="Updating page"
            />
          )}
          {query && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
              for &ldquo;{query}&rdquo;
            </span>
          )}
        </div>
        <span className="text-[10.5px] font-mono text-muted-foreground/80 shrink-0">
          Ranked by match
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 p-2.5">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-surface-elevated/20 p-3"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-3.5 w-16 rounded" />
                      <Skeleton className="h-3.5 w-20 rounded" />
                    </div>
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
            <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-surface-elevated/20 p-8 text-center my-6">
              <div className="max-w-[260px] space-y-3">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted/60 text-muted-foreground">
                  <SearchX className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    No matching opportunities
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Try adjusting search keywords or clearing additional filters.
                  </p>
                </div>
                {onClearFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-8 rounded-lg text-xs"
                  >
                    Reset filters
                  </Button>
                )}
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
  const matchScore = job.match?.overall ?? job.aiMatch;
  const matchTier = getMatchTier(matchScore);
  const [logoFailed, setLogoFailed] = useState(false);
  const showRealLogo = Boolean(job.companyLogoUrl) && !logoFailed;
  const provenance = job.sourceProvenance;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={selected}
      className={`group relative block w-full cursor-pointer rounded-xl border p-3 text-left transition-all duration-150 will-change-transform focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
        selected
          ? "border-primary/40 bg-surface-elevated shadow-xs"
          : "border-border/60 bg-surface/50 hover:border-border hover:bg-surface-elevated/60 hover:translate-x-0.5"
      }`}
    >
      {/* Active selection vertical blue indicator */}
      {selected && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-[2.5px] rounded-r-sm bg-primary" />
      )}

      <div className="flex items-start gap-3">
        {/* Company Logo / Avatar */}
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-foreground/80 shadow-2xs overflow-hidden border border-border/60 bg-surface-elevated"
          aria-hidden
        >
          {showRealLogo ? (
            <img
              src={job.companyLogoUrl}
              alt={`${job.company} logo`}
              className="h-6 w-6 object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            job.companyLogo
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Header row: Company name + Provenance + Bookmark */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="truncate text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {job.company}
              </span>
              {provenance?.verified && (
                <span
                  title={provenance.label}
                  className="inline-flex items-center text-[10px] text-success shrink-0"
                >
                  <ShieldCheck className="h-3 w-3" />
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark();
              }}
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-md transition-colors ${
                job.bookmarked
                  ? "text-warning hover:text-warning"
                  : "text-muted-foreground/50 hover:text-foreground hover:bg-surface-elevated"
              }`}
              aria-label={job.bookmarked ? "Unsave job" : "Save job"}
            >
              <Bookmark className="h-3.5 w-3.5" fill={job.bookmarked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Job Title */}
          <h3 className="line-clamp-2 break-words text-[13.5px] font-semibold tracking-tight text-foreground mt-0.5 leading-snug">
            {job.role}
          </h3>

          {/* Metadata badges row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground/70" />
              <span className="truncate max-w-[120px]">{job.location}</span>
            </span>
            <span>·</span>
            <span className="font-mono text-[10.5px]">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </span>
          </div>

          {/* Bottom tag bar: Match score + Work mode + Freshness */}
          <div className="mt-2.5 flex items-center justify-between gap-1 pt-1 border-t border-border/40 text-[10.5px]">
            <div className="flex items-center gap-1.5">
              {matchScore > 0 && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-semibold border ${matchTier.badgeClass}`}
                >
                  {matchScore}% match
                </span>
              )}
              <span className="rounded px-1.5 py-0.5 bg-surface-elevated/60 text-muted-foreground text-[10px]">
                {job.workMode}
              </span>
            </div>

            <span className="text-[10px] text-muted-foreground/80 font-mono">{job.postedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
