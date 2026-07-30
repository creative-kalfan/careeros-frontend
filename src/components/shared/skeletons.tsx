import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/** Reusable skeleton primitives for consistent loading states across CareerOS. */

export function SkeletonCard({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("glass rounded-2xl border border-border/60 p-5", className)} aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3 rounded" />
          <Skeleton className="h-2.5 w-2/3 rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-2.5 rounded" style={{ width: `${90 - i * 12}%` }} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <ul className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: items }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/20 p-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-2.5 w-2/3 rounded" />
            <Skeleton className="h-2 w-1/2 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-xl", className)} aria-hidden />;
}
