import { useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue, User, Session, Tokens, AuthStatus, AuthError, OnboardingProfile } from "./auth.types";
import { authService } from "./auth.service";
import { supabase } from "../lib/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<AuthError | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("AUTH INIT START");
      try {
        console.log("AuthProvider initialization entered");
        setStatus("loading");

        // Get current session from Supabase
        console.log("BEFORE: await authService.getSession()");
        let result: any;
        try {
          result = await authService.getSession();
          console.log("AFTER: await authService.getSession()");
          console.log("  returned value:", result);
          console.log("  session exists?", Boolean(result));
          console.log("  tokens exist?", Boolean(result?.tokens));
        } catch (e) {
          console.error("ERROR in authService.getSession():", e);
          result = null;
        }

        console.log("========== FRONTEND SESSION DEBUG ==========");
        console.log("getSession result:", result);
        console.log("result?.tokens?.accessToken:", result?.tokens?.accessToken);
        console.log("accessToken length:", result?.tokens?.accessToken?.length);
        console.log("accessToken prefix (first 20):", result?.tokens?.accessToken?.substring(0, 20));

        if (result) {
          // Also verify the user with this token
          console.log("BEFORE: await supabase.auth.getUser(accessToken)");
          let userResult: any;
          try {
            userResult = await supabase.auth.getUser(result.tokens.accessToken);
            console.log("AFTER: await supabase.auth.getUser(accessToken)");
            console.log("  error:", userResult?.error);
            console.log("  user:", userResult?.data?.user);
          } catch (e) {
            console.error("ERROR in supabase.auth.getUser():", e);
            userResult = { error: e, data: { user: null } };
          }

          console.log("========== FRONTEND getUser WITH TOKEN ==========");
          console.log("userResult:", userResult);

          setTokens(result.tokens);
          setUser(result.user);
          setSession(result.session);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setStatus("unauthenticated");
      } finally {
        console.log("Entering finally");
        console.log("Setting isInitialized = true");
        setIsInitialized(true);
        console.log("Leaving initialize()");
      }
    };

    initializeAuth();
  }, []);

  // Listen for Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (supabaseSession) {
          // We re-fetch to get consistent mapping
          try {
            const result = await authService.getSession();
            if (result) {
              setTokens(result.tokens);
              setUser(result.user);
              setSession(result.session);
              setStatus("authenticated");
              setError(null);
            }
          } catch {
            // Fallback: map directly from session
            if (supabaseSession.user) {
              const { user: mappedUser, tokens: mappedTokens, session: mappedSession } =
                mapSessionDirect(supabaseSession);
              setTokens(mappedTokens);
              setUser(mappedUser);
              setSession(mappedSession);
              setStatus("authenticated");
              setError(null);
            }
          }
        }
      } else if (event === "SIGNED_OUT") {
        setTokens(null);
        setUser(null);
        setSession(null);
        setProfile(null);
        setStatus("unauthenticated");
        setError(null);
      } else if (event === "USER_UPDATED") {
        if (supabaseSession?.user) {
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch {
            // Ignore
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper to map session directly without service call
  function mapSessionDirect(sbSession: any) {
    const metadata = sbSession.user?.user_metadata as Record<string, unknown> | undefined;
    const mappedUser: User = {
      id: sbSession.user.id,
      email: sbSession.user.email ?? "",
      name: (metadata?.full_name as string) || (metadata?.name as string) || sbSession.user.email?.split("@")[0] || "User",
      avatar: metadata?.avatar_url as string | undefined,
      role: "user",
      permissions: [],
      emailVerified: !!sbSession.user.email_confirmed_at,
      createdAt: sbSession.user.created_at ?? new Date().toISOString(),
      updatedAt: sbSession.user.updated_at ?? new Date().toISOString(),
    };
    const mappedTokens: Tokens = {
      accessToken: sbSession.access_token,
      refreshToken: sbSession.refresh_token,
      expiresIn: sbSession.expires_in ?? 3600,
      refreshExpiresIn: 60 * 60 * 24 * 30,
    };
    const mappedSession: Session = {
      id: sbSession.user.id,
      userId: sbSession.user.id,
      createdAt: sbSession.user.created_at ?? new Date().toISOString(),
      expiresAt: sbSession.expires_at
        ? new Date(sbSession.expires_at * 1000).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
    return { user: mappedUser, tokens: mappedTokens, session: mappedSession };
  }

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log("login() entered");
      setStatus("loading");
      setError(null);

      console.log("Calling backend");
      const response = await authService.login({ email, password });
      console.log("Backend returned", { userId: response.user.id });

      // Supabase manages its own session persistence
      // No need to manually store tokens

      setTokens(response.tokens);
      setUser(response.user);
      setSession(response.session);
      setStatus("authenticated");
      console.log("login() authenticated state set");
    } catch (err: any) {
      console.error("login() caught error", err);
      const authError: AuthError = {
        code: err?.code || "INVALID_CREDENTIALS",
        message: err?.message || "Invalid email or password",
        statusCode: err?.statusCode || 401,
      };
      setError(authError);
      setStatus("error");
      throw authError;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Supabase manages its own session cleanup
      // No need to manually clear storage

      // Clear state
      setTokens(null);
      setUser(null);
      setSession(null);
      setProfile(null);
      setStatus("unauthenticated");
      setError(null);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      setStatus("loading");
      setError(null);

      const response = await authService.register({ email, password, name });

      // Supabase manages its own session persistence
      // No need to manually store tokens

      setTokens(response.tokens);
      setUser(response.user);
      setStatus("authenticated");
    } catch (err: any) {
      const authError: AuthError = {
        code: err?.code || "UNKNOWN_ERROR",
        message: err?.message || "Registration failed. Please try again.",
        statusCode: err?.statusCode || 400,
      };
      setError(authError);
      setStatus("error");
      throw authError;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setStatus("loading");
      setError(null);
      await authService.forgotPassword({ email });
    } catch (err: any) {
      const authError: AuthError = {
        code: err?.code || "UNKNOWN_ERROR",
        message: err?.message || "Failed to send reset email. Please try again.",
        statusCode: err?.statusCode || 400,
      };
      setError(authError);
      setStatus("error");
      throw authError;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      setStatus("loading");
      setError(null);
      await authService.resetPassword({ token, password });
    } catch (err: any) {
      const authError: AuthError = {
        code: err?.code || "UNKNOWN_ERROR",
        message: err?.message || "Failed to reset password. Please try again.",
        statusCode: err?.statusCode || 400,
      };
      setError(authError);
      setStatus("error");
      throw authError;
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      setStatus("loading");
      setError(null);
      await authService.verifyEmail({ token });
    } catch (err: any) {
      const authError: AuthError = {
        code: err?.code || "UNKNOWN_ERROR",
        message: err?.message || "Failed to verify email. Please try again.",
        statusCode: err?.statusCode || 400,
      };
      setError(authError);
      setStatus("error");
      throw authError;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await authService.refreshToken(tokens.refreshToken);

      // Supabase manages its own session persistence
      // No need to manually store tokens

      setTokens(response.tokens);
    } catch (err) {
      // Refresh failed, logout
      await logout();
      throw err;
    }
  }, [tokens?.refreshToken, logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const profileData = await authService.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const updateOnboardingStep = useCallback(async (step: number) => {
    try {
      await authService.updateOnboardingStep(step);
      setProfile((prev) => ({
        onboardingCompleted: prev?.onboardingCompleted ?? false,
        onboardingStep: step,
      }));
    } catch (err) {
      console.error("Failed to update onboarding step:", err);
      throw err;
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await authService.completeOnboarding();
      setProfile((prev) => ({
        onboardingCompleted: true,
        onboardingStep: 10,
      }));
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      throw err;
    }
  }, []);

  const value: AuthContextValue = useMemo(() => ({
    user,
    session,
    tokens,
    status,
    error,
    isInitialized,
    profile,
    isProfileLoading,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    verifyEmail,
    refreshToken,
    clearError,
    fetchProfile,
    updateOnboardingStep,
    completeOnboarding,
  }), [user, session, tokens, status, error, isInitialized, profile, isProfileLoading, login, logout, register, forgotPassword, resetPassword, verifyEmail, refreshToken, clearError, fetchProfile, updateOnboardingStep, completeOnboarding]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}