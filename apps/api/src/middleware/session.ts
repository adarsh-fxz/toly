import { createMiddleware } from "hono/factory";
import { auth } from "../auth";
import { ApiError, unauthorized } from "../lib/errors";

type SessionResult = typeof auth.$Infer.Session;
export type AuthUser = SessionResult["user"];

export type AppEnv = {
  Variables: {
    user: AuthUser | null;
    session: SessionResult["session"] | null;
  };
};

export type AuthedEnv = {
  Variables: { user: AuthUser; session: SessionResult["session"] };
};

export const withSession = createMiddleware<AppEnv>(async (c, next) => {
  const result = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", result?.user ?? null);
  c.set("session", result?.session ?? null);
  await next();
});

export const requireUser = createMiddleware<AuthedEnv>(async (c, next) => {
  if (!c.get("user")) throw unauthorized();
  await next();
});

export const requireVerifiedPhone = createMiddleware<AuthedEnv>(
  async (c, next) => {
    const user = c.get("user");
    if (!user) throw unauthorized();
    if (!user.phoneNumberVerified) {
      throw new ApiError(
        403,
        "PHONE_NOT_VERIFIED",
        "Verify your phone number to continue",
      );
    }
    await next();
  },
);
