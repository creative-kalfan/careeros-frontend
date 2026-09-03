import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-tooltip";
import { useResumes } from "@/hooks/api/useResumes";
import { versionsApi } from "@/api/versions";
import { FileText, Loader2 } from "lucide-react";
import type { Job } from "@/types/jobs";
import type { ResumeListRecord } from "@/types/resume";

type Step = "jd" | "resume" | "creating";

export function JobResumeDialog({
  job,
  open,
  onOpenChange,
}: {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: resumesData, isLoading: resumesLoading } = useResumes();

  const [step, setStep] = useState<Step>("jd");
  const [jd, setJd] = useState(job.overview || "");
  const [isCreating, setIsCreating] = useState(false);

  const hasStoredJd = Boolean(job.overview?.trim());

  useEffect(() => {
    if (open) {
      setStep("jd");
      setJd(job.overview || "");
      setIsCreating(false);
    }
  }, [open, job.overview]);

  const resumes = resumesData?.resumes ?? [];

  function handleContinueFromJd() {
    if (!jd.trim()) {
      toast.error("Please provide a job description");
      return;
    }
    setStep("resume");
  }

  async function handleCreateVersion(resumeId: string) {
    setIsCreating(true);
    try {
      const result = await versionsApi.create(resumeId, {
        version_name: `${job.role} at ${job.company}`,
        source: "job_specific",
        target_job_id: job.id,
        target_job_title: job.role,
        target_company: job.company,
        target_job_url: job.applyUrl || undefined,
        job_description: jd.trim(),
      });
      onOpenChange(false);
      navigate({
        to: "/resumes/$id",
        params: { id: resumeId },
        search: { versionId: result.version.id },
      });
    } catch {
      toast.error("Failed to create job-specific version");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Edit Resume for This Job
          </DialogTitle>
          <DialogDescription>
            Tailor your resume for <span className="font-medium text-foreground">{job.role}</span>{" "}
            at <span className="font-medium text-foreground">{job.company}</span>.
          </DialogDescription>
        </DialogHeader>

        {step === "jd" && (
          <div className="space-y-4">
            {hasStoredJd ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Job Description
                  </span>
                  <Badge variant="secondary" className="rounded-full text-[10px]">
                    Stored
                  </Badge>
                </div>
                <ScrollArea className="max-h-48 rounded-xl border border-border/60 bg-surface-elevated/40 p-3">
                  <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed text-foreground/85">
                    {job.overview}
                  </p>
                </ScrollArea>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Job description unavailable
                </span>
                <p className="text-xs text-muted-foreground">
                  Paste the job description below to tailor your resume.
                </p>
                <Textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="min-h-[160px] resize-y rounded-xl border-border/60 text-xs"
                />
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button size="sm" className="h-8 rounded-lg text-xs" onClick={handleContinueFromJd}>
                Continue
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "resume" && (
          <div className="space-y-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Select Resume
            </span>
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {resumesLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-14 animate-pulse rounded-xl bg-muted/40" />
                    ))}
                  </div>
                ) : resumes.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No resumes found. Upload a resume first.
                  </p>
                ) : (
                  resumes.map((resume: ResumeListRecord) => (
                    <button
                      key={resume.id}
                      onClick={() => handleCreateVersion(resume.id)}
                      disabled={isCreating}
                      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-surface-elevated/40 p-3 text-left transition hover:border-primary/40 hover:bg-surface-elevated/70 disabled:opacity-60"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{resume.name}</div>
                        <div className="mt-0.5 text-[10.5px] text-muted-foreground">
                          Updated {new Date(resume.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      {isCreating && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={() => setStep("jd")}
                disabled={isCreating}
              >
                Back
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
