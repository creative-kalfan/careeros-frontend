import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Gauge,
  Briefcase,
  Sparkles,
  KanbanSquare,
  Bell,
  User,
  Settings,
  Command,
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

type NavItem = { title: string; url: string; icon: typeof LayoutDashboard };

const workspace: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Resumes", url: "/resumes", icon: FileText },
  { title: "ATS Studio", url: "/ats", icon: Gauge },
];

const intelligence: NavItem[] = [
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Recommendations", url: "/recommendations", icon: Sparkles },
  { title: "Applications", url: "/applications", icon: KanbanSquare },
  { title: "AI Copilot", url: "/copilot", icon: Sparkles },
];

const personal: NavItem[] = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

function Section({ label, items, currentPath }: { label: string; items: NavItem[]; currentPath: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = currentPath === item.url || currentPath.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="h-10 rounded-xl px-3 text-sm data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:shadow-[inset_0_0_0_1px_var(--border)]"
                >
                  <Link to={item.url} className="flex items-center gap-3">
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{item.title}</span>
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
    <Sidebar collapsible="icon" className="glass-sidebar border-r border-sidebar-border">
      <SidebarHeader className="px-3 pt-4 pb-2">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
            <span className="font-mono text-sm font-bold text-primary-foreground">C</span>
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">CareerOS</span>
            <span className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              AI Career OS
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <Section label="Workspace" items={workspace} currentPath={currentPath} />
        <Section label="Intelligence" items={intelligence} currentPath={currentPath} />
        <Section label="Personal" items={personal} currentPath={currentPath} />
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4 group-data-[collapsible=icon]:hidden">
        <div className="rounded-xl border border-border/70 bg-surface-elevated/60 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Command className="h-3.5 w-3.5" />
            <span>Press</span>
            <kbd className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
            <span>anywhere</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
