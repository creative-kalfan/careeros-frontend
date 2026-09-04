import { useState } from "react";
import {
  MapPin,
  Briefcase,
  Share2,
  Bookmark,
  ExternalLink,
  Building2,
  Sparkles,
  GraduationCap,
  DollarSign,
  Users,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Wand2,
  Clock,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobDescriptionRenderer } from "./job-description-renderer";
import { AIInsights } from "./ai-insights";
import type { Job, JobMatchResponse } from "@/types/jobs";
import { formatSalary, statusMeta, getMatchTier } from "@/lib/jobs";

export function JobDetails({
  job,
  onToggleBookmark,
  onEditResume,
  onTrackApplication,
  isTracked,
  isTracking,
  matchResult,
  isMatching,
  onRunMatch,
}: {
  job: Job;
  onToggleBookmark: () => void;
  onEditResume?: () => void;
  onTrackApplication?: () => void;
  isTracked?: boolean;
  isTracking?: boolean;
  matchResult?: JobMatchResponse;
  isMatching?: boolean;
  onRunMatch?: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"brief" | "fit">("brief");
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  const showRealLogo = Boolean(job.companyLogoUrl) && !logoFailed;
  const status = statusMeta(job.status);
  const provenance = job.sourceProvenance;
  const matchScore = matchResult?.match.matchScore ?? job.match?.overall ?? job.aiMatch ?? 0;
  const matchTier = getMatchTier(matchScore);

  const handleShare = () => {
    if (job.applyUrl) {
      navigator.clipboard.writeText(job.applyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface/30 select-text">
      {/* Top Opportunity Header */}
      <div className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-md px-5 py-3 space-y-2.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            {/* Company Logo / Avatar */}
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-foreground/80 shadow-2xs overflow-hidden border border-border/60 bg-surface-elevated"
              aria-hidden
            >
              {showRealLogo ? (
                <img
                  src={job.companyLogoUrl}
                  alt={`${job.company} logo`}
                  className="h-7 w-7 object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                job.companyLogo
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-foreground/90">{job.company}</span>

                {provenance?.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{provenance.label}</span>
                  </span>
                )}

                {job.status !== "not_applied" && (
                  <Badge
                    variant="outline"
                    className={`h-4.5 rounded-md px-1.5 text-[10px] ${status.tone}`}
                  >
                    {status.label}
                  </Badge>
                )}
              </div>

              <h2 className="mt-0.5 text-base sm:text-lg font-bold tracking-tight text-foreground leading-snug break-words">
                {job.role}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground/70" />
                  {job.location}
                </span>
                <span>·</span>
                <span>{job.workMode}</span>
                <span>·</span>
                <span className="font-mono text-foreground font-medium">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
                <span>·</span>
                <span className="font-mono text-[11px] text-muted-foreground/80">
                  {job.postedAt}
                </span>
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          {matchScore > 0 && (
            <div className="shrink-0 text-right hidden sm:block">
              <div
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold font-mono ${matchTier.badgeClass}`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{matchScore}% Match</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-sans">
                {matchTier.label}
              </div>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onTrackApplication && (
            <Button
              size="sm"
              variant={isTracked ? "secondary" : "default"}
              className={`h-8.5 px-3.5 rounded-lg text-xs font-medium gap-1.5 shadow-xs ${
                isTracked
                  ? "bg-success/15 text-success border border-success/30 hover:bg-success/20"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
              onClick={onTrackApplication}
              disabled={isTracking || isTracked}
            >
              {isTracked ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  <span>Tracked</span>
                </>
              ) : (
                <>
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{isTracking ? "Tracking..." : "Track Application"}</span>
                </>
              )}
            </Button>
          )}

          {job.applyUrl ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8.5 px-3.5 rounded-lg text-xs font-medium gap-1.5 shadow-xs bg-surface-elevated/40 hover:bg-surface-elevated text-foreground border-border"
              onClick={() => {
                window.open(job.applyUrl as string, "_blank", "noopener,noreferrer");
              }}
            >
              <span>Apply on Site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="h-8.5 px-4 rounded-lg text-xs font-medium gap-1.5 opacity-60 cursor-not-allowed"
              disabled
            >
              No direct link
            </Button>
          )}

          {onEditResume && (
            <Button
              size="sm"
              variant="outline"
              className="h-8.5 px-3.5 rounded-lg text-xs font-medium gap-1.5 border-border bg-surface-elevated/40 hover:bg-surface-elevated hover:text-foreground text-foreground"
              onClick={onEditResume}
            >
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              <span>Tailor Resume</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className={`h-8.5 px-3 rounded-lg text-xs font-medium gap-1.5 border-border bg-surface-elevated/40 hover:bg-surface-elevated ${
              job.bookmarked ? "text-warning bg-warning/10 border-warning/30" : "text-foreground"
            }`}
            onClick={onToggleBookmark}
          >
            <Bookmark className="h-3.5 w-3.5" fill={job.bookmarked ? "currentColor" : "none"} />
            <span>{job.bookmarked ? "Saved" : "Save"}</span>
          </Button>

          {job.applyUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8.5 w-8.5 rounded-lg text-muted-foreground hover:text-foreground ml-auto"
              onClick={handleShare}
              title={copied ? "Copied!" : "Copy job link"}
              aria-label="Share opportunity"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-1 border-t border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("brief")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "brief"
                ? "bg-surface-elevated text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Role Brief & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fit")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === "fit"
                ? "bg-surface-elevated text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Fit & Intelligence</span>
            {matchScore > 0 && (
              <span className="rounded-full px-1.5 py-0.2 text-[10px] font-mono bg-primary/15 text-primary">
                {matchScore}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tabbed Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-5 space-y-4 max-w-4xl">
          {activeTab === "brief" ? (
            <>
              {/* Role Overview & Sanitized Description */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    Role Overview
                  </h3>
                  {(job.overview?.length ?? 0) > 420 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOverviewExpanded((prev) => !prev)}
                      className="h-6 px-2 text-[11px] font-medium text-primary hover:text-primary/80 gap-1"
                    >
                      <span>{isOverviewExpanded ? "Show less" : "Show more"}</span>
                      {isOverviewExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="relative rounded-xl border border-border/80 bg-surface-elevated/20 p-3.5 sm:p-4">
                  <div
                    className={
                      (job.overview?.length ?? 0) > 420 && !isOverviewExpanded
                        ? "max-h-[260px] overflow-hidden relative transition-all duration-200"
                        : "relative transition-all duration-200"
                    }
                  >
                    <JobDescriptionRenderer description={job.overview} />
                    {(job.overview?.length ?? 0) > 420 && !isOverviewExpanded && (
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-elevated via-surface-elevated/80 to-transparent pointer-events-none" />
                    )}
                  </div>
                  {(job.overview?.length ?? 0) > 420 && !isOverviewExpanded && (
                    <div className="pt-2 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOverviewExpanded(true)}
                        className="h-6.5 text-[11px] font-medium gap-1 rounded-full px-3 border-border/80 bg-surface shadow-2xs hover:bg-surface-elevated"
                      >
                        <span>Read full job description</span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* Core Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ParamCard
                  icon={Briefcase}
                  label="Employment"
                  value={job.employmentType || "Full-time"}
                />
                <ParamCard
                  icon={Layers}
                  label="Experience"
                  value={job.experience || "Not specified"}
                />
                <ParamCard
                  icon={GraduationCap}
                  label="Education"
                  value={job.education || "Any background"}
                />
                <ParamCard
                  icon={DollarSign}
                  label="Compensation"
                  value={formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                />
              </div>

              {/* Responsibilities list if structured array is available */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Key Responsibilities
                  </h3>
                  <div className="rounded-xl border border-border/80 bg-surface-elevated/20 p-3.5">
                    <ul className="space-y-1.5 text-[12.5px] leading-normal text-foreground/85">
                      {job.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Requirements list if structured array is available */}
              {job.requirements && job.requirements.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Qualifications & Requirements
                  </h3>
                  <div className="rounded-xl border border-border/80 bg-surface-elevated/20 p-3.5">
                    <ul className="space-y-1.5 text-[12.5px] leading-normal text-foreground/85">
                      {job.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Tech Stack Chips */}
              {job.techStack && job.techStack.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Target Technologies
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-border/80 bg-surface-elevated/40 px-2.5 py-1 text-xs font-mono text-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Recruiter Note if available */}
              {job.recruiterNote && (
                <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-4 text-xs italic text-foreground/90">
                  &ldquo;{job.recruiterNote}&rdquo;
                </div>
              )}
            </>
          ) : (
            <AIInsights
              job={job}
              matchResult={matchResult}
              isMatching={isMatching}
              onRunMatch={onRunMatch}
              onOptimizeResume={onEditResume}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ParamCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-surface-elevated/30 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3 text-primary/80" />
        {label}
      </div>
      <div className="mt-1 truncate text-xs font-medium text-foreground">{value}</div>
    </div>
  );
}

export function JobDetailsEmpty() {
  return (
    <div className="grid h-full place-items-center p-8 text-center select-none">
      <div className="max-w-[280px] space-y-3">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-surface-elevated/60 text-muted-foreground border border-border/60">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Select an opportunity</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Choose a job from the list to view the full brief, qualifications, and instant resume
            fit analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
