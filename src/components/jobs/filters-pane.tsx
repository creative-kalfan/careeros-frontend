import { useState } from "react";
import {
  SlidersHorizontal,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  Building2,
  Wrench,
  Bookmark,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { filterOptions, savedSearchesMock } from "@/lib/jobs";
import { useJobs } from "@/hooks/api/useJobs";

function Group({
  icon: Icon,
  title,
  count,
  defaultOpen = true,
  children,
}: {
  icon: React.ElementType;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between px-1 py-1.5 text-left">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </span>
          {count != null && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] text-primary">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
            open ? "" : "-rotate-90"
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
        active
          ? "border-primary/50 bg-primary/15 text-foreground"
          : "border-border/60 bg-surface-elevated/50 text-muted-foreground hover:border-border hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function FiltersPane({ onApply }: { onApply?: (filters: Record<string, string[]>) => void } = {}) {
  const [salary, setSalary] = useState<number[]>([180, 300]);
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});

  const applyFilters = () => {
    const payload: Record<string, string[]> = {};
    Object.entries(selected).forEach(([key, set]) => {
      if (set.size > 0) payload[key] = Array.from(set);
    });
    onApply?.(payload);
  };

  function toggle(group: string, val: string) {
    setSelected((prev) => {
      const next = { ...prev };
      const s = new Set(next[group] ?? []);
      if (s.has(val)) s.delete(val);
      else s.add(val);
      next[group] = s;
      return next;
    });
  }
  function isOn(group: string, val: string) {
    return selected[group]?.has(val) ?? false;
  }

  const activeCount = Object.values(selected).reduce((n, s) => n + s.size, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <div className="text-[13px] font-semibold">Smart Filters</div>
          {activeCount > 0 && (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {activeCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 rounded-md px-2 text-[11px] text-muted-foreground"
          onClick={() => setSelected({})}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 rounded-md px-2 text-[11px]"
          onClick={applyFilters}
        >
          Apply
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          <Group icon={Briefcase} title="Role">
            <Input
              placeholder="e.g. Staff Frontend Engineer"
              className="h-8 rounded-lg bg-surface-elevated/40 text-xs"
            />
          </Group>

          <Group icon={MapPin} title="Location">
            <Input
              placeholder="City, region or 'Remote'"
              className="h-8 rounded-lg bg-surface-elevated/40 text-xs"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {filterOptions.workMode.map((m) => (
                <Chip
                  key={m}
                  active={isOn("workMode", m)}
                  onClick={() => toggle("workMode", m)}
                >
                  {m}
                </Chip>
              ))}
            </div>
          </Group>

          <Group icon={Sparkles} title="Experience">
            <div className="flex flex-wrap gap-1.5">
              {filterOptions.experience.map((e) => (
                <Chip
                  key={e}
                  active={isOn("experience", e)}
                  onClick={() => toggle("experience", e)}
                >
                  {e}
                </Chip>
              ))}
            </div>
          </Group>

          <Group icon={DollarSign} title="Salary">
            <div className="px-1">
              <Slider
                value={salary}
                min={60}
                max={500}
                step={10}
                onValueChange={setSalary}
                className="mt-2"
              />
              <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>${salary[0]}k</span>
                <span>${salary[1]}k</span>
              </div>
            </div>
          </Group>

          <Group icon={Wrench} title="Skills" defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {filterOptions.skills.map((s) => (
                <Chip key={s} active={isOn("skills", s)} onClick={() => toggle("skills", s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </Group>

          <Group icon={Building2} title="Companies" defaultOpen={false}>
            <div className="space-y-1.5">
              {filterOptions.companies.map((c) => (
                <label
                  key={c}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 hover:bg-surface-elevated/50"
                >
                  <Checkbox
                    checked={isOn("companies", c)}
                    onCheckedChange={() => toggle("companies", c)}
                  />
                  <Label className="cursor-pointer text-xs font-normal">{c}</Label>
                </label>
              ))}
            </div>
          </Group>

          <Group icon={Briefcase} title="Employment Type" defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {filterOptions.employmentType.map((e) => (
                <Chip
                  key={e}
                  active={isOn("employmentType", e)}
                  onClick={() => toggle("employmentType", e)}
                >
                  {e}
                </Chip>
              ))}
            </div>
          </Group>

          <Group icon={Clock} title="Posted Date" defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {filterOptions.postedDate.map((p) => (
                <Chip
                  key={p}
                  active={isOn("postedDate", p)}
                  onClick={() => toggle("postedDate", p)}
                >
                  {p}
                </Chip>
              ))}
            </div>
          </Group>

          <div className="pt-4">
            <div className="mb-2 flex items-center gap-2 px-1">
              <Bookmark className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Saved Searches
              </span>
            </div>
            <div className="space-y-1.5">
              {savedSearchesMock.map((s) => (
                <button
                  key={s.id}
                  className="group flex w-full items-center justify-between rounded-lg border border-border/50 bg-surface-elevated/40 px-2.5 py-2 text-left transition hover:border-primary/40 hover:bg-surface-elevated"
                >
                  <span className="truncate text-[12px] text-foreground/90">{s.label}</span>
                  <span className="ml-2 shrink-0 rounded-full bg-background/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {s.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
