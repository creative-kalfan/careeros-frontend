import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { AuthLoadingSpinner } from "../auth/components/AuthLoadingSpinner";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({
    meta: [
      { title: "Login · CareerOS" },
      { name: "description", content: "Sign in to your CareerOS account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, isAuthenticated, fetchProfile, profile, isProfileLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle redirect after login
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
    console.log("Login submit handler entered");
    console.log("Validation passed");
    clearError();
    try {
      console.log("Calling login()");
      await login(email, password);
      console.log("login() returned");
      // Profile will be fetched in the useEffect above
    } catch (err) {
      console.log("login() threw", err);
      // Error is set in context
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your CareerOS account
        </p>
      </div>

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          onClick={() => console.log("Login clicked")}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <a
          href="/signup"
          className="font-medium text-foreground hover:underline"
        >
          Create one
        </a>
      </p>
    </div>
  );
}
