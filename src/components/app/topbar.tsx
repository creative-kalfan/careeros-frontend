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
  if (pathname === "/ats" || pathname === "/ats-history")
    return { area: "Resume Studio", doc: "Match Intelligence" };
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
    <header className="border-b-2 border-border bg-background sticky top-0 z-40 flex h-13 items-center gap-3 px-3 sm:px-5 select-none">
      <SidebarTrigger className="h-8 w-8 rounded-md border-2 border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated hover:shadow-brutal-xs transition-all cursor-pointer" />
      <Separator orientation="vertical" className="h-5 bg-border" />

      {/* Active Workstation Context Breadcrumb */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        <Compass className="h-3.5 w-3.5 text-primary" />
        <span className="font-bold text-foreground tracking-tight">{routeCtx.area}</span>
        <span className="text-muted-foreground/60 font-mono">/</span>
        <span className="text-muted-foreground font-mono text-xs font-medium">{routeCtx.doc}</span>
      </div>

      <Separator orientation="vertical" className="hidden lg:block h-5 bg-border" />

      <button
        onClick={onOpenCommand}
        className="group flex h-8.5 min-w-0 flex-1 items-center gap-2.5 rounded-md border-2 border-border bg-surface px-3 text-left text-xs text-muted-foreground transition-all hover:border-foreground/80 hover:shadow-brutal-xs sm:max-w-md shadow-inner-recessed cursor-pointer"
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="truncate text-xs font-normal">
          Search command bar, resumes, jobs, interviews…
        </span>
        <span className="ml-auto hidden items-center gap-1 sm:flex">
          <Kbd className="bg-muted border-2 border-border text-xs px-1.5 py-0.5 font-mono font-bold">⌘K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Quick Copilot Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggle}
          className={`h-8 gap-1.5 rounded-md text-xs px-2.5 transition-all ${
            open
              ? "bg-primary text-primary-foreground border-2 border-primary shadow-brutal-xs"
              : "border-2 border-border bg-surface hover:bg-surface-elevated text-foreground shadow-brutal-xs"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline font-bold">Copilot</span>
        </Button>

        <ThemeToggle />

        <Button
          asChild
          variant="outline"
          size="icon"
          className="relative h-8 w-8 rounded-md border-2 border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated shadow-brutal-xs"
          aria-label="Notifications"
        >
          <Link to="/notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenCommand}
          className="h-8 w-8 rounded-md border-2 border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated shadow-brutal-xs sm:hidden"
          aria-label="Command"
        >
          <CommandIcon className="h-4 w-4" />
        </Button>
        <AccountMenu />
      </div>
    </header>
  );
}
