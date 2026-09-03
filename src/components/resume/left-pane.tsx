import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeOnly } from '@/lib/motion';
import {
  Sparkles,
  Target,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  ListChecks,
  Gauge,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-tooltip";
import { useVersions } from "@/hooks/api/useVersions";
import { useResumeCompleteness } from "@/hooks/api/useResumes";
import { optimizationApi } from "@/api/optimization";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGenerateSkillsOptimization,
  useGenerateSummaryOptimization,
} from "@/hooks/api/useOptimization";
import type { OptimizationSession, OptimizationSuggestion } from "@/types/optimization";
import type { AtsAnalysisResult } from "@/api/ats";
import { buildAtsRequirementViews, atsRequirementDomId } from "@/lib/ats-evidence-view";
import { interpretAtsScore, summarizeRequirementCoverage } from "@/lib/ats-evidence-view";
import { partitionRecommendations } from "@/lib/ats-evidence-view";
import type { EvidenceLocationMap } from "@/lib/evidence-location";
import { AtsEvidenceList } from "@/components/resume/ats-evidence-list";

function PaneSection({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={staggerItem}
      initial="hidden"
      animate="show"
    >
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}

function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
  isPending,
}: {
  suggestion: OptimizationSuggestion;
  onAccept: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  const [state, setState] = useState<'idle' | 'accepting' | 'rejecting'>('idle');
  const reducedMotion = useReducedMotion();

  const handleAccept = () => {
    if (reducedMotion) { onAccept(); return; }
    setState('accepting');
    setTimeout(() => onAccept(), 220);
  };
  const handleReject = () => {
    if (reducedMotion) { onReject(); return; }
    setState('rejecting');
    setTimeout(() => onReject(), 220);
  };

  const evidenceList = Array.isArray(suggestion.evidence)
    ? suggestion.evidence.filter(Boolean).join(", ")
    : typeof suggestion.evidence === "string"
      ? suggestion.evidence
      : "";

  const keywords = Array.isArray(suggestion.affectedKeywords)
    ? suggestion.affectedKeywords.filter(Boolean)
    : [];

  return (
    <motion.div
      className="space-y-2.5 p-3 text-left transition-colors hover:bg-surface-elevated/40 rounded-lg"
      animate={{
        opacity: state === 'idle' ? 1 : 0,
        x: state === 'accepting' ? 20 : state === 'rejecting' ? -20 : 0,
        scale: state === 'idle' ? 1 : 0.96,
      }}
      transition={{ duration: 0.2, ease: [0.45, 0, 0.55, 1] }}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className="rounded-md border-border/60 bg-background/50 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wider text-primary"
        >
          {suggestion.section || suggestion.type}
        </Badge>
        <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          {suggestion.priority} priority
        </span>
      </div>

      {suggestion.currentText && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Current / Weak
          </span>
          <div className="text-xs text-muted-foreground/85 line-through decoration-destructive/60 rounded bg-destructive/5 border border-destructive/15 p-2">
            {suggestion.currentText}
          </div>
        </div>
      )}

      {suggestion.suggestedText && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Proposed Improvement
          </span>
          <div className="text-xs font-medium text-foreground rounded bg-emerald-500/10 border border-emerald-500/20 p-2 leading-relaxed">
            {suggestion.suggestedText}
          </div>
        </div>
      )}

      {suggestion.explanation && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Why It Matters
          </span>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {suggestion.explanation}
          </p>
        </div>
      )}

      {evidenceList && (
        <div className="rounded bg-surface-elevated/50 border border-border/50 p-2 text-[10.5px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground/90">Resume Evidence: </span>
          {evidenceList}
        </div>
      )}

      {keywords.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Target Keywords
          </span>
          <div className="flex flex-wrap gap-1">
            {keywords.map((kw) => (
              <Badge
                key={kw}
                variant="secondary"
                className="rounded text-[9.5px] font-normal px-1.5 py-0 border border-border/60"
              >
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-7 flex-1 rounded-md text-xs font-semibold hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          onClick={handleAccept}
          disabled={isPending}
        >
          Apply
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 flex-1 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10"
          onClick={handleReject}
          disabled={isPending}
        >
          Reject
        </Button>
      </div>
    </motion.div>
  );
}

function ScoreCell({ label, score }: { label: string; score: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  return (
    <div className="space-y-1.5 rounded-lg workstation-instrument p-2 border border-border/60">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-medium">{label}</span>
        <span className="font-mono font-semibold text-foreground">{clamped}%</span>
      </div>
      <Progress value={clamped} className="h-1.5 bg-muted/60" />
    </div>
  );
}

function ChipList({
  items,
  tone,
  empty,
}: {
  items: string[] | undefined;
  tone: "positive" | "negative" | "neutral";
  empty: string;
}) {
  const list = items ?? [];
  if (list.length === 0) {
    return <div className="text-[11px] text-muted-foreground">{empty}</div>;
  }
  const toneClass =
    tone === "positive"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : tone === "negative"
        ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
        : "border-border/60 bg-surface-elevated/40 text-foreground/80";
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((item) => (
        <Badge
          key={item}
          variant="outline"
          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${toneClass}`}
        >
          {item}
        </Badge>
      ))}
    </div>
  );
}

function AtsAnalysisSummary({
  analysis,
  selectedAtsIssue,
  onSelectIssue,
  evidenceLocations,
  resumeId,
  reportId,
}: {
  analysis: AtsAnalysisResult;
  selectedAtsIssue?: string | null;
  onSelectIssue?: (id: string | null) => void;
  evidenceLocations?: EvidenceLocationMap | null;
  resumeId?: string;
  reportId?: string | null;
}) {
  const views = useMemo(() => buildAtsRequirementViews(analysis), [analysis]);
  const overall = Math.round(analysis.overall_score ?? 0);
  const scoreBand = interpretAtsScore(overall);
  const coverage = useMemo(() => summarizeRequirementCoverage(views), [views]);
  const matchedKw = analysis.matched_keywords ?? [];
  const missingKw = analysis.missing_keywords ?? [];
  const partialKw = analysis.partial_keywords ?? [];
  const matchedSkills = analysis.matched_skills ?? [];
  const missingSkills = analysis.missing_skills ?? [];
  const partialSkills = analysis.partial_skills ?? [];

  // Target 4.6: only recommendations NOT confidently attached to a requirement
  // card remain in the general list — no false attachment duplication.
  const { general: generalRecs } = useMemo(
    () => partitionRecommendations(analysis, views),
    [analysis, views],
  );
  const high = generalRecs.filter((r) => r.priority === "high").map((r) => r.text);
  const medium = generalRecs.filter((r) => r.priority === "medium").map((r) => r.text);
  const low = generalRecs.filter((r) => r.priority === "low").map((r) => r.text);
  const flat = generalRecs.filter((r) => r.priority === "general").map((r) => r.text);

  const explanation = analysis.analysis_explanation;
  const templateRating = analysis.template_analysis?.compatibility_rating;

  return (
    <div className="space-y-3">
      <Card className="workstation-panel rounded-xl border border-border/80 p-3.5 shadow-xs">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80">
              ATS Match Score
            </span>
          </div>
          <span className="font-mono text-xl font-bold text-foreground drop-shadow-[0_0_8px_var(--color-primary)]">
            {overall}%
          </span>
        </div>
        {/* Target 4.6: interpretation of alignment with the supplied job
            description only — never a hiring-probability claim. */}
        <p className="mb-2 text-[11px] font-semibold text-foreground/90">{scoreBand.label}</p>
        <Progress value={overall} className="h-2 bg-muted/80" />
        {coverage.importantTotal > 0 && (
          // Real counts from requirement_coverage — no static numbers.
          <p className="mt-2 text-[11px] text-muted-foreground font-medium">
            {coverage.importantAddressed} of {coverage.importantTotal} key requirements addressed
          </p>
        )}
        {explanation?.overall && (
          <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
            {explanation.overall}
          </p>
        )}
        {templateRating && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ListChecks className="h-3 w-3 text-primary" />
            <span>{templateRating}</span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        <ScoreCell label="Keywords" score={analysis.keyword_match_score} />
        <ScoreCell label="Skills" score={analysis.skills_match_score} />
        <ScoreCell label="Experience" score={analysis.experience_relevance_score} />
        <ScoreCell label="Qualification" score={analysis.qualification_match_score} />
        <ScoreCell label="Structure" score={analysis.structure_format_score} />
      </div>

      {views.length > 0 ? (
        // Target 4.4 / 5.2 — interactive requirement cards when requirement_coverage
        // is available from the current ATS pipeline. Keyed by requirement set
        // so a fresh analysis re-seeds the default expansion state.
        <AtsEvidenceList
          key={views.map((v) => v.id).join("|")}
          views={views}
          selectedRequirementId={selectedAtsIssue}
          onSelectRequirement={onSelectIssue}
          evidenceLocations={evidenceLocations}
          resumeId={resumeId}
          reportId={reportId}
        />
      ) : (
        <>
          {/* Target 4.6 empty state: the JD yielded no structured requirements. */}
          <p className="rounded-xl border border-border/40 p-2.5 text-[11px] text-muted-foreground">
            Not enough structured requirements were detected.
          </p>
          {(matchedKw.length > 0 || missingKw.length > 0 || partialKw.length > 0) && (
            <div className="space-y-2 rounded-xl border border-border/40 p-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Matched Keywords ({matchedKw.length})</span>
                </div>
                <ChipList items={matchedKw} tone="positive" empty="No matched keywords yet." />
              </div>
              {partialKw.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <ListChecks className="h-3 w-3" />
                    <span>Partial Keywords ({partialKw.length})</span>
                  </div>
                  <ChipList items={partialKw} tone="neutral" empty="No partial matches." />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <XCircle className="h-3 w-3 text-rose-500" />
                  <span>Missing Keywords ({missingKw.length})</span>
                </div>
                <ChipList
                  items={missingKw}
                  tone="negative"
                  empty="No missing keywords — great match."
                />
              </div>
            </div>
          )}

          {(matchedSkills.length > 0 || missingSkills.length > 0 || partialSkills.length > 0) && (
            <div className="space-y-2 rounded-xl border border-border/40 p-2.5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Matched Skills ({matchedSkills.length})</span>
                </div>
                <ChipList items={matchedSkills} tone="positive" empty="No matched skills yet." />
              </div>
              {partialSkills.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <ListChecks className="h-3 w-3" />
                    <span>Partial Skills ({partialSkills.length})</span>
                  </div>
                  <ChipList
                    items={partialSkills}
                    tone="neutral"
                    empty="No partial skill matches."
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <XCircle className="h-3 w-3 text-rose-500" />
                  <span>Missing Skills ({missingSkills.length})</span>
                </div>
                <ChipList items={missingSkills} tone="negative" empty="No missing skills." />
              </div>
            </div>
          )}
        </>
      )}

      {(high.length > 0 || medium.length > 0 || low.length > 0 || flat.length > 0) && (
        <div className="space-y-2 rounded-xl border border-border/40 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>ATS Recommendations</span>
          </div>
          {high.length > 0 && (
            <ul className="space-y-1 text-xs">
              {high.map((r) => (
                <li key={`h-${r}`} className="flex items-start gap-1.5">
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-full border-rose-500/40 bg-rose-500/10 px-1.5 py-0 text-[9px] text-rose-700 dark:text-rose-300"
                  >
                    High
                  </Badge>
                  <span className="text-foreground/90">{r}</span>
                </li>
              ))}
            </ul>
          )}
          {medium.length > 0 && (
            <ul className="space-y-1 text-xs">
              {medium.map((r) => (
                <li key={`m-${r}`} className="flex items-start gap-1.5">
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-full border-amber-500/40 bg-amber-500/10 px-1.5 py-0 text-[9px] text-amber-700 dark:text-amber-300"
                  >
                    Med
                  </Badge>
                  <span className="text-foreground/90">{r}</span>
                </li>
              ))}
            </ul>
          )}
          {low.length > 0 && (
            <ul className="space-y-1 text-xs">
              {low.map((r) => (
                <li key={`l-${r}`} className="flex items-start gap-1.5">
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-full border-sky-500/40 bg-sky-500/10 px-1.5 py-0 text-[9px] text-sky-700 dark:text-sky-300"
                  >
                    Low
                  </Badge>
                  <span className="text-foreground/90">{r}</span>
                </li>
              ))}
            </ul>
          )}
          {high.length === 0 && medium.length === 0 && low.length === 0 && flat.length > 0 && (
            <ul className="list-disc space-y-1 pl-4 text-xs text-foreground/90">
              {flat.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function LeftPane({
  currentId,
  currentVersionId,
  targetJobTitle,
  targetCompany,
  targetJobDescription,
  hasAnalysis,
  onApplySuggestion,
  onRunOptimization,
  onOpenATSDialog,
  atsAnalysis,
  isAnalyzing,
  analyzeError,
  selectedAtsIssue,
  onSelectIssue,
  evidenceLocations,
  reportId,
  isGeneratingOptimization,
  generateOptimizationError,
  onSelectVersion,
}: {
  currentId: string;
  currentVersionId: string | null;
  targetJobTitle?: string | null;
  targetCompany?: string | null;
  targetJobDescription?: string | null;
  hasAnalysis: boolean;
  onApplySuggestion?: (suggestion: OptimizationSuggestion, sessionId?: string) => void;
  onRunOptimization?: () => void;
  onOpenATSDialog?: () => void;
  atsAnalysis?: AtsAnalysisResult | null;
  isAnalyzing?: boolean;
  analyzeError?: string | null;
  selectedAtsIssue?: string | null;
  onSelectIssue?: (id: string | null) => void;
  evidenceLocations?: EvidenceLocationMap | null;
  reportId?: string | null;
  isGeneratingOptimization?: boolean;
  generateOptimizationError?: string | null;
  onSelectVersion?: (versionId: string) => void;
}) {
  const { data: versionsData, isLoading: versionsLoading } = useVersions(currentId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["optimization", "sessions", currentId],
    queryFn: () => optimizationApi.getSessions(currentId),
    enabled: Boolean(currentId),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ sessionId, suggestionId }: { sessionId: string; suggestionId: string }) =>
      optimizationApi.reject({ sessionId, suggestionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimization", "sessions", currentId] });
      toast.success("Suggestion rejected");
    },
    onError: () => toast.error("Failed to reject suggestion"),
  });

  const generateSkillsMutation = useGenerateSkillsOptimization();
  const generateSummaryMutation = useGenerateSummaryOptimization();

  const versions = versionsData?.versions ?? [];

  const latestSession = useMemo(() => {
    if (!sessionsData?.sessions?.length) return null;
    return sessionsData.sessions[0];
  }, [sessionsData]);

  const suggestions = useMemo(() => latestSession?.suggestions ?? [], [latestSession]);

  const suggestionsBySection = useMemo(() => {
    const grouped: Record<string, OptimizationSuggestion[]> = {};
    for (const record of suggestions) {
      const s = record.suggestion;
      const section = s.section || s.type || "other";
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(s);
    }
    return grouped;
  }, [suggestions]);

  const hasJobContext = Boolean(targetJobTitle && targetJobDescription?.trim());

  // PDF → ATS panel link: when a requirement is selected (from the panel or by
  // clicking a highlight in the original PDF), bring its card into view.
  useEffect(() => {
    if (!selectedAtsIssue) return;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(atsRequirementDomId(selectedAtsIssue))
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedAtsIssue]);

  return (
    <ScrollArea className="h-full">
      <motion.div
        className="flex flex-col gap-6 p-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {hasJobContext ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] p-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Target className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-foreground/90">
                  {targetJobTitle}
                </div>
                {targetCompany && (
                  <div className="truncate text-[10px] text-muted-foreground">{targetCompany}</div>
                )}
              </div>
            </div>
            {onOpenATSDialog && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/10 shrink-0"
                onClick={onOpenATSDialog}
              >
                Change
              </Button>
            )}
          </div>
        ) : (
          <Card className="glass rounded-2xl border-border/60 p-4 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary mb-3">
              <Target className="h-5 w-5" />
            </div>
            <div className="text-xs font-semibold mb-1">No job target set</div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              Compare your resume with a job to unlock ATS analysis and AI suggestions.
            </div>
            {onOpenATSDialog && (
              <Button
                size="sm"
                variant="outline"
                className="mt-3 h-8 w-full rounded-lg text-xs font-medium"
                onClick={onOpenATSDialog}
              >
                Add job description
              </Button>
            )}
          </Card>
        )}

        {hasJobContext && (
          <div className="space-y-2">
            {onRunOptimization && (
              <Button
                size="sm"
                className="w-full h-8 rounded-lg text-xs font-medium shadow-xs"
                onClick={onRunOptimization}
                disabled={isGeneratingOptimization}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {isGeneratingOptimization ? "Generating..." : "Run Optimization"}
              </Button>
            )}
            {generateOptimizationError && (
              <Card className="glass rounded-2xl border-rose-500/30 bg-rose-500/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <div className="space-y-1">
                    <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                      Optimization failed
                    </div>
                    <div className="text-[11px] leading-relaxed text-muted-foreground">
                      {generateOptimizationError}
                    </div>
                    {onRunOptimization && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1.5 h-7 rounded-md text-[11px]"
                        onClick={onRunOptimization}
                        disabled={isGeneratingOptimization}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                className="h-7 rounded-lg text-[11px]"
                onClick={() => {
                  if (!targetJobDescription?.trim()) {
                    toast.error("Job description is required for AI skills optimization");
                    return;
                  }
                  generateSkillsMutation.mutate({
                    resumeId: currentId,
                    versionId: currentVersionId || undefined,
                    jobDescription: targetJobDescription,
                    jobTitle: targetJobTitle || undefined,
                    company: targetCompany || undefined,
                  });
                }}
                disabled={generateSkillsMutation.isPending}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {generateSkillsMutation.isPending ? "Generating..." : "AI Skills"}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="h-7 rounded-lg text-[11px]"
                onClick={() => {
                  if (!targetJobDescription?.trim()) {
                    toast.error("Job description is required for AI summary optimization");
                    return;
                  }
                  generateSummaryMutation.mutate({
                    resumeId: currentId,
                    versionId: currentVersionId || undefined,
                    jobDescription: targetJobDescription,
                    jobTitle: targetJobTitle || undefined,
                    company: targetCompany || undefined,
                  });
                }}
                disabled={generateSummaryMutation.isPending}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {generateSummaryMutation.isPending ? "Generating..." : "AI Summary"}
              </Button>
            </div>
          </div>
        )}

        {hasJobContext ? (
          <PaneSection icon={Gauge} title="ATS Analysis">
            {isAnalyzing ? (
              <div className="space-y-2">
                {/* Target 4.6: name what is happening, no fake progress. */}
                <p className="text-[11px] text-muted-foreground" aria-live="polite">
                  {targetJobTitle?.trim()
                    ? `Analyzing your resume against ${targetJobTitle.trim()}${
                        targetCompany?.trim() ? ` at ${targetCompany.trim()}` : ""
                      }…`
                    : "Analyzing your resume against the job description…"}
                </p>
                <Skeleton className="h-3 w-2/3 rounded" />
                <Skeleton className="h-7 w-full rounded-xl" />
                <div className="grid grid-cols-2 gap-1.5">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg sm:col-span-2" />
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : analyzeError ? (
              <Card className="glass rounded-2xl border-rose-500/30 bg-rose-500/5 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <div className="space-y-1">
                    <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
                      ATS analysis failed
                    </div>
                    <div className="text-[11px] leading-relaxed text-muted-foreground">
                      {analyzeError}
                    </div>
                    {onOpenATSDialog && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1.5 h-7 rounded-md text-[11px]"
                        onClick={onOpenATSDialog}
                      >
                        Try again
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : atsAnalysis ? (
              <AtsAnalysisSummary
                analysis={atsAnalysis}
                selectedAtsIssue={selectedAtsIssue}
                onSelectIssue={onSelectIssue}
                evidenceLocations={evidenceLocations}
                resumeId={currentId}
                reportId={reportId}
              />
            ) : (
              <Card className="glass rounded-2xl border-border/60 p-4 text-center">
                <div className="text-xs text-muted-foreground">
                  No ATS analysis yet. Open the analyzer to compare this resume against the job
                  description.
                </div>
                {onOpenATSDialog && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 h-8 w-full rounded-lg text-xs"
                    onClick={onOpenATSDialog}
                  >
                    Run ATS Analysis
                  </Button>
                )}
              </Card>
            )}
          </PaneSection>
        ) : (
          // Target 4.6 empty state: no job context yet — say what to do next.
          <PaneSection icon={Gauge} title="ATS Analysis">
            <Card className="glass rounded-2xl border-border/60 p-4 text-center">
              <div className="text-xs text-muted-foreground">
                Add a target job to analyze your resume against.
              </div>
              {onOpenATSDialog && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 h-8 w-full rounded-lg text-xs"
                  onClick={onOpenATSDialog}
                >
                  Set Target Job
                </Button>
              )}
            </Card>
          </PaneSection>
        )}

        {hasAnalysis && (
          <PaneSection
            icon={Sparkles}
            title="AI Suggestions"
            action={
              <Badge variant="secondary" className="rounded-full text-[10px]">
                {suggestions.length}
              </Badge>
            }
          >
            {sessionsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : suggestions.length === 0 ? (
              <Card className="glass rounded-2xl border-border/60 p-4 text-center">
                <div className="text-xs text-muted-foreground">
                  Run optimization to get AI-powered suggestions.
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {Object.entries(suggestionsBySection).map(([section, items]) => (
                  <div key={section} className="space-y-1.5">
                    <div className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {section}
                    </div>
                    <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/60 bg-surface-elevated/20">
                      {items.map((suggestion) => (
                        <SuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          isPending={rejectMutation.isPending}
                          onAccept={() => {
                            if (!latestSession || !onApplySuggestion) return;
                            onApplySuggestion(suggestion, latestSession.id);
                          }}
                          onReject={() => {
                            if (!latestSession) return;
                            rejectMutation.mutate({
                              sessionId: latestSession.id,
                              suggestionId: suggestion.id,
                            });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PaneSection>
        )}

        {!hasAnalysis && hasJobContext && (
          <PaneSection icon={Sparkles} title="AI Suggestions">
            <Card className="glass rounded-2xl border-border/60 p-4 text-center">
              <div className="text-xs text-muted-foreground">
                Run ATS analysis to generate AI suggestions for your resume.
              </div>
            </Card>
          </PaneSection>
        )}

        <PaneSection icon={FileText} title="Resume Versions">
          {versionsLoading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <Card className="glass rounded-2xl border-border/60 p-4 text-center">
              <div className="text-xs text-muted-foreground">No versions yet.</div>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {versions.map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVersion?.(v.id)}
                  className={`rounded-xl border p-3 transition-all cursor-pointer ${
                    v.id === currentVersionId
                      ? "border-primary/60 bg-primary/[0.08] shadow-xs"
                      : "border-border/60 bg-surface-elevated/40 hover:bg-surface-elevated/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium">{v.version_name}</div>
                      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {new Date(v.updated_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {v.is_master && (
                        <Badge variant="secondary" className="rounded-full text-[9px]">
                          Master
                        </Badge>
                      )}
                      {v.last_ats_score != null && (
                        <span className="shrink-0 rounded-md bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">
                          {Math.round(v.last_ats_score)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PaneSection>
      </motion.div>
    </ScrollArea>
  );
}
