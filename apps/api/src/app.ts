import { sql } from "@toly/db";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { db } from "./db";

const app = new Hono()
  .use(requestId())
  .use(logger())
  .use(secureHeaders())
  .get("/health", (c) => c.json({ ok: true }))
  .get("/health/ready", async (c) => {
    await db.execute(sql`select 1`);
    return c.json({ ok: true });
  });

app.notFound((c) =>
  c.json({ error: "NOT_FOUND", message: "Route not found" }, 404),
);

app.onError((err, c) => {
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
