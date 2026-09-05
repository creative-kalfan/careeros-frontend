import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import {
  Sparkles,
  Target,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
  ListChecks,
  Gauge,
  Loader2,
  GripVertical,
  Plus,
  Wand2,
  TrendingUp,
  ArrowRight,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-tooltip";
import { useVersions } from "@/hooks/api/useVersions";
import { optimizationApi } from "@/api/optimization";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useGenerateSkillsOptimization,
  useGenerateSummaryOptimization,
} from "@/hooks/api/useOptimization";
import type {
  OptimizationSuggestion,
  TailoringPlanItem,
  TailorResumeResponse,
  ATSScoreComparison,
} from "@/types/optimization";
import type { AtsAnalysisResult } from "@/api/ats";
import { buildAtsRequirementViews, atsRequirementDomId } from "@/lib/ats-evidence-view";
import { interpretAtsScore, summarizeRequirementCoverage } from "@/lib/ats-evidence-view";
import { partitionRecommendations } from "@/lib/ats-evidence-view";
import type { EvidenceLocationMap } from "@/lib/evidence-location";
import { AtsEvidenceList } from "@/components/resume/ats-evidence-list";

function TailoringPlanCard({ planItem }: { planItem: TailoringPlanItem }) {
  const actionColor =
    planItem.action === "REWRITE"
      ? "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10"
      : planItem.action === "EMPHASIZE"
        ? "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
        : planItem.action === "ALIGN"
          ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
          : "text-muted-foreground border-border/50 bg-muted/10";

  return (
    <div className="space-y-2 p-3 text-left rounded-lg border border-border/50 bg-surface/40 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className="rounded-md border-border/60 bg-background/60 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wider text-primary"
        >
          {planItem.section}
        </Badge>
        <Badge variant="outline" className={`rounded text-[9.5px] font-semibold uppercase ${actionColor}`}>
          {planItem.action}
        </Badge>
      </div>

      {planItem.reasoning && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {planItem.reasoning}
        </p>
      )}

      {planItem.currentText && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Current
          </span>
          <div className="text-xs text-muted-foreground/85 line-through decoration-destructive/60 rounded bg-destructive/5 border border-destructive/15 p-2 leading-relaxed">
            {planItem.currentText}
          </div>
        </div>
      )}

      {planItem.suggestedText && (
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Tailored Text
          </span>
          <div className="text-xs font-medium text-foreground rounded bg-emerald-500/10 border border-emerald-500/20 p-2 leading-relaxed">
            {planItem.suggestedText}
          </div>
        </div>
      )}

      {planItem.keywordsAddressed && planItem.keywordsAddressed.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Keywords Addressed
          </span>
          <div className="flex flex-wrap gap-1">
            {planItem.keywordsAddressed.map((kw) => (
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
    </div>
  );
}


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
    <motion.section variants={staggerItem} initial="hidden" animate="show">
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
  const [state, setState] = useState<"idle" | "accepting" | "rejecting">("idle");
  const reducedMotion = useReducedMotion();

  const handleAccept = () => {
    if (reducedMotion) {
      onAccept();
      return;
    }
    setState("accepting");
    setTimeout(() => onAccept(), 220);
  };
  const handleReject = () => {
    if (reducedMotion) {
      onReject();
      return;
    }
    setState("rejecting");
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

  // Determine action button label
  const section = (suggestion.section || suggestion.type || "").toLowerCase();
  const isSummary = section.includes("summary") || suggestion.type === "professional_summary";
  const isBullet =
    section.includes("experience") ||
    suggestion.type === "experience_bullet" ||
    section.includes("internship");
  const isSkills =
    section.includes("skill") ||
    suggestion.type === "skills_alignment" ||
    suggestion.type === "keyword_placement";

  const actionLabel = isSummary
    ? "Replace Summary"
    : isBullet
      ? "Replace Bullet"
      : isSkills
        ? "Add to Skills"
        : "Apply";

  return (
    <motion.div
      animate={{
        opacity: state === "idle" ? 1 : 0,
        x: state === "accepting" ? 20 : state === "rejecting" ? -20 : 0,
        scale: state === "idle" ? 1 : 0.96,
      }}
      transition={{ duration: 0.2, ease: [0.45, 0, 0.55, 1] }}
    >
      <div
        draggable={true}
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
          const payload = JSON.stringify(suggestion);
          e.dataTransfer.setData("application/json", payload);
          e.dataTransfer.setData("text/plain", suggestion.suggestedText || "");
          e.dataTransfer.effectAllowed = "copy";
        }}
        className="space-y-2.5 p-3 text-left transition-all hover:bg-surface-elevated/50 rounded-lg border border-border/50 bg-surface/40 cursor-grab active:cursor-grabbing hover:border-primary/40 shadow-2xs"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
            <Badge
              variant="outline"
              className="rounded-md border-border/60 bg-background/60 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wider text-primary"
            >
              {suggestion.section || suggestion.type}
            </Badge>
          </div>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {suggestion.priority} priority
          </span>
        </div>

        {suggestion.currentText && (
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Current / Weak
            </span>
            <div className="text-xs text-muted-foreground/85 line-through decoration-destructive/60 rounded bg-destructive/5 border border-destructive/15 p-2 leading-relaxed">
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

        <div className="pt-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 flex-1 rounded-md text-xs font-semibold hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              onClick={handleAccept}
              disabled={isPending}
            >
              {actionLabel}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-16 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10"
              onClick={handleReject}
              disabled={isPending}
            >
              Reject
            </Button>
          </div>
          <div className="text-[9.5px] text-muted-foreground/70 flex items-center justify-center gap-1 italic select-none">
            <GripVertical className="h-2.5 w-2.5" />
            <span>Drag to section or click {actionLabel}</span>
          </div>
        </div>
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
  onAddSkill,
}: {
  items: string[] | undefined;
  tone: "positive" | "negative" | "neutral";
  empty: string;
  onAddSkill?: (skill: string) => void;
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
          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 ${toneClass}`}
        >
          <span>{item}</span>
          {onAddSkill && tone === "negative" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddSkill(item);
              }}
              title={`Add "${item}" to resume skills`}
              className="ml-0.5 rounded-full hover:bg-rose-500/20 p-0.5 text-rose-700 dark:text-rose-300 transition-colors"
            >
              <Plus className="h-2.5 w-2.5" />
            </button>
          )}
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
  onAddSkill,
}: {
  analysis: AtsAnalysisResult;
  selectedAtsIssue?: string | null;
  onSelectIssue?: (id: string | null) => void;
  evidenceLocations?: EvidenceLocationMap | null;
  resumeId?: string;
  reportId?: string | null;
  onAddSkill?: (skill: string) => void;
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
        <p className="mb-2 text-[11px] font-semibold text-foreground/90">{scoreBand.label}</p>
        <Progress value={overall} className="h-2 bg-muted/80" />
        {coverage.importantTotal > 0 && (
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
        <ScoreCell label="Qualifications" score={analysis.qualification_match_score} />
        <ScoreCell label="Structure" score={analysis.structure_format_score} />
      </div>

      {views.length > 0 ? (
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
                  onAddSkill={onAddSkill}
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
                <ChipList
                  items={missingSkills}
                  tone="negative"
                  empty="No missing skills."
                  onAddSkill={onAddSkill}
                />
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
  activeSuggestions,
  activeSessionId,
  onAddSkill,
  onApplyTailoring,
  isApplyingTailoring,
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
  activeSuggestions?: OptimizationSuggestion[] | null;
  activeSessionId?: string | null;
  onAddSkill?: (skill: string) => void;
  onApplyTailoring?: (
    tailoredProfile: Record<string, unknown>,
    plan: TailoringPlanItem[],
    jobTitle?: string,
    company?: string,
    jobDescription?: string,
  ) => Promise<void>;
  isApplyingTailoring?: boolean;
}) {
  const { data: versionsData, isLoading: versionsLoading } = useVersions(currentId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [tailorResult, setTailorResult] = useState<TailorResumeResponse | null>(null);

  const tailorMutation = useMutation({
    mutationFn: (data: {
      resumeId: string;
      versionId?: string;
      jobDescription: string;
      jobTitle?: string;
      company?: string;
    }) => optimizationApi.tailor(data),
    onSuccess: (res) => {
      if (res.success) {
        setTailorResult(res);
        toast.success(res.message || "Whole resume tailored successfully!");
      }
    },
    onError: (err: any) => {
      toast.error(err instanceof Error ? err.message : "Whole resume tailoring failed");
    },
  });

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

  // Combine active suggestions passed directly from mutation with session query suggestions
  const effectiveSuggestions: OptimizationSuggestion[] = useMemo(() => {
    if (activeSuggestions && activeSuggestions.length > 0) {
      return activeSuggestions;
    }
    return latestSession?.suggestions?.map((s) => s.suggestion) ?? [];
  }, [activeSuggestions, latestSession]);

  const effectiveSessionId = activeSessionId || latestSession?.id;

  // Clear grouping: Summary, Experience bullets, Skills & Keywords, Other
  const groupedSuggestions = useMemo(() => {
    const summary: OptimizationSuggestion[] = [];
    const experience: OptimizationSuggestion[] = [];
    const skills: OptimizationSuggestion[] = [];
    const other: OptimizationSuggestion[] = [];

    for (const s of effectiveSuggestions) {
      const sec = (s.section || s.type || "").toLowerCase();
      if (sec.includes("summary") || s.type === "professional_summary") {
        summary.push(s);
      } else if (
        sec.includes("experience") ||
        s.type === "experience_bullet" ||
        sec.includes("internship")
      ) {
        experience.push(s);
      } else if (
        sec.includes("skill") ||
        s.type === "skills_alignment" ||
        s.type === "keyword_placement"
      ) {
        skills.push(s);
      } else {
        other.push(s);
      }
    }

    return { summary, experience, skills, other };
  }, [effectiveSuggestions]);

  // State machine for Run Optimization button: IDLE -> GENERATING -> RESULTS_AVAILABLE
  type OptimizationStatus = "IDLE" | "GENERATING" | "RESULTS_AVAILABLE";
  const optimizationStatus: OptimizationStatus = useMemo(() => {
    if (isGeneratingOptimization) return "GENERATING";
    if (effectiveSuggestions.length > 0) return "RESULTS_AVAILABLE";
    return "IDLE";
  }, [isGeneratingOptimization, effectiveSuggestions.length]);

  const hasJobContext = Boolean(targetJobTitle && targetJobDescription?.trim());

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
          <div className="space-y-3">
            {/* Whole Resume Tailoring Section */}
            <div className="space-y-2.5 rounded-xl border border-primary/20 bg-primary/[0.03] p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/90">
                    Whole Resume Tailoring
                  </span>
                </div>
                {tailorResult && (
                  <Badge variant="outline" className="rounded-full border-emerald-500/30 bg-emerald-500/10 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    +{Math.round(tailorResult.scoreComparison.delta)}% ATS Projected
                  </Badge>
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Synthesizes a cohesive, targeted resume summary, prioritized skills, and refined experience bullets aligned with the job.
              </p>

              <Button
                size="sm"
                className="w-full h-8 rounded-lg text-xs font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  if (!targetJobDescription?.trim()) {
                    toast.error("Job description is required for whole resume tailoring");
                    return;
                  }
                  tailorMutation.mutate({
                    resumeId: currentId,
                    versionId: currentVersionId || undefined,
                    jobDescription: targetJobDescription,
                    jobTitle: targetJobTitle || undefined,
                    company: targetCompany || undefined,
                  });
                }}
                disabled={tailorMutation.isPending || isApplyingTailoring}
              >
                {tailorMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Tailoring Entire Resume...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                    {tailorResult ? "Re-tailor Entire Resume" : "Tailor Entire Resume"}
                  </>
                )}
              </Button>

              {tailorResult && (
                <div className="space-y-3 pt-1">
                  {/* ATS Score Comparison Badge */}
                  <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-background/80 p-2.5">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Projected ATS Score
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
                          <span>{Math.round(tailorResult.scoreComparison.baselineScore)}%</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {Math.round(tailorResult.scoreComparison.tailoredScore)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {tailorResult.scoreComparison.delta >= 0 && (
                      <Badge className="rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10.5px] font-bold">
                        +{Math.round(tailorResult.scoreComparison.delta)}% Match
                      </Badge>
                    )}
                  </div>

                  <div className="text-[10.5px] text-muted-foreground px-0.5 flex justify-between">
                    <span>
                      Keywords Matched: <strong className="text-foreground">{tailorResult.scoreComparison.matchedKeywordsCount}</strong>
                    </span>
                    <span>
                      Missing: <strong className="text-foreground">{tailorResult.scoreComparison.missingKeywordsCount}</strong>
                    </span>
                  </div>

                  {/* Tailoring Plan Preview */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary flex items-center justify-between">
                      <span>Tailoring Plan Actions</span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {tailorResult.plan.length}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {tailorResult.plan.map((item, idx) => (
                        <TailoringPlanCard key={`${item.section}-${idx}`} planItem={item} />
                      ))}
                    </div>
                  </div>

                  {/* Apply & Compile CTA */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Button
                      size="sm"
                      className="h-8 w-full rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={async () => {
                        if (!onApplyTailoring) return;
                        await onApplyTailoring(
                          tailorResult.tailoredProfile,
                          tailorResult.plan,
                          targetJobTitle || undefined,
                          targetCompany || undefined,
                          targetJobDescription || undefined,
                        );
                        setTailorResult(null);
                      }}
                      disabled={isApplyingTailoring}
                    >
                      {isApplyingTailoring ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Compiling PDF & Saving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Apply Tailoring & Save Version
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-full text-[10.5px] text-muted-foreground hover:text-foreground"
                      onClick={() => setTailorResult(null)}
                      disabled={isApplyingTailoring}
                    >
                      Dismiss Preview
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Granular Section Optimization */}
            {onRunOptimization && (
              <Button
                size="sm"
                className="w-full h-8 rounded-lg text-xs font-semibold shadow-xs"
                onClick={onRunOptimization}
                disabled={optimizationStatus === "GENERATING"}
              >
                {optimizationStatus === "GENERATING" ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Generating Suggestions...
                  </>
                ) : optimizationStatus === "RESULTS_AVAILABLE" ? (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
                    Re-run Optimization ({effectiveSuggestions.length} available)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Run Optimization
                  </>
                )}
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
                onAddSkill={onAddSkill}
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

        {/* AI Suggestions Section with Clear Groupings */}
        {hasAnalysis && (
          <PaneSection
            icon={Sparkles}
            title="AI Suggestions"
            action={
              <Badge variant="secondary" className="rounded-full text-[10px]">
                {effectiveSuggestions.length}
              </Badge>
            }
          >
            {sessionsLoading && !activeSuggestions ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : effectiveSuggestions.length === 0 ? (
              <Card className="glass rounded-2xl border-border/60 p-4 text-center">
                <div className="text-xs text-muted-foreground">
                  Run optimization to get AI-powered suggestions.
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* 1. Summary Suggestions */}
                {groupedSuggestions.summary.length > 0 && (
                  <div className="space-y-2">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary flex items-center justify-between">
                      <span>Summary Improvements</span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {groupedSuggestions.summary.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupedSuggestions.summary.map((suggestion) => (
                        <SuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          isPending={rejectMutation.isPending}
                          onAccept={() => {
                            if (!onApplySuggestion) return;
                            onApplySuggestion(suggestion, effectiveSessionId);
                          }}
                          onReject={() => {
                            if (!effectiveSessionId) return;
                            rejectMutation.mutate({
                              sessionId: effectiveSessionId,
                              suggestionId: suggestion.id,
                            });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Experience Bullet Suggestions */}
                {groupedSuggestions.experience.length > 0 && (
                  <div className="space-y-2">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary flex items-center justify-between">
                      <span>Experience Bullet Rewrites</span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {groupedSuggestions.experience.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupedSuggestions.experience.map((suggestion) => (
                        <SuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          isPending={rejectMutation.isPending}
                          onAccept={() => {
                            if (!onApplySuggestion) return;
                            onApplySuggestion(suggestion, effectiveSessionId);
                          }}
                          onReject={() => {
                            if (!effectiveSessionId) return;
                            rejectMutation.mutate({
                              sessionId: effectiveSessionId,
                              suggestionId: suggestion.id,
                            });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Skills & Keywords Suggestions */}
                {groupedSuggestions.skills.length > 0 && (
                  <div className="space-y-2">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary flex items-center justify-between">
                      <span>Skills & Keyword Additions</span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {groupedSuggestions.skills.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupedSuggestions.skills.map((suggestion) => (
                        <SuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          isPending={rejectMutation.isPending}
                          onAccept={() => {
                            if (!onApplySuggestion) return;
                            onApplySuggestion(suggestion, effectiveSessionId);
                          }}
                          onReject={() => {
                            if (!effectiveSessionId) return;
                            rejectMutation.mutate({
                              sessionId: effectiveSessionId,
                              suggestionId: suggestion.id,
                            });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Other Suggestions */}
                {groupedSuggestions.other.length > 0 && (
                  <div className="space-y-2">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground flex items-center justify-between">
                      <span>Other Suggestions</span>
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {groupedSuggestions.other.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupedSuggestions.other.map((suggestion) => (
                        <SuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          isPending={rejectMutation.isPending}
                          onAccept={() => {
                            if (!onApplySuggestion) return;
                            onApplySuggestion(suggestion, effectiveSessionId);
                          }}
                          onReject={() => {
                            if (!effectiveSessionId) return;
                            rejectMutation.mutate({
                              sessionId: effectiveSessionId,
                              suggestionId: suggestion.id,
                            });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
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
