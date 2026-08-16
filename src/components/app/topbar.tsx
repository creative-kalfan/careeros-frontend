import { Bell, Command as CommandIcon, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";

export function AppTopbar({
  onOpenCommand,
}: {
  onOpenCommand: () => void;
}) {
  return (
    <header className="glass-topbar sticky top-0 z-40 flex h-14 items-center gap-3 px-3 sm:px-5">
      <SidebarTrigger className="h-9 w-9 rounded-lg" />
      <Separator orientation="vertical" className="h-6" />

      <button
        onClick={onOpenCommand}
        className="group flex h-9 flex-1 items-center gap-2.5 rounded-xl border border-border bg-surface-elevated/50 px-3 text-left text-sm text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground sm:max-w-md"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Search resumes, jobs, applications…</span>
        <span className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <kbd className="rounded-md border border-border bg-background/70 px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenCommand} className="rounded-full sm:hidden" aria-label="Command">
          <CommandIcon className="h-[18px] w-[18px]" />
        </Button>
        <AccountMenu />
      </div>
    </header>
  );
}