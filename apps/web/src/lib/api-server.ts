import "server-only";
import { createClient } from "@toly/api/client";
import { headers } from "next/headers";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

// Server client: forwards the visitor's cookies so the API sees the same session.
export async function serverApi() {
  const incoming = await headers();
  return createClient(apiUrl, {
    headers: {
      cookie: incoming.get("cookie") ?? "",
      "x-forwarded-for": incoming.get("x-forwarded-for") ?? "",
    },
    init: { cache: "no-store" },
  });
}

// For public, cookie-free reads.
export const publicApi = createClient(apiUrl, { init: { cache: "no-store" } });
