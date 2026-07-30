import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent keyboard-hint chip. Use for shortcut affordances. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-md border border-border/60 bg-background/60 px-1 font-mono text-[10px] font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
