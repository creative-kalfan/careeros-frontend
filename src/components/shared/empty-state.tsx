import type { ComponentType, ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-background/20 p-8 text-center",
        className,
      )}
      role="status"
    >
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-background/60 text-muted-foreground ring-1 ring-border/60">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
