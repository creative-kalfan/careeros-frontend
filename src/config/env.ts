const getEnv = (key: string, defaultValue?: string): string => {
  const processValue = typeof process !== "undefined" && process.env ? process.env[key] : undefined;
  if (processValue !== undefined && processValue !== "") {
    return processValue;
  }

  const metaValue =
    typeof import.meta !== "undefined" && import.meta.env ? import.meta.env[key] : undefined;
  if (metaValue !== undefined && metaValue !== "") {
    return metaValue;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(
    `Missing required environment variable: ${key}\n` +
      `Create a .env file in the project root with:\n` +
      `${key}=your_value`,
  );
};

export const env = {
  VITE_API_BASE_URL: getEnv("VITE_API_BASE_URL", "http://localhost:8000"),
  VITE_SUPABASE_URL: getEnv("VITE_SUPABASE_URL"),
  VITE_SUPABASE_ANON_KEY: getEnv("VITE_SUPABASE_ANON_KEY"),
} as const;

export type Env = typeof env;
