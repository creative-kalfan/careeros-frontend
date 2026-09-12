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

  // Show loading while initializing. A background profile refetch
  // (isProfileLoading) must NOT unmount the whole layout when a cached
  // profile already exists — that would flash the sidebar/topbar out and
  // remount them on every route change. The `!profile` gate below still
  // hard-blocks protected content until a confirmed profile arrives.
  if (!isInitialized || isLoading) {
    return <AuthLoadingSpinner />;
  }

  // If not authenticated, show loading (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return <AuthLoadingSpinner />;
  }

  // STRICT ONBOARDING GATE (root layout level):
  // While authenticated, if we don't yet have a confirmed profile we must NOT
  // render any protected content. A failed fetch shows a retryable error — it
  // must never spin forever (fetchProfile latches failures by design).
  if (isAuthenticated && !profile && !isProfileLoading && profileFetchFailed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-base font-semibold">Couldn&apos;t load your profile</h2>
        <p className="max-w-xs text-xs text-muted-foreground">
          Check your connection and try again. If this persists, sign out and back in.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchProfile(true)}>
            Retry
          </Button>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }
  if (isAuthenticated && !profile) {
    return <AuthLoadingSpinner />;
  }

  // If profile exists and onboarding not completed, allow rendering onboarding route
  // Only show loading spinner if we're NOT on the onboarding route yet
  if (profile && !profile.onboardingCompleted && !isOnboardingRoute) {
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
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col">
            <AppTopbar onOpenCommand={() => setCmdOpen(true)} />
            <main className="min-w-0 flex-1">
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
