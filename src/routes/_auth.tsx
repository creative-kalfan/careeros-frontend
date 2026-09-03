import { Outlet, createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { AuthLoadingSpinner } from "../auth/components/AuthLoadingSpinner";
import { Compass, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, isLoading, fetchProfile, profile, isProfileLoading } =
    useAuth();

  // Handle redirect for already authenticated users.
  useEffect(() => {
    if (!isInitialized || isLoading || !isAuthenticated) return;

    // Profile query in flight — wait for it to resolve.
    if (isProfileLoading) return;

    // Profile never fetched (e.g., right after sign-in) — trigger the fetch
    // instead of assuming onboarding is incomplete.
    if (!profile) {
      fetchProfile();
      return;
    }

    // Profile resolved — safe to decide.
    if (profile.onboardingCompleted) {
      navigate({ to: "/dashboard", replace: true });
    } else {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [
    isInitialized,
    isLoading,
    isAuthenticated,
    fetchProfile,
    profile,
    isProfileLoading,
    navigate,
  ]);

  // Show loading while initializing
  if (!isInitialized || isLoading || (isAuthenticated && isProfileLoading)) {
    return <AuthLoadingSpinner />;
  }

  // If authenticated, show loading (redirect will happen in useEffect)
  if (isAuthenticated) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="relative min-h-dvh flex flex-col justify-between bg-[#11110F] text-[#F3F0E8] selection:bg-[#315CFF]/30 selection:text-[#F3F0E8] overflow-x-hidden">
      {/* Subtle textured grid backdrop */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(243, 240, 232, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(243, 240, 232, 0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 90%)",
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-[#302E29]/60 bg-[#11110F]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#1A1916] border border-[#302E29] flex items-center justify-center text-[#315CFF] group-hover:border-[#315CFF]/40 transition">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-[#F3F0E8]">CareerOS</span>
              <span className="hidden sm:inline text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#1A1916] border border-[#302E29] text-[#A8A49A]">
                Career Intelligence
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs sm:text-sm font-medium text-[#A8A49A] hover:text-[#F3F0E8] transition py-1.5 px-3 rounded-lg hover:bg-[#1A1916]"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form + Context Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Outlet />
      </main>

      {/* Trust Footnote */}
      <footer className="relative z-10 border-t border-[#302E29]/50 py-4 px-4 text-center bg-[#11110F]/60">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] text-[#A8A49A]">
          <span className="flex items-center gap-1.5 text-[#45A875]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero Experience Fabrication
          </span>
          <span className="text-[#302E29]">·</span>
          <span>Deterministic Matching</span>
          <span className="text-[#302E29]">·</span>
          <span>Role-Specific Applications</span>
          <span className="text-[#302E29]">·</span>
          <span>© {new Date().getFullYear()} CareerOS</span>
        </div>
      </footer>
    </div>
  );
}
