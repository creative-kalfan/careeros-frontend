"use client";

import { useState, useEffect } from "react";
import {
  Gauge,
  TrendingUp,
  Settings,
  Zap,
  Search,
  Layout,
  Users,
  Library,
  Folder,
  Menu,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AtsAnalysisResult } from "@/api/ats";

interface ATSScoreBreakdown {
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  qualificationMatch: number;
  structureMatch: number;
}

interface ATSAnalysisCardProps {
  title: string;
  score: number;
  description: string;
  trend?: "up" | "down" | "neutral";
}

export function ATSScoreCard({ title, score, description, trend }: ATSAnalysisCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </h3>
      <p className="text-2xl font-bold">{score}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Progress value={score} className="h-2 my-3" />
    </Card>
  );
}

export function ATSTrashholdAnalysis({
  matched,
  missing,
  partial,
}: {
  matched: string[];
  missing: string[];
  partial: string[];
}) {
  return (
    <div className="space-y-3">
      <details className="group">
        <summary className="flex items-center gap-2 text-sm font-medium list-none cursor-pointer">
          <Search className="h-3.5 w-3.5 text-primary" />
          <span>Matched Keywords ({matched.length})</span>
        </summary>
        <ul className="list-disc list-inside space-y-1 text-sm mt-2">
          {matched.map((kw) => (
            <li key={kw} className="text-primary">
              {kw}
            </li>
          ))}
        </ul>
      </details>

      <details className="group">
        <summary className="flex items-center gap-2 text-sm font-medium list-none cursor-pointer">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span>Missing Keywords ({missing.length})</span>
        </summary>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
          {missing.map((kw) => (
            <li key={kw}>{kw}</li>
          ))}
        </ul>
      </details>

      <details className="group">
        <summary className="flex items-center gap-2 text-sm font-medium list-none cursor-pointer">
          <Eye className="h-3.5 w-3.5 text-primary" />
          <span>Partial Matches ({partial.length})</span>
        </summary>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
          {partial.map((kw) => (
            <li key={kw}>{kw}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export function ATSRecommendations({
  highPriority,
  mediumPriority,
  lowPriority,
}: {
  highPriority: string[];
  mediumPriority: string[];
  lowPriority: string[];
}) {
  const renderPriority = (priority: string[], title: string): React.ReactNode => {
    if (priority.length === 0) return null;
    return (
      <details className="group">
        <summary className="font-medium text-primary list-none cursor-pointer">
          {title} ({priority.length})
        </summary>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {priority.map((rec) => (
            <li key={rec}>{rec}</li>
          ))}
        </ul>
      </details>
    );
  };

  return (
    <div>
      {renderPriority(highPriority, "High Priority")}
      {renderPriority(mediumPriority, "Medium Priority")}
      {renderPriority(lowPriority, "Low Priority")}
    </div>
  );
}
