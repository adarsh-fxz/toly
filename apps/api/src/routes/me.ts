import { Hono } from "hono";
import { type AuthedEnv, requireUser } from "../middleware/session";

export const meRoutes = new Hono<AuthedEnv>().use(requireUser).get("/", (c) => {
  const user = c.get("user");
  return c.json({
    id: user.id,
    name: user.name,
    image: user.image ?? null,
    role: user.role ?? "user",
    phoneNumber: user.phoneNumber ?? null,
    phoneNumberVerified: Boolean(user.phoneNumberVerified),
  });
});
