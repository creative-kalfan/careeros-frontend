import type { ComponentType, ReactNode } from "react";
import { Inbox, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  guidance,
  action,
  secondaryAction,
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  guidance?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "workstation-instrument relative flex flex-col items-center justify-center gap-3.5 rounded-xl border border-dashed border-border/80 p-8 sm:p-12 text-center shadow-inner-recessed",
        className,
      )}
      role="status"
    >
      <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-surface-elevated text-primary ring-1 ring-border/80 shadow-elevation-1">
        <Icon className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary/40 ring-2 ring-background animate-pulse" />
      </div>
      <div className="min-w-0 max-w-md space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {guidance && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] text-primary/90 font-mono">
          <Compass className="h-3 w-3 shrink-0" />
          <span>{guidance}</span>
        </div>
      )}

      {(action || secondaryAction) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
