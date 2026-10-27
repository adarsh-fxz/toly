import { Hono } from "hono";
import { z } from "zod";
import { validate } from "../lib/validate";
import { getPublicDeal, getVenue, listLiveDeals } from "../services/deals";

const slugParam = z.object({ slug: z.string().min(1).max(80) });

export const publicDealRoutes = new Hono()
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
  );
