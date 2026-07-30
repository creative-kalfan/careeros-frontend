import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password · CareerOS" },
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

  if (success) {
    return (
      <div className="bg-app flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold tracking-tight">Password updated</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been successfully reset.
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign in with new password
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error.message}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || (!!confirmPassword && password !== confirmPassword)}
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}