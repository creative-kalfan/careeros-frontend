import { useState, useCallback, useEffect } from "react";
import {
  Minus,
  Plus,
  Maximize2,
  Download,
  Printer,
  FileText,
  AlertTriangle,
  Loader2,
  Eye,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ResumeData, ResumeProfile } from "@/types/resume";
import { TemplatePreview } from "@/components/resume/templates/template-preview";
import { PdfCanvasPreview } from "@/components/resume/pdf-canvas-preview";
import type { AtsRequirementCoverage } from "@/api/ats";
import type { EvidenceLocationMap } from "@/lib/evidence-location";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/** Adds subtle perspective tilt to the document — degrades gracefully on mobile/reduced-motion. */
function SpatialDocumentStage({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 30 });

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateY.set(dx * 2.5);
    rotateX.set(-dy * 1.5);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  if (reducedMotion) {
    return <div className="flex min-h-full items-start justify-center p-6 sm:p-10">{children}</div>;
  }

  return (
    <motion.div
      className="flex min-h-full items-start justify-center p-6 sm:p-10"
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ perspective: "1400px" }}
    >
      <motion.div
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
        }}
        initial={{ opacity: 0, y: 24, rotateX: 3 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

export type DocumentPreviewMode = "original" | "canonical";

interface PreviewPaneProps {
  resume: ResumeData;
  templateSlug?: string;
  originalFileUrl?: string | null;
  originalFilename?: string | null;
  isScanning?: boolean;
  atsIssues?: string[];
  onSelectIssue?: (issue: string) => void;
  requirementCoverage?: AtsRequirementCoverage[];
  evidenceLocations?: EvidenceLocationMap | null;
  onEvidenceLocationsChange?: (locations: EvidenceLocationMap | null) => void;
  selectedRequirementId?: string | null;
  selectedTargetId?: string | null;
  onSelectElement?: (elementId: string, section: string) => void;
  onExportPdf?: () => void;
  documentMode?: DocumentPreviewMode;
  onDocumentModeChange?: (mode: DocumentPreviewMode) => void;
  isDocumentLoading?: boolean;
}

export function PreviewPane({
  resume,
  templateSlug,
  originalFileUrl,
  originalFilename,
  isScanning = false,
  atsIssues = [],
  onSelectIssue,
  requirementCoverage,
  evidenceLocations,
  onEvidenceLocationsChange,
  selectedRequirementId,
  selectedTargetId,
  onSelectElement,
  onExportPdf,
  documentMode = "original",
  onDocumentModeChange,
  isDocumentLoading = false,
}: PreviewPaneProps) {
  const [zoom, setZoom] = useState(100);
  const [previewError, setPreviewError] = useState(false);

  const isPdf = originalFilename?.toLowerCase().endsWith(".pdf") ?? false;
  const isOriginalPdfExpected = Boolean(isPdf && !previewError && !templateSlug);

  const change = (dir: 1 | -1) => {
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + dir * ZOOM_STEP)));
  };

  const handlePreviewError = useCallback(() => {
    setPreviewError(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Bidirectional sync: when selectedTargetId or selectedRequirementId changes, smooth-scroll to it
  useEffect(() => {
    if (!selectedTargetId && !selectedRequirementId) return;
    const targetKey = selectedTargetId || selectedRequirementId;
    if (!targetKey) return;

    const normalizedKey = targetKey.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const targetEl =
      document.querySelector(`[data-resume-bullet-id="${targetKey}"]`) ||
      document.querySelector(`[data-resume-item-id="${targetKey}"]`) ||
      document.querySelector(`[data-resume-section="${targetKey}"]`) ||
      document.getElementById(`resume-bullet-${targetKey}`) ||
      document.getElementById(`resume-item-${targetKey}`) ||
      document.getElementById(`resume-section-${targetKey}`) ||
      document.getElementById(`resume-skill-${normalizedKey}`) ||
      document.getElementById(targetKey);

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedTargetId, selectedRequirementId]);

  const activeMode: DocumentPreviewMode = templateSlug || previewError ? "canonical" : documentMode;
  const showOriginalPdf = Boolean(
    activeMode === "original" && originalFileUrl && isPdf && !previewError,
  );
  const isAwaitingPdf = Boolean(
    activeMode === "original" && isOriginalPdfExpected && !originalFileUrl && !previewError,
  );
  const scanActive = isScanning && showOriginalPdf;

  return (
    <div className="flex h-full flex-col bg-background select-none">
      {/* Professional Workspace Toolbar */}
      <div className="workstation-panel flex items-center gap-2 border-b border-border/80 px-4 py-2 shrink-0 z-10 shadow-xs">
        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border/80 bg-surface-instrument/80 p-0.5 shadow-inner-recessed">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => change(-1)}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
            aria-label="Zoom out"
            disabled={zoom <= ZOOM_MIN}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset to 100%"
            className="w-12 text-center font-mono text-[11px] tabular-nums font-semibold text-foreground hover:bg-surface-elevated rounded py-0.5 transition-colors"
          >
            {zoom}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => change(1)}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
            aria-label="Zoom in"
            disabled={zoom >= ZOOM_MAX}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
          onClick={() => setZoom(100)}
          aria-label="Actual size"
          title="Actual size (100%)"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-5 bg-border/60" />

        {/* Mode Switcher / Format Indicator */}
        {isPdf && !previewError && !templateSlug && onDocumentModeChange ? (
          <div className="flex items-center rounded-lg border border-border/70 bg-surface-elevated/50 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onDocumentModeChange("original")}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                activeMode === "original"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3 w-3" />
              Original PDF
            </button>
            <button
              type="button"
              onClick={() => onDocumentModeChange("canonical")}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                activeMode === "canonical"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCode2 className="h-3 w-3" />
              Live Resume
            </button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="rounded-md border-border/80 bg-surface-elevated/40 px-2 py-0.5 text-[10.5px] font-normal text-muted-foreground"
          >
            {showOriginalPdf
              ? "Original PDF Document"
              : templateSlug
                ? `Template: ${templateSlug}`
                : "A4 · Recruiter Standard"}
          </Badge>
        )}

        {scanActive && (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10.5px] font-medium text-primary shadow-2xs"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
            Scanning resume…
          </span>
        )}

        {/* Right Action Controls */}
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            onClick={handlePrint}
            aria-label="Print document"
            title="Print resume"
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
          {onExportPdf && (
            <Button
              size="sm"
              onClick={onExportPdf}
              className="h-7 rounded-md text-xs font-medium px-2.5 shadow-2xs"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export PDF
            </Button>
          )}
        </div>
      </div>

      {/* Neutral Dark Document Workbench Canvas */}
      <ScrollArea className="flex-1 bg-zinc-950/95 dark:bg-[#090a0d] bg-cockpit-grid">
        {isAwaitingPdf || isDocumentLoading ? (
          // Stable loading state — NEVER flashes raw/stale text while PDF or profile is resolving
          <div className="flex min-h-full items-start justify-center p-6 sm:p-10">
            <div
              className="transition-transform duration-100 ease-out origin-top flex flex-col items-center"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <A4DocumentSkeleton />
            </div>
          </div>
        ) : (
          <SpatialDocumentStage>
            {showOriginalPdf && originalFileUrl ? (
              // Original-PDF branch: PDF.js renders the actual uploaded document bytes.
              <div className="w-full flex justify-center">
                <PdfCanvasPreview
                  url={originalFileUrl}
                  zoom={zoom / 100}
                  onError={handlePreviewError}
                  isScanning={scanActive}
                  highlightStrings={atsIssues}
                  onSelectIssue={onSelectIssue}
                  requirementCoverage={requirementCoverage}
                  evidenceLocations={evidenceLocations}
                  onEvidenceLocationsChange={onEvidenceLocationsChange}
                  selectedRequirementId={selectedRequirementId}
                />
              </div>
            ) : originalFileUrl && !isPdf ? (
              <Card className="mx-auto w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.65)] ring-1 ring-black/15 flex items-center justify-center p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-sm font-medium">Original document: {originalFilename}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    DOCX preview not available in browser. Showing reconstructed recruiter view below.
                  </p>
                </div>
              </Card>
            ) : (
              <div
                className="transition-transform duration-100 ease-out origin-top flex flex-col items-center"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top center",
                }}
              >
                {previewError && originalFileUrl && isPdf && (
                  <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center max-w-md">
                    <AlertTriangle className="h-5 w-5 mx-auto text-destructive" />
                    <p className="mt-2 text-xs font-semibold text-destructive">
                      Could not render original PDF
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Displaying reconstructed document representation.
                    </p>
                  </div>
                )}
                {templateSlug ? (
                  <TemplatePreviewWrapper resume={resume} templateSlug={templateSlug} />
                ) : (
                  <A4Page
                    resume={resume}
                    selectedTargetId={selectedTargetId}
                    onSelectElement={onSelectElement}
                  />
                )}
              </div>
            )}
          </SpatialDocumentStage>
        )}
      </ScrollArea>
    </div>
  );
}

