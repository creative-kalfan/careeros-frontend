import { apiConfig } from "../api/config";
import { ApiClientError } from "./api-error";
import type { ApiError } from "../types/api/ApiError.ts";
import { attachAuthToken } from "../auth/http-interceptor";

export type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export async function request<T>(options: RequestOptions): Promise<T> {
  const url = `${apiConfig.baseUrl}${options.path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

  // Use Supabase session token instead of localStorage
  const headers: Record<string, string> = {
    ...apiConfig.defaultHeaders,
    ...options.headers,
  };
  const authHeaders = await attachAuthToken(headers);

  try {
    const response = await fetch(url, {
      method: options.method,
      headers: authHeaders,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
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