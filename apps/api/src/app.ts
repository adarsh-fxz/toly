import { sql } from "@toly/db";
import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./auth";
import { db } from "./db";
import { env } from "./env";
import { ApiError } from "./lib/errors";
import { type AppEnv, withSession } from "./middleware/session";
import { adminRoutes } from "./routes/admin";
import { authConfigRoutes } from "./routes/auth-config";
import { publicDealRoutes } from "./routes/deals";
import { groupRoutes } from "./routes/groups";
import { meRoutes } from "./routes/me";
import { merchantRoutes } from "./routes/merchants";

const v1 = new Hono<AppEnv>()
  .use(csrf({ origin: env.WEB_URL }))
  .use(withSession)
  .route("/auth/config", authConfigRoutes)
  .route("/", publicDealRoutes)
  .route("/me", meRoutes)
  .route("/groups", groupRoutes)
  .route("/merchants", merchantRoutes)
  .route("/admin", adminRoutes);

const app = new Hono()
  .use(requestId())
  .use(logger())
  .use(secureHeaders())
  .get("/health", (c) => c.json({ ok: true }))
  .get("/health/ready", async (c) => {
    await db.execute(sql`select 1`);
    return c.json({ ok: true });
  })
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .route("/api/v1", v1);

app.notFound((c) =>
  c.json({ error: "NOT_FOUND", message: "Route not found" }, 404),
);

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      { error: err.code, message: err.message, fields: err.fields },
      err.status,
    );
  }
  if (err instanceof HTTPException) {
    return c.json({ error: "HTTP_ERROR", message: err.message }, err.status);
  }
  console.error(`[${c.get("requestId")}]`, err);
  return c.json(
    { error: "INTERNAL", message: "Something went wrong on our side" },
    500,
  );
});

export type AppType = typeof app;
export default app;
