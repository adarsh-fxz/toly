import { createClient } from "@toly/api/client";

// Browser client: same-origin requests, proxied to the API by Next rewrites.
export const api = createClient("/", { init: { credentials: "same-origin" } });

export type ApiErrorBody = { error: string; message: string };

export async function readError(res: Response): Promise<ApiErrorBody> {
  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return {
      error: "NETWORK",
      message: "Couldn't reach Toly. Check your connection and try again.",
    };
  }
}
