import { useEffect, useRef, useState } from "react";
import { Search, X, Sparkles, Building2, MapPin, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const iconFor = (t: string) =>
  t === "role" ? Sparkles : t === "company" ? Building2 : t === "skill" ? Wrench : MapPin;

export function JobSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        ref.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered: { type: string; label: string }[] = [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={ref}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search roles, companies, skills…"
            className="h-9 rounded-xl border-border/60 bg-surface-elevated/60 pl-9 pr-24 text-sm"
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="absolute right-16 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ⌘J
          </kbd>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[--radix-popover-trigger-width] rounded-xl border-border/60 bg-popover/95 p-1.5 backdrop-blur-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {filtered.length > 0 && (
          <div className="mb-1">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Suggestions
            </div>
            {filtered.map((s) => {
              const Icon = iconFor(s.type);
              return (
                <button
                  key={s.label}
                  onClick={() => {
                    onChange(s.label);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-surface-elevated/70"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="flex-1 truncate">{s.label}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.type}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}