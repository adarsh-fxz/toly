import { wheelInputSchema } from "@toly/shared/spin";
import { Hono } from "hono";
import { z } from "zod";
import { env, isProd } from "../env";
import { notFound, unauthorized } from "../lib/errors";
import { mockPayments } from "../lib/payments";
import { rateLimit } from "../lib/rate-limit";
import { validate } from "../lib/validate";
import {
  type AppEnv,
  requireUser,
  requireVerifiedPhone,
} from "../middleware/session";
import {
  confirmSpin,
  getOwnerWheel,
  getPublicWheel,
  getSpin,
  playSpin,
  saveWheel,
  startSpin,
} from "../services/spins";

const idParam = z.object({ id: z.uuid() });

function userOf(c: { get(key: "user"): AppEnv["Variables"]["user"] }) {
  const user = c.get("user");
  if (!user) throw unauthorized();
  return user;
}

export const spinRoutes = new Hono<AppEnv>()
  .get(
    "/venues/:slug/wheel",
    validate("param", z.object({ slug: z.string().min(1).max(80) })),
    async (c) => c.json(await getPublicWheel(c.req.valid("param").slug)),
  )
  .post(
    "/spins",
    requireVerifiedPhone,
    rateLimit("spin-start", 10, 600),
    validate("json", z.object({ merchantSlug: z.string().min(1).max(80) })),
    async (c) =>
      c.json(await startSpin(userOf(c), c.req.valid("json").merchantSlug), 201),
  )
  .get("/spins/:id", requireUser, validate("param", idParam), async (c) =>
    c.json(await getSpin(userOf(c).id, c.req.valid("param").id)),
  )
  .post(
    "/spins/:id/confirm",
    requireUser,
    validate("param", idParam),
    async (c) =>
      c.json(await confirmSpin(userOf(c).id, c.req.valid("param").id)),
  )
  .post(
    "/spins/:id/play",
    requireUser,
    rateLimit("spin-play", 20, 60),
    validate("param", idParam),
    async (c) => c.json(await playSpin(userOf(c).id, c.req.valid("param").id)),
  )
  .get(
    "/merchants/:id/wheel",
    requireUser,
    validate("param", idParam),
    async (c) =>
      c.json(await getOwnerWheel(userOf(c).id, c.req.valid("param").id)),
  )
  .put(
    "/merchants/:id/wheel",
    requireUser,
    validate("param", idParam),
    validate("json", wheelInputSchema),
    async (c) =>
      c.json(
        await saveWheel(
          userOf(c).id,
          c.req.valid("param").id,
          c.req.valid("json"),
        ),
      ),
  )
  // Stands in for a real checkout during local development; never mounted with a real provider.
  .post(
    "/payments/mock/:ref",
    validate(
      "param",
      z.object({ ref: z.string().startsWith("mock_").max(64) }),
    ),
    validate("json", z.object({ outcome: z.enum(["completed", "failed"]) })),
    (c) => {
      if (isProd || env.PAYMENTS_PROVIDER !== "mock") throw notFound();
      const returnUrl = mockPayments.settle(
        c.req.valid("param").ref,
        c.req.valid("json").outcome,
      );
      if (!returnUrl) throw notFound("Unknown payment");
      return c.json({ returnUrl });
    },
  );
