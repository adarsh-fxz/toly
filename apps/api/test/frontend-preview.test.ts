import { describe, expect, it } from "vitest";
import { previewFetch } from "../../web/src/lib/frontend-preview";

const read = (path: string) =>
  previewFetch(`https://unavailable.invalid/api/v1/${path}`);

describe("frontend preview without a backend", () => {
  it("lists sample deals and applies category filters", async () => {
    const all = await (await read("deals")).json();
    const cafes = await (await read("deals?category=cafe")).json();
    expect(all).toHaveLength(2);
    expect(cafes).toHaveLength(1);
    expect(cafes[0].merchant.category).toBe("cafe");
    expect(await (await read("deals?category=activity")).json()).toEqual([]);
  });

  it("serves linked deal, venue and wheel pages from fixtures", async () => {
    const deal = await (
      await read("deals/afternoon-chiya-set-for-four")
    ).json();
    const venue = await (await read(`venues/${deal.merchant.slug}`)).json();
    const wheel = await (
      await read(`venues/${deal.merchant.slug}/wheel`)
    ).json();
    expect(venue.deals[0].id).toBe(deal.id);
    expect(wheel.prizes).toHaveLength(6);
    expect(
      wheel.prizes.reduce(
        (total: number, prize: { odds: number }) => total + prize.odds,
        0,
      ),
    ).toBe(100);
    expect((await read("deals/not-a-sample")).status).toBe(404);
  });

  it("does not authenticate visitors or accept mutations", async () => {
    expect((await read("me")).status).toBe(401);
    const write = await previewFetch(
      "https://unavailable.invalid/api/v1/groups",
      {
        method: "POST",
        body: JSON.stringify({ dealSlug: "afternoon-chiya-set-for-four" }),
      },
    );
    expect(write.status).toBe(503);
  });
});
