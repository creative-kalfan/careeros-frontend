import { Outlet, createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/sidebar";
import { AppTopbar } from "@/components/app/topbar";
import { CommandPalette } from "@/components/app/command-palette";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { CopilotProvider } from "@/components/copilot/copilot-context";
import { CopilotPanel } from "@/components/copilot/copilot-panel";
import { PageTransition } from "@/components/shared/page-transition";
import { AuthLoadingSpinner } from "../auth/components/AuthLoadingSpinner";
import { useAuth } from "../auth/useAuth";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isInitialized,
    isLoading,
    isAuthenticated,
    fetchProfile,
    profile,
    isProfileLoading,
    profileFetchFailed,
    logout,
  } = useAuth();

  // Check if current route is the onboarding route
  const isOnboardingRoute = location.pathname === "/onboarding";

  // Fetch profile on mount when authenticated (and refetch if it's null so
  // the onboarding gate never renders protected content on a failed fetch).
  useEffect(() => {
    if (isAuthenticated && !profile && !isProfileLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, profile, isProfileLoading, fetchProfile]);

  // Handle redirects based on auth and onboarding state
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isAuthenticated) {
      navigate({ to: "/login", replace: true });
      return;
    }

    // Check onboarding status after profile is loaded
    // Only redirect if NOT already on the onboarding route
    if (isAuthenticated && profile && !isProfileLoading) {
      if (!profile.onboardingCompleted && !isOnboardingRoute) {
        navigate({ to: "/onboarding", replace: true });
      }
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    profile,
    isProfileLoading,
    isOnboardingRoute,
    navigate,
  ]);

  // Show loading while session initializes
  if (!isInitialized || isLoading) {
    return <AuthLoadingSpinner />;
  }

  // If not authenticated, show loading (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return <AuthLoadingSpinner />;
  }

  return (
    <CopilotProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3.25rem",
          } as React.CSSProperties
        }
      >
        <div className="bg-app flex min-h-dvh w-full">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:border focus:border-border-strong focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:text-foreground"
          >
            Skip to content
          </a>
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col">
            <AppTopbar onOpenCommand={() => setCmdOpen(true)} />
            {profileFetchFailed && !profile && (
              <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-xs flex items-center justify-between text-destructive">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    Couldn&apos;t load profile settings. Some preferences may be unavailable.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[11px] px-2"
                  onClick={() => fetchProfile(true)}
                >
                  Retry
                </Button>
              </div>
            )}
            <main id="main" className="min-w-0 flex-1">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </main>
          </SidebarInset>
          <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
          <CopilotPanel />
          <Toaster />
        </div>
      </SidebarProvider>
    </CopilotProvider>
  );
}
