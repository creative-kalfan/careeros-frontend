import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Fades in each route on navigation. Respects prefers-reduced-motion.
 * TODO(polish): swap for View Transitions API once broadly supported.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const key = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={key} className="animate-fade-in motion-reduce:animate-none">
      {children}
    </div>
  );
}
