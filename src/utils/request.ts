import { apiConfig } from "../api/config";
import { ApiClientError } from "./api-error";
import type { ApiError } from "../types/api/ApiError.ts";
import { attachAuthToken } from "../auth/http-interceptor";
import { supabase } from "../lib/supabase";

export type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  // Per-request timeout override (ms). Defaults to apiConfig.timeout (30s).
  // Long-running document calls (tailor / apply-tailoring / export, which can
  // invoke the LLM gateway with its own 25-30s budgets) must pass the shared
  // LONG_REQUEST_TIMEOUT_MS instead of being aborted mid-flight.
  timeoutMs?: number;
};

function toApiError(payload: unknown, status: number, fallback: string): ApiError {
  const p = (payload ?? {}) as Record<string, any>;
  const nested = (p.error ?? {}) as Record<string, any>;
  const message =
    (typeof nested.message === "string" && nested.message) ||
    (typeof p.detail === "string" && p.detail) ||
    (typeof p.message === "string" && p.message) ||
    fallback;
  const code =
    (typeof nested.code === "string" && nested.code) ||
    (typeof p.code === "string" && p.code) ||
    undefined;
  return { message, code, statusCode: status, details: p.details ?? nested };
}

export async function request<T>(options: RequestOptions): Promise<T> {
  const url = `${apiConfig.baseUrl}${options.path}`;
  const timeoutMs = options.timeoutMs ?? apiConfig.timeout;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Use Supabase session token instead of localStorage
  const headers: Record<string, string> = {
    ...apiConfig.defaultHeaders,
    ...options.headers,
  };
  const authHeaders = await attachAuthToken(headers);

  try {
    let response = await fetch(url, {
      method: options.method,
      headers: authHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Diagnostic guard: an unhandled backend exception produces a response
    // with no CORS headers, which browsers misleadingly report as a CORS
    // failure. Surface the real status instead of a generic CORS symptom.
    if (
      !response.ok &&
      ![...response.headers.keys()].some(
        (k) => k.toLowerCase() === "access-control-allow-origin",
      ) &&
      response.status >= 500
    ) {
      console.error(
        `[api] ${options.method} ${options.path} failed with HTTP ${response.status} and no CORS headers — ` +
          `this is a backend exception, not a CORS misconfiguration.`,
      );
    }

    if (!response.ok) {
      // One authoritative 401 path: refresh the Supabase session once via the
      // existing interceptor and retry the original request. Prevents expired
      // access tokens from surfacing as 401 errors to feature code.
      if (response.status === 401) {
        // Single authoritative 401 path: refresh the Supabase session once
        // (refreshSession uses the existing refresh token — no new token
        // store) and retry the original request with the new access token.
        // A second 401 is a genuine auth failure and propagates normally.
        // NOTE: the retry uses a FRESH AbortController + timeout. Reusing the
        // original signal left retried requests with no timeout at all (its
        // timer was already cleared), so a hung server hung the UI forever.
        const { data: refreshed } = await supabase.auth.refreshSession();
        const newToken = refreshed?.session?.access_token;
        if (newToken) {
          const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), timeoutMs);
          try {
            const retried = await fetch(url, {
              method: options.method,
              headers: retryHeaders,
              body: options.body ? JSON.stringify(options.body) : undefined,
              signal: retryController.signal,
            });
            if (retried.ok) {
              if (retried.status === 204) {
                return undefined as T;
              }
              return (await retried.json()) as T;
            }
            // Fall through to normal error handling for the retried response.
            response = retried;
          } finally {
            clearTimeout(retryTimeoutId);
          }
        }
      }

      let errorData: ApiError;
      try {
        errorData = toApiError(
          await response.json(),
          response.status,
          response.statusText || "Request failed",
        );
      } catch {
        errorData = {
          message: response.statusText || "Request failed",
          statusCode: response.status,
        };
      }
      throw new ApiClientError(errorData);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiClientError({
          message: "Request timeout",
          statusCode: 408,
          code: "TIMEOUT",
        });
      }
      throw new ApiClientError({
        message: error.message,
        statusCode: 0,
        code: "NETWORK_ERROR",
      });
    }

    throw new ApiClientError({
      message: "An unexpected error occurred",
      statusCode: 0,
      code: "UNKNOWN_ERROR",
    });
  }
}

export async function requestBlob(
  options: Omit<RequestOptions, "method"> & { method: "GET" },
): Promise<Blob> {
  const url = `${apiConfig.baseUrl}${options.path}`;
  const timeoutMs = options.timeoutMs ?? apiConfig.timeout;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    ...apiConfig.defaultHeaders,
    ...options.headers,
  };
  const authHeaders = await attachAuthToken(headers);

  try {
    const response = await fetch(url, {
      method: options.method,
      headers: authHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = toApiError(
          await response.json(),
          response.status,
          response.statusText || "Request failed",
        );
      } catch {
        errorData = {
          message: response.statusText || "Request failed",
          statusCode: response.status,
        };
      }
      throw new ApiClientError(errorData);
    }

    return await response.blob();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiClientError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiClientError({
          message: "Request timeout",
          statusCode: 408,
          code: "TIMEOUT",
        });
      }
      throw new ApiClientError({
        message: error.message,
        statusCode: 0,
        code: "NETWORK_ERROR",
      });
    }

    throw new ApiClientError({
      message: "An unexpected error occurred",
      statusCode: 0,
      code: "UNKNOWN_ERROR",
    });
  }
}
