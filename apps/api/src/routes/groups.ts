import { Hono } from "hono";
import { z } from "zod";
import { unauthorized } from "../lib/errors";
import { rateLimit } from "../lib/rate-limit";
import { validate } from "../lib/validate";
import {
  type AppEnv,
  requireUser,
  requireVerifiedPhone,
} from "../middleware/session";
import {
  getGroupView,
  joinGroup,
  leaveGroup,
  startGroup,
} from "../services/groups";

const idParam = z.object({ id: z.uuid() });

const plannedFor = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((v) => {
    const days = (Date.parse(v) - Date.now()) / 86_400_000;
    return days > -1 && days < 60;
  }, "Pick a day in the next two months")
  .nullable()
  .default(null);

export const groupRoutes = new Hono<AppEnv>()
  .post(
    "/",
    requireVerifiedPhone,
    rateLimit("group-start", 10, 600),
    validate(
      "json",
      z.object({ dealSlug: z.string().min(1).max(80), plannedFor }),
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) throw unauthorized();
      const { dealSlug, plannedFor } = c.req.valid("json");
      return c.json(await startGroup(user.id, dealSlug, plannedFor), 201);
    },
  )
  .get("/:id", validate("param", idParam), async (c) =>
    c.json(
      await getGroupView(c.req.valid("param").id, c.get("user")?.id ?? null),
    ),
  )
  .post(
    "/:id/join",
    requireVerifiedPhone,
    rateLimit("group-join", 20, 60),
    validate("param", idParam),
    async (c) => {
      const user = c.get("user");
      if (!user) throw unauthorized();
      return c.json(await joinGroup(user.id, c.req.valid("param").id));
    },
  )
  .post("/:id/leave", requireUser, validate("param", idParam), async (c) => {
    const user = c.get("user");
    if (!user) throw unauthorized();
    return c.json(await leaveGroup(user.id, c.req.valid("param").id));
  });
