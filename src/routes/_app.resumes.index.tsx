import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, slideInRight } from '@/lib/motion';
import {
  Target,
  FilePlus2,
  ChevronRight,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumes } from "@/hooks/api/useResumes";

export const Route = createFileRoute("/_app/resumes/")({
  head: () => ({
    meta: [
      { title: "Resume Studio · CareerOS" },
      {
        name: "description",
        content:
          "Turn your resume into a job-winning application. Upload your resume, add a target job, and analyze what to improve while preserving your resume's original look and structure.",
      },
    ],
  }),
  component: ResumesPage,
});

function ResumesPage() {
  const { data: resumesData, isLoading } = useResumes();
  const resumes = resumesData?.resumes ?? [];

  return (
    <div className="w-full max-w-[1536px] mx-auto flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        eyebrow="Workspace"
        title="Turn your resume into a job-winning application"
        description="Upload your resume, add a target job, and CareerOS analyzes what to improve — while preserving your resume's original look and structure."
      />

      {/* Primary Intent Cards */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <Link
            to="/resumes/setup"
            search={{ mode: "upload", jobTitle: "", company: "", jobDescription: "" }}
            className="group text-left cursor-pointer"
          >
            <Card className="workstation-panel spatial-card spatial-card-hover relative flex h-full min-h-54 flex-col rounded-xl border border-border/80 p-6 shadow-elevation-1 bg-surface hover:border-primary/50">
              <div className="flex h-full flex-col relative z-10">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary border border-primary/25 shadow-xs">
                  <Target className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <div className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    Optimize my resume for a job
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    Tailor a resume against a specific job description. Get ATS alignment, requirement
                    tracking, and AI-powered suggestions.
                  </div>
                </div>
                <div className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold text-primary transition-all group-hover:gap-2">
                  Start optimization{" "}
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Link to="/resumes/setup" className="group text-left cursor-pointer">
            <Card className="workstation-panel spatial-card spatial-card-hover relative flex h-full min-h-54 flex-col rounded-xl border border-border/80 p-6 shadow-elevation-1 bg-surface hover:border-primary/50">
              <div className="flex h-full flex-col relative z-10">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary border border-primary/25 shadow-xs">
                  <FilePlus2 className="h-5 w-5" />
                </div>
                <div className="mt-4">
                  <div className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    Create / Upload resume
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    Build or establish your master resume profile. Upload a PDF/DOCX or build from
                    scratch with guided structure.
                  </div>
                </div>
                <div className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-semibold text-primary transition-all group-hover:gap-2">
                  Upload or create{" "}
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      </motion.div>

      {/* Existing Resumes Workspace Section */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Your Resumes</h2>
            <p className="text-xs text-muted-foreground">
              Master resumes and tailored version documents.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="h-7.5 rounded-lg text-xs gap-1">
            <Link to="/resumes/setup">
              <Plus className="h-3.5 w-3.5" /> New
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="glass rounded-xl border border-border/80 p-4 bg-surface/60 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8.5 w-8.5 rounded-lg bg-surface-elevated animate-pulse shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-40 rounded bg-surface-elevated animate-pulse" />
                    <div className="h-2.5 w-24 rounded bg-surface-elevated/70 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Card className="glass rounded-xl border border-dashed border-border/80 p-8 text-center bg-surface/30">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-surface-elevated text-muted-foreground mb-3 shadow-2xs">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-semibold text-foreground">No resumes in workspace yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Upload a resume or build from scratch to start optimizing with live ATS intelligence.
            </p>
          </Card>
        ) : (
          <motion.div
            className="grid gap-3 sm:grid-cols-2"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {resumes.map((resume) => (
              <motion.div
                key={resume.id}
                variants={staggerItem}
                whileHover={{ scale: 1.008, transition: { duration: 0.15 } }}
              >
                <Link
                  to="/resumes/$id"
                  params={{ id: resume.id }}
                  className="group block"
                >
                  <Card className="glass spatial-card spatial-card-hover rounded-xl border-border/80 p-4 transition-all hover:border-primary/40 bg-surface/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-lg bg-surface-elevated text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors shadow-2xs">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {resume.name || "Untitled Resume"}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            {resume.role && (
                              <span className="truncate max-w-[140px]">{resume.role}</span>
                            )}
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3" />
                              {resume.updatedAt
                                ? new Date(resume.updatedAt).toLocaleDateString()
                                : "Active"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {resume.atsScore != null && resume.atsScore > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-mono border-primary/30 text-primary"
                          >
                            ATS {Math.round(resume.atsScore)}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
