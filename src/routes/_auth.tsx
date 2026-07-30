import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { AuthLoadingSpinner } from "../auth/components/AuthLoadingSpinner";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, isLoading, fetchProfile, profile, isProfileLoading } = useAuth();

  // Handle redirect for already authenticated users
  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (isAuthenticated) {
      // Fetch profile to check onboarding status
      if (!profile && !isProfileLoading) {
        fetchProfile();
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, fetchProfile, profile, isProfileLoading]);

  // Handle redirect after profile is loaded
  useEffect(() => {
    if (isAuthenticated && profile && !isProfileLoading) {
      console.log("Navigation", {
        destination: profile.onboardingCompleted ? "/dashboard" : "/onboarding",
      });
      if (profile.onboardingCompleted) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        navigate({ to: "/onboarding", replace: true });
      }
    }
  }, [isAuthenticated, profile, isProfileLoading, navigate]);

  // Show loading while initializing
  if (!isInitialized || isLoading || (isAuthenticated && isProfileLoading)) {
    return <AuthLoadingSpinner />;
  }

  // If authenticated, show loading (redirect will happen in useEffect)
  if (isAuthenticated) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="bg-app flex min-h-dvh items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
