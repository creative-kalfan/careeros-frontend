import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Command as CommandIcon, Search, Sparkles, Compass } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Kbd } from "@/components/shared/kbd";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";
import { useCopilot } from "@/components/copilot/copilot-context";

function getRouteContext(pathname: string) {
  if (pathname.startsWith("/resumes/")) return { area: "Resume Studio", doc: "Editor & Preview" };
  if (pathname === "/resumes") return { area: "Resume Studio", doc: "Workspace Index" };
  if (pathname === "/resumes/setup") return { area: "Resume Setup", doc: "Onboarding Studio" };
  if (pathname === "/ats") return { area: "ATS Intelligence", doc: "Scoring Engine" };
  if (pathname === "/jobs") return { area: "Job Intelligence", doc: "Match Pipeline" };
  if (pathname === "/recommendations")
    return { area: "AI Recommendations", doc: "Strategic Actions" };
  if (pathname === "/applications") return { area: "Mission Control", doc: "Application Pipeline" };
  if (pathname === "/copilot") return { area: "AI Copilot", doc: "Career Intelligence" };
  if (pathname === "/notifications") return { area: "System Hub", doc: "Notifications" };
  if (pathname === "/settings") return { area: "Workstation", doc: "Settings & Preferences" };
  if (pathname === "/profile") return { area: "Workstation", doc: "Candidate Profile" };
  return { area: "Command Center", doc: "Executive Telemetry" };
}

export function AppTopbar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const routeCtx = getRouteContext(pathname);
  const { toggle, open } = useCopilot();

  return (
    <header className="glass-topbar sticky top-0 z-40 flex h-13 items-center gap-3 px-3 sm:px-5 select-none">
      <SidebarTrigger className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60 transition-colors" />
      <Separator orientation="vertical" className="h-5 bg-border/60" />

      {/* Active Workstation Context Breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        <Compass className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold text-foreground tracking-tight">{routeCtx.area}</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-muted-foreground/80 font-mono text-xs">{routeCtx.doc}</span>
      </div>

      <Separator orientation="vertical" className="hidden lg:block h-5 bg-border/60" />

      <button
        onClick={onOpenCommand}
        className="group flex h-8.5 flex-1 items-center gap-2.5 rounded-lg border border-border/80 bg-surface-instrument/80 px-3 text-left text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-surface-elevated/80 hover:text-foreground sm:max-w-md shadow-inner-recessed"
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors" />
        <span className="truncate text-xs font-normal">
          Search command bar, resumes, jobs, ATS…
        </span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <Kbd className="bg-muted text-xs px-1.5 py-0.5 font-mono">⌘K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Quick Copilot Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggle}
          className={`h-8 gap-1.5 rounded-lg text-xs px-2.5 transition-all ${
            open
              ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_12px_var(--color-primary)]/20"
              : "border-border/80 bg-surface/80 hover:bg-surface-elevated text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="hidden sm:inline font-medium">Copilot</span>
        </Button>

        <ThemeToggle />

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60"
          aria-label="Notifications"
        >
          <Link to="/notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCommand}
          className="h-8 w-8 rounded-lg text-muted-foreground sm:hidden"
          aria-label="Command"
        >
          <CommandIcon className="h-4 w-4" />
        </Button>
        <AccountMenu />
      </div>
    </header>
  );
}
