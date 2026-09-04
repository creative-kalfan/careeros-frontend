import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import {
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  FileCheck2,
  CheckCircle2,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/_auth/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up · CareerOS" },
      {
        name: "description",
        content:
          "Create your CareerOS profile to build your verified career intelligence workspace.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const {
    register,
    isLoading,
    error,
    clearError,
    isAuthenticated,
    fetchProfile,
    profile,
    isProfileLoading,
  } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle redirect after signup
  useEffect(() => {
    if (isAuthenticated && !isProfileLoading) {
      if (profile) {
        if (profile.onboardingCompleted) {
          navigate({ to: "/dashboard", replace: true });
        } else {
          navigate({ to: "/onboarding", replace: true });
        }
      } else {
        // Fetch profile if not loaded
        fetchProfile();
      }
    }
  }, [isAuthenticated, isProfileLoading, profile, fetchProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(email, password, name);
      // Profile will be fetched in the useEffect above
    } catch {
      // Error is set in context
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
      {/* Left Column: Positioning & Conversion Framing (Secondary on Mobile) */}
      <div className="lg:col-span-7 flex flex-col justify-center text-left pt-2 lg:pt-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#1A1916] border border-[#302E29] text-[#A8A49A] mb-4 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#315CFF]" />
          <span>Career Workspace</span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F3F0E8] leading-[1.14]">
          Build once.
          <br />
          <span className="text-[#315CFF]">Apply with intent.</span>
        </h1>

        <p className="text-sm sm:text-base text-[#A8A49A] leading-relaxed mt-3 sm:mt-4 max-w-lg">
          Create your CareerOS profile and turn your experience into a career system you can
          continuously improve.
        </p>

        {/* 3 Core Value Proofs */}
        <div className="mt-6 sm:mt-8 space-y-3.5 max-w-lg">
          <div className="flex items-start gap-3 text-xs sm:text-sm text-[#A8A49A]">
            <div className="mt-0.5 rounded-md p-1.5 bg-[#1A1916] border border-[#302E29] text-[#315CFF] shrink-0">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-medium text-[#F3F0E8]">Don't start from a blank page.</span>{" "}
              Turn your existing background into a structured intelligence base.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs sm:text-sm text-[#A8A49A]">
            <div className="mt-0.5 rounded-md p-1.5 bg-[#1A1916] border border-[#302E29] text-[#315CFF] shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#45A875]" />
            </div>
            <div>
              <span className="font-medium text-[#F3F0E8]">Zero experience fabrication.</span>{" "}
              Suggests truthful bullet refinements based solely on your real achievements.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs sm:text-sm text-[#A8A49A]">
            <div className="mt-0.5 rounded-md p-1.5 bg-[#1A1916] border border-[#302E29] text-[#315CFF] shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-medium text-[#F3F0E8]">Role-specific derived versions.</span>{" "}
              Master resume stays untouched while you adapt to specific openings.
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Signup Form Card (Primary on Mobile) */}
      <div className="lg:col-span-5 w-full max-w-md mx-auto lg:mx-0">
        <div className="rounded-2xl border border-[#302E29] bg-[#1A1916]/90 p-6 sm:p-8 backdrop-blur-sm shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-[#F3F0E8]">
              Create your profile
            </h2>
            <p className="mt-1 text-xs text-[#A8A49A]">
              Start building your structured career intelligence system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-[#E4573D]/30 bg-[#E4573D]/10 px-3.5 py-2.5 text-xs text-[#E4573D] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-[#F3F0E8]">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                required
                className="flex h-11 w-full rounded-xl border border-[#302E29] bg-[#11110F] px-3.5 py-2 text-sm text-[#F3F0E8] placeholder:text-[#6E6B63] transition-colors focus:border-[#315CFF] focus:outline-none focus:ring-1 focus:ring-[#315CFF]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-[#F3F0E8]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="flex h-11 w-full rounded-xl border border-[#302E29] bg-[#11110F] px-3.5 py-2 text-sm text-[#F3F0E8] placeholder:text-[#6E6B63] transition-colors focus:border-[#315CFF] focus:outline-none focus:ring-1 focus:ring-[#315CFF]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-[#F3F0E8]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min. 6 characters)"
                  required
                  minLength={6}
                  className="flex h-11 w-full rounded-xl border border-[#302E29] bg-[#11110F] px-3.5 pr-10 py-2 text-sm text-[#F3F0E8] placeholder:text-[#6E6B63] transition-colors focus:border-[#315CFF] focus:outline-none focus:ring-1 focus:ring-[#315CFF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A49A] hover:text-[#F3F0E8] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#315CFF] hover:bg-[#274BDB] active:bg-[#1E3EB8] text-sm font-medium text-[#F3F0E8] transition shadow-md shadow-[#315CFF]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating profile...</span>
                </>
              ) : (
                <>
                  <span>Create my CareerOS profile</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#302E29]/80 text-center text-xs text-[#A8A49A]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#F3F0E8] hover:text-[#315CFF] transition-colors inline-flex items-center gap-1"
            >
              <span>Sign in</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
