import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { AuthLoadingSpinner } from "../auth/components/AuthLoadingSpinner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password · CareerOS" },
      { name: "description", content: "Reset your CareerOS password." },
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
    <div className="bg-app flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/50 bg-primary/10 px-4 py-3 text-sm">
              Check your email for a password reset link.
            </div>
            <a
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <a
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}