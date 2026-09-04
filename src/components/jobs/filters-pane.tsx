import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  MapPin,
  Briefcase,
  Building2,
  Clock,
  Sparkles,
  Wrench,
  ArrowUpDown,
  RotateCcw,
  Search,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { filterOptions } from "@/lib/jobs";

export type FiltersPaneValues = {
  role?: string;
  company?: string;
  location?: string;
  workMode?: string[];
  employmentType?: string[];
  experience?: string[];
  skills?: string[];
  sort?: string;
};

export function AdditionalFiltersDrawer({
  open,
  onOpenChange,
  values,
  onApply,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values?: FiltersPaneValues;
  onApply?: (filters: Record<string, string[]>) => void;
  onReset?: () => void;
}) {
  const [companyQuery, setCompanyQuery] = useState(values?.company ?? "");
  const [locationQuery, setLocationQuery] = useState(values?.location ?? "");
  const [selectedSort, setSelectedSort] = useState<string>(values?.sort ?? "best-match");
  const [skillSearch, setSkillSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, Set<string>>>({
    workMode: new Set(values?.workMode ?? []),
    employmentType: new Set(values?.employmentType ?? []),
    experience: new Set(values?.experience ?? []),
    skills: new Set(values?.skills ?? []),
  });

  useEffect(() => {
    if (values) {
      setCompanyQuery(values.company ?? "");
      setLocationQuery(values.location ?? "");
      if (values.sort) setSelectedSort(values.sort);
      setSelected({
        workMode: new Set(values.workMode ?? []),
        employmentType: new Set(values.employmentType ?? []),
        experience: new Set(values.experience ?? []),
        skills: new Set(values.skills ?? []),
      });
    }
  }, [values, open]);

  const toggle = (group: string, val: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      const s = new Set(next[group] ?? []);
      if (s.has(val)) s.delete(val);
      else s.add(val);
      next[group] = s;
      return next;
    });
  };

  const isOn = (group: string, val: string) => {
    return selected[group]?.has(val) ?? false;
  };

  const handleApply = () => {
    const payload: Record<string, string[]> = {};
    if (companyQuery.trim()) payload.company = [companyQuery.trim()];
    if (locationQuery.trim()) payload.location = [locationQuery.trim()];
    if (selectedSort) payload.sort = [selectedSort];
    Object.entries(selected).forEach(([key, set]) => {
      if (set.size > 0) payload[key] = Array.from(set);
    });
    onApply?.(payload);
    onOpenChange(false);
  };

  const handleReset = () => {
    setCompanyQuery("");
    setLocationQuery("");
    setSelectedSort("best-match");
    setSelected({
      workMode: new Set(),
      employmentType: new Set(),
      experience: new Set(),
      skills: new Set(),
    });
    onReset?.();
    onApply?.({});
  };

  const filteredSkills = filterOptions.skills.filter((s) =>
    s.toLowerCase().includes(skillSearch.toLowerCase()),
  );

  const activeCount =
    (companyQuery.trim() ? 1 : 0) +
    (locationQuery.trim() ? 1 : 0) +
    selected.skills.size +
    (selectedSort && selectedSort !== "best-match" ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 gap-0 border-l border-border/80 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="p-5 border-b border-border text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <SheetTitle className="text-sm font-semibold tracking-tight">
                Additional Filters
              </SheetTitle>
              {activeCount > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10px] bg-primary/15 text-primary border-0 font-mono font-medium"
                >
                  {activeCount} active
                </Badge>
              )}
            </div>
          </div>
          <SheetDescription className="text-xs text-muted-foreground mt-0.5">
            Refine opportunities by company, tech stack, and discovery criteria.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5 py-4">
          <div className="space-y-5">
            {/* Skills & Tech Stack Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  Skills & Technologies
                </label>
                {selected.skills.size > 0 && (
                  <span className="text-[11px] font-mono text-primary font-medium">
                    {selected.skills.size} selected
                  </span>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Filter skills (e.g. React, Python)..."
                  className="h-8 rounded-lg pl-8 text-xs bg-surface-elevated/40 border-border/70"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {filteredSkills.map((skill) => {
                  const active = isOn("skills", skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggle("skills", skill)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                        active
                          ? "border-primary/40 bg-primary/10 text-primary shadow-xs"
                          : "border-border/70 bg-surface-elevated/30 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      {active && <Check className="h-3 w-3 text-primary" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Company Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                Company
              </label>
              <Input
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
                placeholder="e.g. Stripe, OpenAI, Google"
                className="h-8.5 rounded-lg text-xs bg-surface-elevated/40 border-border/70"
              />
            </div>

            {/* Target Location / City Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Specific City or Region
              </label>
              <Input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="e.g. Bengaluru, San Francisco, London"
                className="h-8.5 rounded-lg text-xs bg-surface-elevated/40 border-border/70"
              />
            </div>

            {/* Sort Criteria */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {filterOptions.sort.map((s) => {
                  const active = selectedSort === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSelectedSort(s.value)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-all ${
                        active
                          ? "border-border bg-surface-elevated text-foreground font-semibold shadow-xs"
                          : "border-border/70 bg-surface-elevated/30 text-muted-foreground hover:border-border hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t border-border bg-surface-elevated/20 flex flex-row items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset all
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8.5 rounded-lg px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="h-8.5 rounded-lg px-4 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground border-0"
            >
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Export backward-compatible alias for existing imports
export { AdditionalFiltersDrawer as FiltersPane };
