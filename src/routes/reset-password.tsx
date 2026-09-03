import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { ArrowRight, AlertCircle, Loader2, Compass, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set New Password · CareerOS" },
      { name: "description", content: "Set a new password for your CareerOS account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      return;
    }

    try {
      await resetPassword("", password);
      setSuccess(true);
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
            {success ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-xl bg-[#45A875]/10 border border-[#45A875]/30 flex items-center justify-center text-[#45A875]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-[#F3F0E8]">Password updated</h1>
                  <p className="mt-1 text-xs text-[#A8A49A]">
                    Your password has been successfully reset.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#315CFF] hover:bg-[#274BDB] text-sm font-medium text-[#F3F0E8] transition shadow-md shadow-[#315CFF]/20 cursor-pointer mt-4"
                >
                  <span>Sign in with new password</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div>
                <div className="mb-6 text-left">
                  <h1 className="text-xl font-semibold tracking-tight text-[#F3F0E8]">Set new password</h1>
                  <p className="mt-1 text-xs text-[#A8A49A]">Enter your new password below</p>
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
                    <label htmlFor="password" className="text-xs font-medium text-[#F3F0E8]">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
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

                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-xs font-medium text-[#F3F0E8]">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      className="flex h-11 w-full rounded-xl border border-[#302E29] bg-[#11110F] px-3.5 py-2 text-sm text-[#F3F0E8] placeholder:text-[#6E6B63] transition-colors focus:border-[#315CFF] focus:outline-none focus:ring-1 focus:ring-[#315CFF]"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-[#E4573D] mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || (!!confirmPassword && password !== confirmPassword)}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-[#315CFF] hover:bg-[#274BDB] active:bg-[#1E3EB8] text-sm font-medium text-[#F3F0E8] transition shadow-md shadow-[#315CFF]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[#302E29]/80 text-center text-xs text-[#A8A49A]">
                  Remember your password?{" "}
                  <Link to="/login" className="font-medium text-[#F3F0E8] hover:text-[#315CFF] transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
