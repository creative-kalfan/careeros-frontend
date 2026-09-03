"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type JobDescriptionFormValues = {
  jobTitle?: string;
  company?: string;
  jobDescription: string;
};

export type ATSAnalysisDialogProps = {
  resumeId: string;
  onClose: () => void;
  onAnalyze: (values: JobDescriptionFormValues) => void;
  defaultValues?: {
    jobTitle?: string;
    company?: string;
    jobDescription?: string;
  };
};

export function ATSAnalysisDialog({
  resumeId: _resumeId,
  onClose,
  onAnalyze,
  defaultValues,
}: ATSAnalysisDialogProps) {
  const [jobTitle, setJobTitle] = useState(defaultValues?.jobTitle ?? "");
  const [company, setCompany] = useState(defaultValues?.company ?? "");
  const [jobDescription, setJobDescription] = useState(defaultValues?.jobDescription ?? "");

  const onSubmit = () => {
    onAnalyze({ jobTitle, company, jobDescription });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Analyze Resume Against Job</DialogTitle>
          <DialogDescription>
            Compare your resume against a target job description to evaluate ATS compatibility and keyword alignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ats-job-title" className="block text-sm font-medium">
              Job Title <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="ats-job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Data Analyst"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ats-company" className="block text-sm font-medium">
              Company <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="ats-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Example Corp"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ats-job-description" className="block text-sm font-medium">
              Job Description <span className="text-muted-foreground">(Required)</span>
            </Label>
            <Textarea
              id="ats-job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              placeholder="Paste the complete job description here..."
              className="min-h-[160px] resize-y"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!jobDescription.trim()}
              className="flex-1"
            >
              Analyze Resume
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
