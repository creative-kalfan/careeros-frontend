import type { ComponentType, ReactNode } from "react";
import { AlertCircle, RefreshCw, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  icon?: ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  error?: unknown;
  errorCode?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

/**
 * Standardized error state container for clean, unified error handling across CareerOS.
 */
export function ErrorState({
  icon: Icon = AlertCircle,
  title = "Telemetry Error Encountered",
  description,
  error,
  errorCode,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  const errorMessage =
    description ??
    (error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "An unexpected telemetry or network error occurred. Please retry.");

  return (
    <div
      className={cn(
        "workstation-instrument flex flex-col items-center justify-center gap-3.5 rounded-xl border border-destructive/30 bg-destructive/5 p-8 sm:p-10 text-center shadow-inner-recessed",
        className,
      )}
      role="alert"
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/25 shadow-elevation-1">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 max-w-md space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {errorMessage && (
          <p className="text-xs text-muted-foreground leading-relaxed">{errorMessage}</p>
        )}
      </div>

      {errorCode && (
        <div className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-surface-instrument px-2.5 py-1 text-[10px] text-muted-foreground font-mono">
          <Terminal className="h-3 w-3 text-destructive" />
          <span>DIAG: {errorCode}</span>
        </div>
      )}

      {(onRetry || action) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8 gap-1.5 rounded-lg text-xs border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
