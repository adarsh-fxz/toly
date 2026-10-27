import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../lib/validate";
import { type AuthedEnv, requireUser } from "../middleware/session";
import { listMyGroups } from "../services/groups";
import { getMyVoucher, listMyVouchers } from "../services/vouchers";

export const meRoutes = new Hono<AuthedEnv>()
  .use(requireUser)
  .get("/", (c) => {
    const user = c.get("user");
    return c.json({
      id: user.id,
      name: user.name,
      image: user.image ?? null,
      role: user.role ?? "user",
      phoneNumber: user.phoneNumber ?? null,
      phoneNumberVerified: Boolean(user.phoneNumberVerified),
    });
  })
  .get("/groups", async (c) => c.json(await listMyGroups(c.get("user").id)))
  .get("/vouchers", async (c) => c.json(await listMyVouchers(c.get("user").id)))
  .get(
    "/vouchers/:id",
    validate("param", z.object({ id: z.uuid() })),
    async (c) =>
      c.json(await getMyVoucher(c.get("user").id, c.req.valid("param").id)),
  );
