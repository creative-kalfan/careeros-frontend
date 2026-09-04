import React from "react";
import { SlidersHorizontal, MapPin, X, Briefcase, Layers, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterOptions } from "@/lib/jobs";

export type PrimaryFilterState = {
  workMode?: "Remote" | "Hybrid" | "On-site" | "All";
  experience?: string;
  employmentType?: string;
  location?: string;
};

export function PrimaryFiltersBar({
  workMode,
  experience,
  employmentType,
  location,
  onWorkModeSelect,
  onExperienceSelect,
  onEmploymentTypeSelect,
  onLocationChange,
  onOpenAdditional,
  onResetAll,
  activeAdditionalCount = 0,
  totalActiveCount = 0,
}: {
  workMode?: string;
  experience?: string;
  employmentType?: string;
  location?: string;
  onWorkModeSelect: (mode: "Remote" | "Hybrid" | "On-site" | "All") => void;
  onExperienceSelect: (exp: string | undefined) => void;
  onEmploymentTypeSelect: (type: string | undefined) => void;
  onLocationChange: (loc: string | undefined) => void;
  onOpenAdditional: () => void;
  onResetAll: () => void;
  activeAdditionalCount?: number;
  totalActiveCount?: number;
}) {
  const currentWorkMode = workMode || "All";

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-background/50 backdrop-blur-xs">
      {/* Work Mode Segmented Control */}
      <div className="inline-flex items-center rounded-lg border border-border/70 bg-surface-elevated/40 p-0.5 text-xs">
        {(["All", "Remote", "Hybrid", "On-site"] as const).map((mode) => {
          const active = currentWorkMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onWorkModeSelect(mode)}
              className={`rounded-md px-2.5 py-1 font-medium transition-all text-xs select-none ${
                active
                  ? "bg-surface-elevated text-foreground shadow-xs ring-1 ring-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode}
            </button>
          );
        })}
      </div>

      {/* Experience Level Dropdown */}
      <div className="w-[125px]">
        <Select
          value={experience || "all"}
          onValueChange={(val) => onExperienceSelect(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="h-7.5 rounded-lg border-border/70 bg-surface-elevated/40 px-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Layers className="h-3 w-3 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Experience" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/80">
            <SelectItem value="all" className="text-xs">
              All Levels
            </SelectItem>
            {filterOptions.experience.map((exp) => (
              <SelectItem key={exp} value={exp} className="text-xs">
                {exp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employment Type Dropdown */}
      <div className="w-[130px]">
        <Select
          value={employmentType || "all"}
          onValueChange={(val) => onEmploymentTypeSelect(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="h-7.5 rounded-lg border-border/70 bg-surface-elevated/40 px-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Job Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/80">
            <SelectItem value="all" className="text-xs">
              All Job Types
            </SelectItem>
            {filterOptions.employmentType.map((type) => (
              <SelectItem key={type} value={type} className="text-xs">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Location Chip if provided */}
      {location && (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-elevated/40 px-2 py-1 text-xs text-foreground">
          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="max-w-[120px] truncate">{location}</span>
          <button
            onClick={() => onLocationChange(undefined)}
            className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Remove location filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        {/* Additional Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAdditional}
          className={`h-7.5 gap-1.5 rounded-lg text-xs px-2.5 transition-all ${
            activeAdditionalCount > 0
              ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
              : "border-border/70 bg-surface-elevated/30 text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60"
          }`}
        >
          <SlidersHorizontal className="h-3 w-3" />
          <span>Filters</span>
          {activeAdditionalCount > 0 && (
            <Badge
              variant="secondary"
              className="h-4.5 min-w-4.5 rounded-full px-1.5 text-[10px] font-mono bg-primary/20 text-primary border-0 font-medium"
            >
              {activeAdditionalCount}
            </Badge>
          )}
        </Button>

        {/* Clear All action */}
        {totalActiveCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetAll}
            className="h-7.5 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg"
            title="Reset all filters"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
