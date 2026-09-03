import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { ArrowRight, AlertCircle, Loader2, Compass, ArrowLeft, MailCheck } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password · CareerOS" },
      { name: "description", content: "Reset your CareerOS account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // Error is set in context
    }
  };

  return (
    <div className="relative min-h-dvh flex flex-col justify-between bg-[#11110F] text-[#F3F0E8] selection:bg-[#315CFF]/30 selection:text-[#F3F0E8] overflow-x-hidden">
      {/* Subtle grid backdrop */}
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
          <Link
            to="/login"
            className="text-xs sm:text-sm font-medium text-[#A8A49A] hover:text-[#F3F0E8] transition py-1.5 px-3 rounded-lg hover:bg-[#1A1916] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </header>

      {/* Center Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[#302E29] bg-[#1A1916]/90 p-6 sm:p-8 backdrop-blur-sm shadow-2xl shadow-black/50">
            <div className="mb-6 text-left">
              <h1 className="text-xl font-semibold tracking-tight text-[#F3F0E8]">Reset password</h1>
              <p className="mt-1 text-xs text-[#A8A49A]">
                Enter your account email and we'll send you a secure reset link.
              </p>
            </div>

            {sent ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#45A875]/30 bg-[#45A875]/10 px-4 py-3.5 text-xs text-[#45A875] flex items-start gap-2.5">
                  <MailCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Check your email for a password reset link to access your workspace.</span>
                </div>
                <Link
                  to="/login"
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#315CFF] hover:bg-[#274BDB] text-sm font-medium text-[#F3F0E8] transition shadow-md shadow-[#315CFF]/20 cursor-pointer"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#315CFF] hover:bg-[#274BDB] active:bg-[#1E3EB8] text-sm font-medium text-[#F3F0E8] transition shadow-md shadow-[#315CFF]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send reset link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-[#302E29]/80 text-center text-xs text-[#A8A49A]">
              Remember your password?{" "}
              <Link to="/login" className="font-medium text-[#F3F0E8] hover:text-[#315CFF] transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
