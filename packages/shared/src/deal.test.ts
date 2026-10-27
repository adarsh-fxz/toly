import { describe, expect, it } from "vitest";
import { dealInputSchema, describeDays } from "./deal";

const valid = {
  title: "Momo platter for four",
  includes: ["4 plates buff momo", "4 milk teas"],
  partySize: "4",
  basePrice: "1600",
  groupPrice: "1200",
  priceAttested: true,
  availableDays: ["1", "2", "3"],
  availableFrom: "14:00",
  availableUntil: "17:00",
  validityDays: "",
};

describe("dealInputSchema", () => {
  it("coerces form strings", () => {
    const deal = dealInputSchema.parse(valid);
    expect(deal.partySize).toBe(4);
    expect(deal.validityDays).toBeUndefined();
    expect(deal.availableDays).toEqual([1, 2, 3]);
  });

  it("requires a real discount", () => {
    const result = dealInputSchema.safeParse({ ...valid, groupPrice: "1600" });
    expect(result.success).toBe(false);
  });

  it("requires the price attestation", () => {
    const result = dealInputSchema.safeParse({
      ...valid,
      priceAttested: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects half a time window", () => {
    const result = dealInputSchema.safeParse({ ...valid, availableUntil: "" });
    expect(result.success).toBe(false);
  });
});

describe("describeDays", () => {
  it("names common patterns", () => {
    expect(describeDays([1, 2, 3, 4, 5])).toBe("Weekdays");
    expect(describeDays([6, 0])).toBe("Weekends");
    expect(describeDays([0, 1, 2, 3, 4, 5, 6])).toBe("Every day");
    expect(describeDays([2, 4])).toBe("Tue, Thu");
  });
});
