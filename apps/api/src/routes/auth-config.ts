import { Hono } from "hono";
import { env } from "../env";

export const authConfigRoutes = new Hono().get("/", (c) =>
  c.json({
    google: Boolean(env.GOOGLE_CLIENT_ID),
    turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? null,
  }),
);
