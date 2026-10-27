import type { ContentfulStatusCode } from "hono/utils/http-status";

export class ApiError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const unauthorized = () =>
  new ApiError(401, "UNAUTHORIZED", "Sign in to continue");

export const forbidden = (message = "You don't have access to this") =>
  new ApiError(403, "FORBIDDEN", message);

export const notFound = (message = "Not found") =>
  new ApiError(404, "NOT_FOUND", message);
