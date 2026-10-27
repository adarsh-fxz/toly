import { dealInputSchema } from "@toly/shared/deal";
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
  createDeal,
  getMerchantDeal,
  listMerchantDeals,
  setDealStatus,
  updateDeal,
} from "../services/deals";
import {
  applyForMerchant,
  listMyMerchants,
  requireMembership,
  updateMerchant,
} from "../services/merchants";

const idParam = z.object({ id: z.uuid() });
const dealParam = z.object({ id: z.uuid(), dealId: z.uuid() });

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
  )
  .get("/:id/deals", validate("param", idParam), async (c) =>
    c.json(await listMerchantDeals(c.get("user").id, c.req.valid("param").id)),
  )
  .post(
    "/:id/deals",
    validate("param", idParam),
    validate("json", dealInputSchema),
    async (c) => {
      const deal = await createDeal(
        c.get("user").id,
        c.req.valid("param").id,
        c.req.valid("json"),
      );
      return c.json(deal, 201);
    },
  )
  .get("/:id/deals/:dealId", validate("param", dealParam), async (c) => {
    const { id, dealId } = c.req.valid("param");
    return c.json(await getMerchantDeal(c.get("user").id, id, dealId));
  })
  .put(
    "/:id/deals/:dealId",
    validate("param", dealParam),
    validate("json", dealInputSchema),
    async (c) => {
      const { id, dealId } = c.req.valid("param");
      return c.json(
        await updateDeal(c.get("user").id, id, dealId, c.req.valid("json")),
      );
    },
  )
  .post(
    "/:id/deals/:dealId/status",
    validate("param", dealParam),
    validate("json", z.object({ status: z.enum(["live", "paused", "ended"]) })),
    async (c) => {
      const { id, dealId } = c.req.valid("param");
      return c.json(
        await setDealStatus(
          c.get("user").id,
          id,
          dealId,
          c.req.valid("json").status,
        ),
      );
    },
  );
