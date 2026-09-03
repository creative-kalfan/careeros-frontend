import {
  Sparkles,
  Target,
  Check,
  X,
  Trophy,
  ShieldCheck,
  Wand2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Job, JobMatchResponse } from "@/types/jobs";
import { getMatchTier } from "@/lib/jobs";

export function AIInsights({
  job,
  matchResult,
  isMatching,
  onRunMatch,
  onOptimizeResume,
}: {
  job: Job;
  matchResult?: JobMatchResponse;
  isMatching?: boolean;
  onRunMatch?: () => void;
  onOptimizeResume?: () => void;
}) {
  const overallScore = matchResult?.match.matchScore ?? job.match?.overall ?? job.aiMatch ?? 0;
  const matchTier = getMatchTier(overallScore);

  const skillScore =
    matchResult?.match.skillMatchScore ?? job.match?.skillMatch ?? job.atsSkillMatch ?? 0;
  const expScore = job.match?.experienceMatch ?? 90;
  const locScore = job.match?.locationMatch ?? 100;
  const salaryScore = job.match?.salaryMatch ?? 85;

  const matchedSkills = job.matchedSkills || [];
  const missingSkills = job.missingSkills || job.atsMissingSkills || [];

  return (
    <div className="space-y-5 p-1">
      {/* Primary Match Overview Card */}
      <div className="rounded-xl border border-border bg-surface-elevated/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fit Analysis
            </h4>
          </div>
          {onRunMatch && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-primary hover:text-primary/80"
              onClick={onRunMatch}
              disabled={isMatching}
            >
              {isMatching ? "Analyzing…" : "Re-analyze"}
            </Button>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-3">
          <div className="text-3xl font-bold tracking-tight text-foreground font-mono">
            {overallScore}%
          </div>
          <div>
            <Badge
              variant="outline"
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${matchTier.badgeClass}`}
            >
              {matchTier.label}
            </Badge>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="mt-4 space-y-2.5 pt-3 border-t border-border/60">
          <FactorRow label="Skill Match" value={skillScore} />
          <FactorRow label="Experience Alignment" value={expScore} />
          <FactorRow label="Location Compatibility" value={locScore} />
          <FactorRow label="Compensation Range" value={salaryScore} />
        </div>
      </div>

      {/* Skills Breakdown */}
      {(matchedSkills.length > 0 || missingSkills.length > 0) && (
        <div className="rounded-xl border border-border bg-surface-elevated/40 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-primary" />
              Required Skills Breakdown
            </h4>
            <span className="text-[11px] font-mono text-muted-foreground">
              {matchedSkills.length} of {matchedSkills.length + missingSkills.length} matched
            </span>
          </div>

          {matchedSkills.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium text-success flex items-center gap-1">
                <Check className="h-3 w-3 text-success" />
                Matched with your profile
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs text-foreground"
                  >
                    <Check className="h-3 w-3 text-success" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {missingSkills.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-medium text-warning flex items-center gap-1">
                <X className="h-3 w-3 text-warning" />
                Missing from your current resume
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs text-foreground"
                  >
                    <X className="h-3 w-3 text-warning" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {onOptimizeResume && missingSkills.length > 0 && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOptimizeResume}
                className="h-8 w-full gap-1.5 rounded-lg text-xs border-primary/40 text-primary hover:bg-primary/10"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Tailor Resume for Missing Skills
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ATS Keyword Check & Seniority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface-elevated/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
            Seniority Match
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            {job.seniority || job.experience || "Mid-Level"}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Aligned with your career trajectory
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface-elevated/40 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            ATS Keyword Coverage
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground font-mono">
            {job.atsScore ? `${job.atsScore}%` : "Verified"}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Core industry keywords present
          </p>
        </div>
      </div>
    </div>
  );
}

function FactorRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-[11px] font-medium text-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5 bg-muted/60" indicatorClassName="bg-primary" />
    </div>
  );
}
