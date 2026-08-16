import {
  MapPin,
  Briefcase,
  Share2,
  Bookmark,
  Send,
  Building2,
  Sparkles,
  GraduationCap,
  DollarSign,
  Users,
  MessageSquare,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Job } from "@/types/jobs";
import { formatSalary, statusMeta } from "@/lib/jobs";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export function JobDetails({
  job,
  onToggleBookmark,
}: {
  job: Job;
  onToggleBookmark: () => void;
}) {
  const status = statusMeta(job.status);
  return (
    <div className="flex h-full flex-col">
      <div className="glass-topbar sticky top-0 z-10 border-b border-border/60 px-5 py-4">
        <div className="flex items-start gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-base font-bold text-white shadow-elevation-2"
            style={{ background: job.companyBrand }}
          >
            {job.companyLogo}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold tracking-tight">{job.role}</h2>
              {job.status !== "not_applied" && (
                <Badge variant="outline" className={`rounded-full border text-[10px] ${status.tone}`}>
                  {status.label}
                </Badge>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground/90">{job.company}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
              <span>·</span>
              <span>{job.postedAt}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {job.match?.overall != null && (
            <span className="rounded-md bg-gradient-to-br from-primary/25 to-primary/5 px-2 py-1 font-mono text-[11px] font-semibold text-foreground ring-1 ring-primary/25">
              Match {job.match.overall}%
            </span>
          )}
          {(job.atsScore != null && job.atsScore > 0) ? (
            <span className="rounded-md bg-gradient-to-br from-accent/25 to-accent/5 px-2 py-1 font-mono text-[11px] font-semibold text-foreground ring-1 ring-accent/25">
              ATS {job.atsScore}%
            </span>
          ) : (
            <span className="rounded-md bg-gradient-to-br from-muted/25 to-muted/5 px-2 py-1 font-mono text-[11px] font-semibold text-muted-foreground ring-1 ring-border/60">
              ATS N/A
            </span>
          )}
          <Badge variant="outline" className="rounded-full border-border/60 text-[10.5px]">
            {job.workMode}
          </Badge>
          <Badge variant="outline" className="rounded-full border-border/60 text-[10.5px]">
            {job.employmentType}
          </Badge>
          <span className="ml-auto font-mono text-[11.5px] text-foreground/90">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <Button
            size="sm"
            className="h-8 flex-1 rounded-lg text-xs shadow-[var(--shadow-glow)]"
            disabled={!job.applyUrl}
            onClick={() => {
              if (job.applyUrl) {
                window.open(job.applyUrl, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {job.applyUrl ? "Direct Apply" : "No Apply Link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-xs"
            onClick={onToggleBookmark}
          >
            <Bookmark
              className="mr-1.5 h-3.5 w-3.5"
              fill={job.bookmarked ? "currentColor" : "none"}
            />
            {job.bookmarked ? "Saved" : "Save"}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="Share">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {(job.atsMissingSkills?.length ?? 0) > 0 && (
          <div className="mt-4 rounded-xl border border-border/60 bg-surface-elevated/40 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Missing Skills
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(job.atsMissingSkills ?? []).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] text-destructive"
                >
                  {skill}
                </span>
              ))}
            </div>
            {job.atsRecommendations?.length ? (
              <div className="mt-3">
                <h5 className="mb-1.5 text-[11px] font-medium text-muted-foreground">Quick Fix</h5>
                <ul className="space-y-1">
                  {job.atsRecommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="text-[11.5px] text-foreground/80">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-5">
          <Section icon={Building2} title="Company Overview">
            <p className="text-[13px] leading-relaxed text-foreground/85">{job.overview}</p>
          </Section>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetaCard icon={Briefcase} label="Employment" value={job.employmentType} />
            <MetaCard icon={Sparkles} label="Experience" value={job.experience} />
            <MetaCard icon={GraduationCap} label="Education" value={job.education ?? "Any"} />
            <MetaCard
              icon={DollarSign}
              label="Salary"
              value={formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            />
          </div>

          <Section icon={Users} title="Responsibilities">
            <ul className="space-y-2">
              {job.responsibilities.map((r) => (
                <li key={r} className="flex gap-2 text-[13px] text-foreground/85">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Sparkles} title="Requirements">
            <ul className="space-y-2">
              {job.requirements.map((r) => (
                <li key={r} className="flex gap-2 text-[13px] text-foreground/85">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Briefcase} title="Tech Stack">
            <div className="flex flex-wrap gap-1.5">
              {job.techStack.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border/60 bg-surface-elevated/50 px-2.5 py-1 text-[11.5px] text-foreground/90"
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>

          {job.benefits.length > 0 && (
            <Section icon={Sparkles} title="Benefits">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {job.benefits.map((b) => (
                  <div
                    key={b}
                    className="rounded-xl border border-border/50 bg-surface-elevated/40 px-3 py-2 text-[12.5px] text-foreground/85"
                  >
                    {b}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {job.recruiterNote && (
            <>
              <Separator />
              <Section icon={MessageSquare} title="Recruiter Notes">
                <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-3 text-[12.5px] italic text-foreground/85">
                  &ldquo;{job.recruiterNote}&rdquo;
                </div>
              </Section>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function MetaCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface-elevated/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] font-medium">{value}</div>
    </div>
  );
}

export function JobDetailsEmpty() {
  return (
    <div className="grid h-full place-items-center p-10 text-center">
      <div className="max-w-[280px]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/25">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <div className="mt-4 text-sm font-semibold">Select a role to explore</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Pick a job from the list to see the full brief and your AI fit analysis.
        </div>
      </div>
    </div>
  );
}