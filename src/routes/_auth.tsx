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

    if (isAuthenticated && !isProfileLoading) {
      if (profile?.onboardingCompleted) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        navigate({ to: "/onboarding", replace: true });
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, fetchProfile, profile, isProfileLoading, navigate]);

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
