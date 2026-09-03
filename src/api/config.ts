import { env } from "../config/env.ts";

export const apiConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 30000,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
};

export type ApiConfig = typeof apiConfig;
