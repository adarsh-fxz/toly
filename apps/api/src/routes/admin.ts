import { merchantReviewSchema } from "@toly/shared/merchant";
import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../lib/validate";
import { requireAdmin } from "../middleware/admin";
import { type AuthedEnv, requireUser } from "../middleware/session";
import { adminSetDealStatus } from "../services/deals";
import { listMerchantsForReview, reviewMerchant } from "../services/merchants";

export const adminRoutes = new Hono<AuthedEnv>()
  .use(requireUser, requireAdmin)
  .get(
    "/merchants",
    validate(
      "query",
      z.object({
        status: z
          .enum(["pending", "approved", "rejected", "suspended"])
          .default("pending"),
      }),
    ),
    async (c) =>
      c.json(await listMerchantsForReview(c.req.valid("query").status)),
  )
  .post(
    "/merchants/:id/review",
    validate("param", z.object({ id: z.uuid() })),
    validate("json", merchantReviewSchema),
    async (c) => {
      const merchant = await reviewMerchant(
        c.get("user").id,
        c.req.valid("param").id,
        c.req.valid("json"),
      );
      return c.json(merchant);
    },
  )
  .post(
    "/deals/:id/status",
    validate("param", z.object({ id: z.uuid() })),
    validate("json", z.object({ status: z.enum(["paused", "ended"]) })),
    async (c) =>
      c.json(
        await adminSetDealStatus(
          c.get("user").id,
          c.req.valid("param").id,
          c.req.valid("json").status,
        ),
      ),
  );
