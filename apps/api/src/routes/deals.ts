import { Hono } from "hono";
import { z } from "zod";
import { env } from "../env";
import { hit } from "../lib/rate-limit";
import { validate } from "../lib/validate";
import type { AppEnv } from "../middleware/session";
import { getPublicDeal, getVenue, listLiveDeals } from "../services/deals";
import { recordDealView } from "../services/insights";

const slugParam = z.object({ slug: z.string().min(1).max(80) });

export const publicDealRoutes = new Hono<AppEnv>()
  .get(
    "/deals",
    validate(
      "query",
      z.object({
        category: z.string().max(20).optional(),
        area: z.string().max(60).optional(),
      }),
    ),
    async (c) => c.json(await listLiveDeals(c.req.valid("query"))),
  )
  .get("/deals/:slug", validate("param", slugParam), async (c) =>
    c.json(await getPublicDeal(c.req.valid("param").slug)),
  )
  .get("/venues/:slug", validate("param", slugParam), async (c) =>
    c.json(await getVenue(c.req.valid("param").slug)),
  )
  // Counted once per visitor per deal every 30 minutes, so refreshes and bots hammering a link don't inflate it.
  .post("/deals/:slug/view", validate("param", slugParam), async (c) => {
    const { slug } = c.req.valid("param");
    const who =
      c.get("user")?.id ??
      c.req.header(env.CLIENT_IP_HEADER) ??
      c.req.header("user-agent") ??
      "anonymous";
    if ((await hit(`view:${slug}:${who}`, 1800)) === 1)
      await recordDealView(slug);
    return c.body(null, 204);
  });
