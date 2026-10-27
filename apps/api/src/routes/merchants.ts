import { merchantApplicationSchema } from "@toly/shared/merchant";
import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../lib/validate";
import {
  type AuthedEnv,
  requireUser,
  requireVerifiedPhone,
} from "../middleware/session";
import {
  applyForMerchant,
  listMyMerchants,
  requireMembership,
  updateMerchant,
} from "../services/merchants";

const idParam = z.object({ id: z.uuid() });

export const merchantRoutes = new Hono<AuthedEnv>()
  .use(requireUser)
  .get("/mine", async (c) => c.json(await listMyMerchants(c.get("user").id)))
  .post(
    "/",
    requireVerifiedPhone,
    validate("json", merchantApplicationSchema),
    async (c) => {
      const merchant = await applyForMerchant(
        c.get("user").id,
        c.req.valid("json"),
      );
      return c.json(
        { id: merchant.id, slug: merchant.slug, status: merchant.status },
        201,
      );
    },
  )
  .get("/:id", validate("param", idParam), async (c) => {
    const { merchant, role } = await requireMembership(
      c.get("user").id,
      c.req.valid("param").id,
    );
    return c.json({ ...merchant, role });
  })
  .put(
    "/:id",
    validate("param", idParam),
    validate("json", merchantApplicationSchema),
    async (c) => {
      const merchant = await updateMerchant(
        c.get("user").id,
        c.req.valid("param").id,
        c.req.valid("json"),
      );
      return c.json(merchant);
    },
  );
