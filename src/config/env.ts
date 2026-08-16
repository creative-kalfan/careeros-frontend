const getEnv = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  if (value !== undefined && value !== "") {
    return value;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(
    `Missing required environment variable: ${key}\n` +
      `Create a .env file in the project root with:\n` +
      `${key}=your_value`
  );
};

export const env = {
  VITE_API_BASE_URL: getEnv("VITE_API_BASE_URL", "http://localhost:8000"),
  VITE_SUPABASE_URL: getEnv("VITE_SUPABASE_URL"),
  VITE_SUPABASE_ANON_KEY: getEnv("VITE_SUPABASE_ANON_KEY"),
} as const;

export type Env = typeof env;