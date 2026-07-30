import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { AuthLoadingSpinner } from "../auth/components/AuthLoadingSpinner";

export const Route = createFileRoute("/_auth/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up · CareerOS" },
      { name: "description", content: "Create your CareerOS account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated, fetchProfile, profile, isProfileLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started with CareerOS
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error.message}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

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
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            minLength={6}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}