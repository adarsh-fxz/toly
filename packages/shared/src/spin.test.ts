import { describe, expect, it } from "vitest";
import { oddsPercent, pickWeighted, wheelInputSchema } from "./spin";

const prize = (label: string, weight: number, dailyStock?: number) => ({
  label,
  percentOff: 10,
  weight,
  dailyStock,
});

describe("wheelInputSchema", () => {
  it("requires an unlimited prize so every spin wins", () => {
    const result = wheelInputSchema.safeParse({
      enabled: true,
      price: 49,
      dailyLimitPerUser: 3,
      prizes: [prize("A", 1, 5), prize("B", 1, 5), prize("C", 1, 5)],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a sensible wheel", () => {
    const result = wheelInputSchema.safeParse({
      enabled: true,
      price: "49",
      dailyLimitPerUser: "3",
      validityDays: "",
      prizes: [
        prize("10% off", 70),
        prize("Free momo", 25, 10),
        prize("Bill on us", 5, 1),
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("oddsPercent", () => {
  it("always sums to 100", () => {
    const odds = oddsPercent([{ weight: 1 }, { weight: 1 }, { weight: 1 }]);
    expect(odds.reduce((a, b) => a + b, 0)).toBe(100);
    expect(odds).toEqual([34, 33, 33]);
  });
});

describe("pickWeighted", () => {
  const prizes = [{ weight: 70 }, { weight: 25 }, { weight: 5 }];

  it("maps rolls onto cumulative weight ranges", () => {
    expect(pickWeighted(prizes, 0)).toBe(0);
    expect(pickWeighted(prizes, 69)).toBe(0);
    expect(pickWeighted(prizes, 70)).toBe(1);
    expect(pickWeighted(prizes, 94)).toBe(1);
    expect(pickWeighted(prizes, 95)).toBe(2);
    expect(pickWeighted(prizes, 99)).toBe(2);
  });

  it("matches the stated odds over every possible roll", () => {
    const counts = [0, 0, 0];
    for (let roll = 0; roll < 100; roll++) {
      const index = pickWeighted(prizes, roll);
      counts[index] = (counts[index] ?? 0) + 1;
    }
    expect(counts).toEqual([70, 25, 5]);
  });
});
