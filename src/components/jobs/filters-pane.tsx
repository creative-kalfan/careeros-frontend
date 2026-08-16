import { useState } from "react";
import {
  SlidersHorizontal,
  MapPin,
  Briefcase,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { filterOptions } from "@/lib/jobs";

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
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [roleQuery, setRoleQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const applyFilters = () => {
    const payload: Record<string, string[]> = {};
    if (roleQuery.trim()) payload.role = [roleQuery.trim()];
    if (locationQuery.trim()) payload.location = [locationQuery.trim()];
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

  const activeCount = Object.values(selected).reduce((n, s) => n + s.size, 0) + (roleQuery.trim() ? 1 : 0) + (locationQuery.trim() ? 1 : 0);

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
              value={roleQuery}
              onChange={(e) => setRoleQuery(e.target.value)}
              placeholder="e.g. Staff Frontend Engineer"
              className="h-8 rounded-lg bg-surface-elevated/40 text-xs"
            />
          </Group>

          <Group icon={MapPin} title="Location">
            <Input
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
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

          <div className="rounded-xl border border-border/50 bg-surface-elevated/30 p-3">
            <div className="text-[11px] font-semibold text-muted-foreground">
              Additional filters
            </div>
            <div className="mt-1 text-[10.5px] text-muted-foreground/70">
              Experience, salary, skills, company, employment type, and posted date filters are not yet supported by the backend.
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
