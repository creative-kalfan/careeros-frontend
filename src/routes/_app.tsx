import { Outlet, createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/sidebar";
import { AppTopbar } from "@/components/app/topbar";
import { CommandPalette } from "@/components/app/command-palette";
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
    logout,
  } = useAuth();

  // Check if current route is the onboarding route
  const isOnboardingRoute = location.pathname === "/onboarding";

  // Fetch profile on mount when authenticated
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
  }, [isInitialized, isLoading, isAuthenticated, profile, isProfileLoading, isOnboardingRoute, navigate]);

  // Show loading while initializing or loading profile
  if (!isInitialized || isLoading || (isAuthenticated && isProfileLoading)) {
    return <AuthLoadingSpinner />;
  }

  // If not authenticated, show loading (redirect will happen in useEffect)
  if (!isAuthenticated) {
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
            <AppTopbar onOpenCommand={() => setCmdOpen(true)} onLogout={logout} />
            <main className="flex-1">
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
