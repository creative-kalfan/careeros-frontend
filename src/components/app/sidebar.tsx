import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Sparkles,
  KanbanSquare,
  Mic,
  Bell,
  User,
  Settings,
  Command,
  Activity,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

const workspace: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Resume Studio", url: "/resumes", icon: FileText, badge: "Flagship" },
];

const intelligence: NavItem[] = [
  { title: "Job Intelligence", url: "/jobs", icon: Briefcase },
  { title: "Recommendations", url: "/recommendations", icon: Sparkles },
  { title: "Mission Control", url: "/applications", icon: KanbanSquare },
  { title: "Interview Prep", url: "/interview-prep", icon: Mic },
  { title: "AI Copilot", url: "/copilot", icon: Sparkles, badge: "AI" },
];

const personal: NavItem[] = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

function Section({
  label,
  items,
  currentPath,
}: {
  label: string;
  items: NavItem[];
  currentPath: string;
}) {
  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-2.5">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => {
            const active =
              item.url === "/resumes"
                ? currentPath.startsWith("/resumes") || currentPath.startsWith("/resumes/")
                : currentPath === item.url || currentPath.startsWith(item.url + "/");

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className={`group relative h-9 rounded-md px-2.5 text-xs font-semibold transition-all duration-100 ${
                    active
                      ? "bg-surface-elevated text-foreground border-2 border-primary shadow-brutal-xs"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground border-2 border-transparent hover:border-border"
                  }`}
                >
                  <Link to={item.url} className="flex items-center gap-2.5">
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-sm bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                      />
                    )}
                    <item.icon
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        active
                          ? "text-primary"
                          : "text-muted-foreground/70 group-hover:text-foreground"
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span
                        className={`ml-auto text-xs px-1.5 py-0.5 rounded-sm font-mono font-bold ${
                          active
                            ? "bg-primary text-primary-foreground border border-primary"
                            : "bg-surface-instrument text-muted-foreground border border-border"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar
      collapsible="icon"
      className="glass-sidebar border-r-2 border-sidebar-border select-none"
    >
      <SidebarHeader className="px-3 pt-3.5 pb-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors hover:bg-surface-elevated border-2 border-transparent hover:border-border"
        >
          <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-md border-2 border-primary bg-primary text-primary-foreground font-mono text-xs font-bold tracking-tight shadow-brutal-xs">
            <span>C</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 border border-background" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold tracking-tight text-foreground">
                CareerOS
              </span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 rounded-sm bg-primary/20 text-primary border border-primary/40">
                PRO
              </span>
            </div>
            <span className="truncate text-xs uppercase tracking-wider text-muted-foreground font-mono font-semibold">
              Workstation
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-1 gap-1">
        <Section label="Workspace" items={workspace} currentPath={currentPath} />
        <Section label="Intelligence" items={intelligence} currentPath={currentPath} />
        <Section label="System" items={personal} currentPath={currentPath} />
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3 group-data-[collapsible=icon]:hidden">
        <div className="rounded-lg border-2 border-border bg-surface p-2.5 space-y-2 shadow-brutal-xs">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              <span>Telemetry</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-500">Live RLS</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1.5 border-t-2 border-border">
            <Command className="h-3 w-3 text-primary" />
            <span className="font-medium">Command Bar</span>
            <kbd className="ml-auto rounded-sm border-2 border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-foreground">
              ⌘K
            </kbd>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
