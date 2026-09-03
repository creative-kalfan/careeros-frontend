export type ApiError = {
  message: string;
  code?: string;
  statusCode: number;
  details?: Record<string, unknown>;
};
