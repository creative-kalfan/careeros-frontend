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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-tooltip";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
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
  const getBarPercentage = (score: number) => `${score}%`;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {title}
          </h3>
          <p className="text-2xl font-bold">{score}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md"
              aria-label="View details"
            >
              <Zap className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">View detailed analysis</TooltipContent>
        </Tooltip>
      </div>

      <Progress value={score} className="h-2 my-3" aria-label={`${title} score`} />

      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
}

export function ATSTrendIndicator({
  score,
  previousScore,
}: {
  score: number;
  previousScore?: number;
}) {
  if (previousScore === undefined) {
    return <span className="text-xs text-muted-foreground">New analysis</span>;
  }

  const change = score - previousScore;
  const isPositive = change > 0;

  return (
    <span className="flex items-center gap-1">
      <TrendingUp
        className={`h-3.5 w-3.5 ${isPositive ? "text-green-500" : "text-red-500"}`}
        aria-hidden="true"
      />
      <span className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {change > 0 ? "↑" : change < 0 ? "↓" : "→"} {Math.abs(change)}
      </span>
    </span>
  );
}