// 794 × 1123 px ≈ A4 at 96dpi
export function A4Page({
  resume,
  selectedTargetId,
  onSelectElement,
}: {
  resume: ResumeData;
  selectedTargetId?: string | null;
  onSelectElement?: (elementId: string, section: string) => void;
}) {
  const contact = resume.contact;

  const hasContactInfo = Boolean(
    contact.fullName ||
    contact.headline ||
    contact.email ||
    contact.phone ||
    contact.location ||
    contact.website ||
    contact.linkedin ||
    contact.github,
  );

  const hasSummary = Boolean(resume.summary?.trim());
  const hasExperience = Boolean(resume.experience?.length > 0);
  const hasInternships = Boolean(resume.internships?.length > 0);
  const hasEducation = Boolean(resume.education?.length > 0);
  const hasSkills = Boolean(resume.skills?.length > 0);
  const hasProjects = Boolean(resume.projects?.length > 0);
  const hasCertifications = Boolean(resume.certifications?.length > 0);
  const hasAchievements = Boolean(resume.achievements?.length > 0);
  const hasLeadership = Boolean(resume.leadership?.length > 0);
  const hasLanguages = Boolean(resume.languages?.length > 0);
  const hasLinks = Boolean(resume.links?.length > 0);
  const hasAdditional = Boolean(resume.additional?.length > 0);

  return (
    <article
      className="mx-auto rounded-xs bg-white text-[#0f172a] document-paper ring-1 ring-black/10 select-text relative transition-all"
      style={{
        width: 794,
        minHeight: 1123,
        padding: "48px 56px",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Header & Contact Information */}
      {hasContactInfo && (
        <header
          id="resume-section-contact"
          data-resume-section="contact"
          onClick={() => onSelectElement?.("contact", "contact")}
          className={`border-b border-slate-200 pb-4 mb-5 transition-colors rounded p-1 -m-1 ${
            selectedTargetId === "contact"
              ? "ring-2 ring-primary/60 bg-primary/[0.04]"
              : "hover:bg-slate-50/50 cursor-pointer"
          }`}
        >
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
            {contact.fullName || "Resume"}
          </h1>
          {contact.headline && (
            <p className="mt-0.5 text-[13px] font-medium text-slate-600">{contact.headline}</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-600">
            {contact.email && <span>{contact.email}</span>}
            {contact.phone && (
              <>
                <span className="text-slate-300">·</span>
                <span>{contact.phone}</span>
              </>
            )}
            {contact.location && (
              <>
                <span className="text-slate-300">·</span>
                <span>{contact.location}</span>
              </>
            )}
            {contact.website && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-blue-700">{contact.website}</span>
              </>
            )}
            {contact.linkedin && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-blue-700">{contact.linkedin}</span>
              </>
            )}
            {contact.github && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-blue-700">{contact.github}</span>
              </>
            )}
          </div>
        </header>
      )}

      <div className="space-y-5">
        {/* Professional Summary */}
        {hasSummary && (
          <section
            id="resume-section-summary"
            data-resume-section="summary"
            onClick={() => onSelectElement?.("summary", "summary")}
            className={`transition-colors rounded p-1.5 -m-1.5 ${
              selectedTargetId === "summary"
                ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                : "hover:bg-slate-50/50 cursor-pointer"
            }`}
          >
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="text-[12px] leading-relaxed text-slate-700">{resume.summary}</p>
          </section>
        )}

        {/* Experience */}
        {hasExperience && (
          <section id="resume-section-experience" data-resume-section="experience">
            <SectionTitle>Professional Experience</SectionTitle>
            <div className="space-y-3.5">
              {resume.experience.map((e) => (
                <div
                  key={e.id}
                  id={`resume-item-${e.id}`}
                  data-resume-item-id={e.id}
                  className={`space-y-1 rounded p-1 -m-1 transition-colors ${
                    selectedTargetId === e.id ? "ring-2 ring-primary/60 bg-primary/[0.04]" : ""
                  }`}
                >
                  <div
                    className="flex items-baseline justify-between gap-4 cursor-pointer hover:bg-slate-50/50 rounded px-1"
                    onClick={() => onSelectElement?.(e.id, "experience")}
                  >
                    <div>
                      <span className="text-[12.5px] font-bold text-slate-900">{e.role}</span>
                      {e.company && (
                        <span className="text-[12px] font-semibold text-slate-700">
                          {" "}
                          — {e.company}
                        </span>
                      )}
                      {e.location && (
                        <span className="text-[11px] text-slate-500"> · {e.location}</span>
                      )}
                    </div>
                    {(e.start || e.end) && (
                      <div className="shrink-0 font-mono text-[10.5px] text-slate-500">
                        {e.start} {e.start && e.end ? "—" : ""} {e.end}
                      </div>
                    )}
                  </div>
                  {e.bullets && e.bullets.length > 0 && (
                    <ul className="mt-1 space-y-1 pl-4 list-disc marker:text-slate-400">
                      {e.bullets.map((b) => (
                        <li
                          key={b.id}
                          id={`resume-bullet-${b.id}`}
                          data-resume-bullet-id={b.id}
                          onClick={(evt) => {
                            evt.stopPropagation();
                            onSelectElement?.(b.id, "experience");
                          }}
                          className={`text-[11.5px] leading-relaxed text-slate-700 pl-0.5 rounded transition-colors cursor-pointer ${
                            selectedTargetId === b.id
                              ? "ring-2 ring-primary/70 bg-primary/[0.08] font-medium text-slate-900 px-1 -mx-1"
                              : "hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {b.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Internships */}
        {hasInternships && (
          <section id="resume-section-internships" data-resume-section="internships">
            <SectionTitle>Internships</SectionTitle>
            <div className="space-y-3">
              {resume.internships.map((e) => (
                <div
                  key={e.id}
                  id={`resume-item-${e.id}`}
                  data-resume-item-id={e.id}
                  className={`space-y-1 rounded p-1 -m-1 transition-colors ${
                    selectedTargetId === e.id ? "ring-2 ring-primary/60 bg-primary/[0.04]" : ""
                  }`}
                >
                  <div
                    className="flex items-baseline justify-between gap-4 cursor-pointer hover:bg-slate-50/50 rounded px-1"
                    onClick={() => onSelectElement?.(e.id, "internships")}
                  >
                    <div>
                      <span className="text-[12.5px] font-bold text-slate-900">{e.role}</span>
                      {e.company && (
                        <span className="text-[12px] font-semibold text-slate-700">
                          {" "}
                          — {e.company}
                        </span>
                      )}
                      {e.location && (
                        <span className="text-[11px] text-slate-500"> · {e.location}</span>
                      )}
                    </div>
                    {(e.start || e.end) && (
                      <div className="shrink-0 font-mono text-[10.5px] text-slate-500">
                        {e.start} {e.start && e.end ? "—" : ""} {e.end}
                      </div>
                    )}
                  </div>
                  {e.bullets && e.bullets.length > 0 && (
                    <ul className="mt-1 space-y-1 pl-4 list-disc marker:text-slate-400">
                      {e.bullets.map((b) => (
                        <li
                          key={b.id}
                          id={`resume-bullet-${b.id}`}
                          data-resume-bullet-id={b.id}
                          onClick={(evt) => {
                            evt.stopPropagation();
                            onSelectElement?.(b.id, "internships");
                          }}
                          className={`text-[11.5px] leading-relaxed text-slate-700 pl-0.5 rounded transition-colors cursor-pointer ${
                            selectedTargetId === b.id
                              ? "ring-2 ring-primary/70 bg-primary/[0.08] font-medium text-slate-900 px-1 -mx-1"
                              : "hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {b.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {hasProjects && (
          <section id="resume-section-projects" data-resume-section="projects">
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-2.5">
              {resume.projects.map((p) => (
                <div
                  key={p.id}
                  id={`resume-item-${p.id}`}
                  data-resume-item-id={p.id}
                  onClick={() => onSelectElement?.(p.id, "projects")}
                  className={`space-y-0.5 rounded p-1.5 -m-1.5 transition-colors cursor-pointer ${
                    selectedTargetId === p.id
                      ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="text-[12px] font-bold text-slate-900">{p.name}</div>
                  {p.description && (
                    <div className="text-[11.5px] leading-relaxed text-slate-700">
                      {p.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {hasSkills && (
          <section
            id="resume-section-skills"
            data-resume-section="skills"
            onClick={() => onSelectElement?.("skills", "skills")}
            className={`transition-colors rounded p-1.5 -m-1.5 cursor-pointer ${
              selectedTargetId === "skills"
                ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                : "hover:bg-slate-50/50"
            }`}
          >
            <SectionTitle>Skills & Technical Competencies</SectionTitle>
            <div className="flex flex-wrap gap-1.5 text-[11.5px] leading-relaxed text-slate-700">
              {resume.skills.map((skill, idx) => {
                const normId = skill.toLowerCase().replace(/[^a-z0-9]/g, "-");
                const isSelected =
                  selectedTargetId === skill ||
                  selectedTargetId === normId ||
                  selectedTargetId === `skill-${idx}`;
                return (
                  <span
                    key={idx}
                    id={`resume-skill-${normId}`}
                    data-resume-skill={skill}
                    onClick={(evt) => {
                      evt.stopPropagation();
                      onSelectElement?.(skill, "skills");
                    }}
                    className={`rounded px-1.5 py-0.5 transition-all cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-primary bg-primary/15 text-slate-900 font-semibold shadow-xs"
                        : "bg-slate-100/90 hover:bg-slate-200/80 text-slate-800"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {hasEducation && (
          <section id="resume-section-education" data-resume-section="education">
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-2">
              {resume.education.map((ed) => (
                <div
                  key={ed.id}
                  id={`resume-item-${ed.id}`}
                  data-resume-item-id={ed.id}
                  onClick={() => onSelectElement?.(ed.id, "education")}
                  className={`flex items-baseline justify-between gap-4 rounded p-1 -m-1 transition-colors cursor-pointer ${
                    selectedTargetId === ed.id
                      ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <div>
                    <span className="text-[12px] font-bold text-slate-900">{ed.school}</span>
                    {ed.degree && (
                      <span className="text-[11.5px] text-slate-600"> — {ed.degree}</span>
                    )}
                    {ed.location && (
                      <span className="text-[11px] text-slate-500"> · {ed.location}</span>
                    )}
                    {ed.gpa && <span className="text-[11px] text-slate-500"> · GPA: {ed.gpa}</span>}
                  </div>
                  {(ed.start || ed.end) && (
                    <div className="shrink-0 font-mono text-[10.5px] text-slate-500">
                      {ed.start} {ed.start && ed.end ? "—" : ""} {ed.end}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {hasCertifications && (
          <section id="resume-section-certifications" data-resume-section="certifications">
            <SectionTitle>Certifications</SectionTitle>
            <div className="space-y-1.5">
              {resume.certifications.map((c) => (
                <div
                  key={c.id}
                  id={`resume-item-${c.id}`}
                  data-resume-item-id={c.id}
                  onClick={() => onSelectElement?.(c.id, "certifications")}
                  className={`flex items-baseline justify-between gap-4 text-[11.5px] rounded p-1 -m-1 transition-colors cursor-pointer ${
                    selectedTargetId === c.id
                      ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-900">{c.name}</span>
                    {c.issuer && <span className="text-slate-600"> — {c.issuer}</span>}
                  </div>
                  {c.date && (
                    <span className="shrink-0 font-mono text-[10.5px] text-slate-500">
                      {c.date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {hasAchievements && (
          <section id="resume-section-achievements" data-resume-section="achievements">
            <SectionTitle>Key Achievements</SectionTitle>
            <ul className="space-y-1 pl-4 list-disc marker:text-slate-400">
              {resume.achievements.map((item, i) => (
                <li
                  key={i}
                  id={`resume-achievement-${i}`}
                  onClick={() => onSelectElement?.(`achievement-${i}`, "achievements")}
                  className={`text-[11.5px] leading-relaxed text-slate-700 pl-0.5 rounded transition-colors cursor-pointer ${
                    selectedTargetId === `achievement-${i}`
                      ? "ring-2 ring-primary/70 bg-primary/[0.08] font-medium text-slate-900"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Leadership & Activities */}
        {hasLeadership && (
          <section id="resume-section-leadership" data-resume-section="leadership">
            <SectionTitle>Leadership & Activities</SectionTitle>
            <div className="space-y-2">
              {resume.leadership.map((l) => (
                <div
                  key={l.id}
                  id={`resume-item-${l.id}`}
                  data-resume-item-id={l.id}
                  onClick={() => onSelectElement?.(l.id, "leadership")}
                  className={`space-y-0.5 rounded p-1 -m-1 transition-colors cursor-pointer ${
                    selectedTargetId === l.id
                      ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4 text-[12px]">
                    <div>
                      <span className="font-bold text-slate-900">{l.role}</span>
                      {l.organization && (
                        <span className="text-slate-600"> — {l.organization}</span>
                      )}
                    </div>
                    {(l.startDate || l.endDate) && (
                      <span className="shrink-0 font-mono text-[10.5px] text-slate-500">
                        {l.startDate} {l.startDate && l.endDate ? "—" : ""} {l.endDate}
                      </span>
                    )}
                  </div>
                  {l.description && (
                    <p className="text-[11.5px] text-slate-700 leading-relaxed">{l.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {hasLanguages && (
          <section
            id="resume-section-languages"
            data-resume-section="languages"
            onClick={() => onSelectElement?.("languages", "languages")}
            className={`transition-colors rounded p-1 -m-1 cursor-pointer ${
              selectedTargetId === "languages"
                ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                : "hover:bg-slate-50/50"
            }`}
          >
            <SectionTitle>Languages</SectionTitle>
            <div className="text-[11.5px] text-slate-700">
              {resume.languages.map((l) => `${l.language} (${l.proficiency})`).join(" · ")}
            </div>
          </section>
        )}

        {/* Links */}
        {hasLinks && (
          <section id="resume-section-links" data-resume-section="links">
            <SectionTitle>Links & Portfolios</SectionTitle>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px]">
              {resume.links.map((link) => (
                <span
                  key={link.id}
                  id={`resume-link-${link.id}`}
                  onClick={() => onSelectElement?.(link.id, "links")}
                  className={`text-blue-700 rounded px-1 transition-colors cursor-pointer ${
                    selectedTargetId === link.id
                      ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                      : "hover:underline"
                  }`}
                >
                  {link.label}: {link.url}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Additional Information */}
        {hasAdditional && (
          <section id="resume-section-additional" data-resume-section="additional">
            <SectionTitle>Additional Information</SectionTitle>
            <div className="space-y-1.5">
              {resume.additional.map((item) => (
                <div
                  key={item.id}
                  id={`resume-item-${item.id}`}
                  data-resume-item-id={item.id}
                  onClick={() => onSelectElement?.(item.id, "additional")}
                  className={`text-[11.5px] text-slate-700 rounded p-1 -m-1 transition-colors cursor-pointer ${
                    selectedTargetId === item.id
                      ? "ring-2 ring-primary/60 bg-primary/[0.04]"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  {item.title && (
                    <span className="font-semibold text-slate-900">{item.title}: </span>
                  )}
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-b border-slate-200 pb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
      {children}
    </h2>
  );
}

function TemplatePreviewWrapper({
  resume,
  templateSlug,
}: {
  resume: ResumeData;
  templateSlug: string;
}) {
  const profile: ResumeProfile = {
    personal: {
      fullName: resume.contact.fullName,
      email: resume.contact.email,
      phone: resume.contact.phone,
      location: resume.contact.location,
      headline: resume.contact.headline,
      website: resume.contact.website,
      linkedin: resume.contact.linkedin ?? "",
      github: resume.contact.github ?? "",
    },
    targetRole: resume.targetRole,
    summary: resume.summary,
    experience: resume.experience.map((e) => ({
      id: e.id,
      company: e.company,
      role: e.role,
      location: e.location,
      startDate: e.start,
      endDate: e.end,
      current: e.end === "" || e.end === "Present",
      employmentType: "",
      responsibilities: e.bullets.map((b) => ({ id: b.id, text: b.text })),
      achievements: [],
      tools: [],
      metrics: "",
    })),
    internships:
      resume.internships?.map((e) => ({
        id: e.id,
        company: e.company,
        role: e.role,
        location: e.location,
        startDate: e.start,
        endDate: e.end,
        current: e.end === "" || e.end === "Present",
        employmentType: "",
        responsibilities: e.bullets.map((b) => ({ id: b.id, text: b.text })),
        achievements: [],
        tools: [],
        metrics: "",
      })) ?? [],
    education: resume.education.map((ed) => ({
      id: ed.id,
      institution: ed.school,
      degree: ed.degree,
      field: ed.field || "",
      location: ed.location || "",
      startDate: ed.start,
      endDate: ed.end,
      gpa: ed.gpa || "",
      coursework: ed.coursework || [],
      achievements: ed.achievements || [],
    })),
    skills: {
      technical: resume.skills ?? [],
      tools: [],
      languages: [],
      databases: [],
      analytics: [],
      softSkills: [],
      custom: {},
    },
    projects: resume.projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      problem: p.problem || "",
      contribution: p.contribution || "",
      technologies: p.technologies || [],
      methodology: p.methodology || "",
      results: p.results || "",
      metrics: p.metrics || "",
      url: p.url || "",
    })),
    certifications: resume.certifications ?? [],
    achievements: resume.achievements ?? [],
    leadership: resume.leadership ?? [],
    languages: resume.languages ?? [],
    links: resume.links ?? [],
    additional: resume.additional ?? [],
  };

  return (
    <div className="w-full">
      <TemplatePreview templateSlug={templateSlug} profile={profile} />
    </div>
  );
}

export function A4DocumentSkeleton() {
  return (
    <div
      className="mx-auto rounded-sm bg-white text-slate-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.2)] ring-1 ring-black/10 select-none animate-pulse"
      style={{
        width: 794,
        minHeight: 1123,
        padding: "48px 56px",
      }}
    >
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 pb-4 mb-6 space-y-2.5">
        <div className="h-7 w-56 rounded bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-150 bg-slate-200/70" />
        <div className="flex gap-4 pt-1">
          <div className="h-3 w-28 rounded bg-slate-200/60" />
          <div className="h-3 w-24 rounded bg-slate-200/60" />
          <div className="h-3 w-32 rounded bg-slate-200/60" />
        </div>
      </div>

      {/* Summary Section */}
      <div className="space-y-2 mb-6">
        <div className="h-3.5 w-36 rounded bg-slate-200" />
        <div className="h-2.5 w-full rounded bg-slate-100" />
        <div className="h-2.5 w-11/12 rounded bg-slate-100" />
        <div className="h-2.5 w-4/5 rounded bg-slate-100" />
      </div>

      {/* Experience Section */}
      <div className="space-y-4 mb-6">
        <div className="h-3.5 w-44 rounded bg-slate-200" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-48 rounded bg-slate-200/80" />
            <div className="h-3 w-24 rounded bg-slate-200/50" />
          </div>
          <div className="h-2.5 w-full rounded bg-slate-100 pl-4" />
          <div className="h-2.5 w-11/12 rounded bg-slate-100 pl-4" />
          <div className="h-2.5 w-3/4 rounded bg-slate-100 pl-4" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <div className="h-3 w-40 rounded bg-slate-200/80" />
            <div className="h-3 w-24 rounded bg-slate-200/50" />
          </div>
          <div className="h-2.5 w-full rounded bg-slate-100 pl-4" />
          <div className="h-2.5 w-4/5 rounded bg-slate-100 pl-4" />
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-2 mb-6">
        <div className="h-3.5 w-32 rounded bg-slate-200" />
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="h-5 w-20 rounded bg-slate-150 bg-slate-200/60" />
          <div className="h-5 w-24 rounded bg-slate-150 bg-slate-200/60" />
          <div className="h-5 w-16 rounded bg-slate-150 bg-slate-200/60" />
          <div className="h-5 w-28 rounded bg-slate-150 bg-slate-200/60" />
          <div className="h-5 w-20 rounded bg-slate-150 bg-slate-200/60" />
        </div>
      </div>

      {/* Education Section */}
      <div className="space-y-2">
        <div className="h-3.5 w-28 rounded bg-slate-200" />
        <div className="flex justify-between">
          <div className="h-3 w-52 rounded bg-slate-200/80" />
          <div className="h-3 w-20 rounded bg-slate-200/50" />
        </div>
        <div className="h-2.5 w-36 rounded bg-slate-100" />
      </div>
    </div>
  );
}
