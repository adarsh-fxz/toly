import { normalizeNepaliPhone } from "@toly/shared/phone";
import { Hono } from "hono";
import { z } from "zod";
import { rateLimit } from "../lib/rate-limit";
import { validate } from "../lib/validate";
import { type AuthedEnv, requireUser } from "../middleware/session";
import {
  lookupVoucher,
  recentRedemptions,
  redeemVoucher,
} from "../services/redemption";
import { addStaff, listTeam, removeStaff } from "../services/team";

const idParam = z.object({ id: z.uuid() });

const voucherRef = z.union([
  z.object({ token: z.string().min(10).max(200) }),
  z.object({
    code: z.string().trim().min(8, "Codes have 8 characters").max(12),
  }),
]);

const phone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const normalized = normalizeNepaliPhone(v);
    if (!normalized) {
      ctx.addIssue({
        code: "custom",
        message: "Enter their Nepali mobile number",
      });
      return z.NEVER;
    }
    return normalized;
  });

/** Counter-side operations for venue staff: check and redeem vouchers, manage the team. */
export const counterRoutes = new Hono<AuthedEnv>()
  .use(requireUser)
  .post(
    "/:id/redemptions/lookup",
    rateLimit("voucher-lookup", 60, 60),
    validate("param", idParam),
    validate("json", voucherRef),
    async (c) =>
      c.json(
        await lookupVoucher(
          c.get("user").id,
          c.req.valid("param").id,
          c.req.valid("json"),
        ),
      ),
  )
  .post(
    "/:id/redemptions",
    rateLimit("voucher-redeem", 30, 60),
    validate("param", idParam),
    validate(
      "json",
      z.object({
        voucherId: z.uuid(),
        billAmount: z
          .number()
          .int()
          .min(1)
          .max(10_000_000)
          .nullable()
          .default(null),
      }),
    ),
    async (c) => {
      const { voucherId, billAmount } = c.req.valid("json");
      const result = await redeemVoucher(
        c.get("user").id,
        c.req.valid("param").id,
        voucherId,
        billAmount === null ? null : billAmount * 100,
      );
      return c.json(result);
    },
  )
  .get("/:id/redemptions", validate("param", idParam), async (c) =>
    c.json(await recentRedemptions(c.get("user").id, c.req.valid("param").id)),
  )
  .get("/:id/team", validate("param", idParam), async (c) =>
    c.json(await listTeam(c.get("user").id, c.req.valid("param").id)),
  )
  .post(
    "/:id/team",
    validate("param", idParam),
    validate("json", z.object({ phone })),
    async (c) => {
      await addStaff(
        c.get("user").id,
        c.req.valid("param").id,
        c.req.valid("json").phone,
      );
      return c.json({ ok: true }, 201);
    },
  )
  .delete(
    "/:id/team/:userId",
    validate(
      "param",
      z.object({ id: z.uuid(), userId: z.string().min(1).max(64) }),
    ),
    async (c) => {
      const { id, userId } = c.req.valid("param");
      await removeStaff(c.get("user").id, id, userId);
      return c.json({ ok: true });
    },
  );
