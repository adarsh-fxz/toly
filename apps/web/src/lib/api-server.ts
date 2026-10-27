import "server-only";
import { createClient } from "@toly/api/client";
import { headers } from "next/headers";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";
const webUrl = process.env.WEB_URL ?? "http://localhost:3000";

// Server client: forwards the visitor's cookies so the API sees the same session.
export async function serverApi() {
  const incoming = await headers();
  return createClient(apiUrl, {
    headers: {
      cookie: incoming.get("cookie") ?? "",
      // Server-side calls come from this app, so they carry its origin through the API's CSRF check.
      origin: webUrl,
      // Set by the edge proxy in production (see deploy/Caddyfile); passed on so rate limits see the visitor.
      "x-real-ip": incoming.get("x-real-ip") ?? "",
    },
    init: { cache: "no-store" },
  });
}

// For public, cookie-free reads.
export const publicApi = createClient(apiUrl, { init: { cache: "no-store" } });
