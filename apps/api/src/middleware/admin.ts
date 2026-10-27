import { eq, schema } from "@toly/db";
import { createMiddleware } from "hono/factory";
import { db } from "../db";
import { ApiError, forbidden, unauthorized } from "../lib/errors";
import type { AuthedEnv } from "./session";

// Re-reads the role from the database (the session cookie cache can lag a demotion) and requires a
// passkey, so the most privileged role always signs in with something that can't be phished.
export const requireAdmin = createMiddleware<AuthedEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user) throw unauthorized();

  const [[row], [key]] = await Promise.all([
    db
      .select({ role: schema.user.role, banned: schema.user.banned })
      .from(schema.user)
      .where(eq(schema.user.id, user.id))
      .limit(1),
    db
      .select({ id: schema.passkey.id })
      .from(schema.passkey)
      .where(eq(schema.passkey.userId, user.id))
      .limit(1),
  ]);

  if (row?.role !== "admin" || row.banned) throw forbidden();
  if (!key) {
    throw new ApiError(
      403,
      "PASSKEY_REQUIRED",
      "Add a passkey to your account before using admin tools",
    );
  }
  await next();
});
