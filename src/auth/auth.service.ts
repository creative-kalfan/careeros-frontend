import { supabase } from "../lib/supabase";
import type {
  User,
  Session,
  Tokens,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "./auth.types";

function mapSupabaseUser(sbUser: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | undefined;
  email_confirmed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}): User {
  const metadata = sbUser.user_metadata as Record<string, unknown> | undefined;
  const appMeta = sbUser.app_metadata as Record<string, unknown> | undefined;

  return {
    id: sbUser.id,
    email: sbUser.email ?? "",
    name: (metadata?.full_name as string) || (metadata?.name as string) || sbUser.email?.split("@")[0] || "User",
    avatar: metadata?.avatar_url as string | undefined,
    role: (appMeta?.role as User["role"]) || "user",
    permissions: [],
    emailVerified: !!sbUser.email_confirmed_at,
    createdAt: sbUser.created_at ?? new Date().toISOString(),
    updatedAt: sbUser.updated_at ?? new Date().toISOString(),
  };
}

function mapSupabaseSession(sbSession: {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  user: any;
}): { user: User; tokens: Tokens; session: Session } {
  const user = mapSupabaseUser(sbSession.user);
  const tokens: Tokens = {
    accessToken: sbSession.access_token,
    refreshToken: sbSession.refresh_token,
    expiresIn: sbSession.expires_in ?? 3600,
    refreshExpiresIn: 60 * 60 * 24 * 30, // 30 days
  };
  const session: Session = {
    id: sbSession.user.id,
    userId: sbSession.user.id,
    createdAt: sbSession.user.created_at ?? new Date().toISOString(),
    expiresAt: sbSession.expires_at
      ? new Date(sbSession.expires_at * 1000).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString(),
    lastActivityAt: new Date().toISOString(),
  };
  return { user, tokens, session };
}

export const authService = {
  login: async (data: LoginRequest): Promise<{ user: User; tokens: Tokens; session: Session }> => {
    console.log("Calling backend: Supabase signInWithPassword");
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    console.log("Backend returned: Supabase signInWithPassword", {
      hasError: Boolean(error),
      hasSession: Boolean(authData.session),
    });

    if (error) {
      throw {
        code: "INVALID_CREDENTIALS",
        message: error.message,
        statusCode: 401,
      };
    }

    if (!authData.session) {
      throw {
        code: "UNKNOWN_ERROR",
        message: "No session returned from login",
        statusCode: 500,
      };
    }

    return mapSupabaseSession(authData.session);
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    }
  },

  register: async (data: RegisterRequest): Promise<{ user: User; tokens: Tokens }> => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    });

    if (error) {
      throw {
        code: "UNKNOWN_ERROR",
        message: error.message,
        statusCode: 400,
      };
    }

    if (!authData.user) {
      throw {
        code: "UNKNOWN_ERROR",
        message: "Registration failed",
        statusCode: 400,
      };
    }

    const user = mapSupabaseUser(authData.user);
    
    // If no session is returned (email confirmation required), return user without tokens
    if (!authData.session) {
      return { 
        user, 
        tokens: {
          accessToken: "",
          refreshToken: "",
          expiresIn: 0,
          refreshExpiresIn: 0,
        }
      };
    }

    const tokens: Tokens = {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresIn: authData.session.expires_in ?? 3600,
      refreshExpiresIn: 60 * 60 * 24 * 30,
    };

    return { user, tokens };
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw {
        code: "UNKNOWN_ERROR",
        message: error.message,
        statusCode: 400,
      };
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw {
        code: "UNKNOWN_ERROR",
        message: error.message,
        statusCode: 400,
      };
    }
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<void> => {
    // Supabase handles email verification via magic link
    // This is a no-op since verification is done through the email link
    console.log("Email verification handled by Supabase:", data.token);
  },

  refreshToken: async (refreshToken: string): Promise<{ tokens: Tokens }> => {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      throw {
        code: "TOKEN_EXPIRED",
        message: "Session expired",
        statusCode: 401,
      };
    }

    const tokens: Tokens = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in ?? 3600,
      refreshExpiresIn: 60 * 60 * 24 * 30,
    };

    return { tokens };
  },

  getCurrentUser: async (): Promise<User> => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      throw {
        code: "TOKEN_EXPIRED",
        message: "No authenticated user",
        statusCode: 401,
      };
    }

    return mapSupabaseUser(data.user);
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return null;
    }
    return mapSupabaseSession(data.session);
  },

  // Fetch profile with onboarding status
  getProfile: async (): Promise<{
    onboardingCompleted: boolean;
    onboardingStep: number;
  } | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("onboarding_completed, onboarding_step")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return null;
    }

    return {
      onboardingCompleted: profile.onboarding_completed ?? false,
      onboardingStep: profile.onboarding_step ?? 0,
    };
  },

  // Update profile onboarding step
  updateOnboardingStep: async (step: number): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No authenticated user");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_step: step,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  },

  // Complete onboarding
  completeOnboarding: async (): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No authenticated user");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        onboarding_step: 10,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  },
};

export type AuthService = typeof authService;