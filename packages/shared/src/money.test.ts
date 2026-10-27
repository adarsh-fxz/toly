import { describe, expect, it } from "vitest";
import { formatRs, percentOff, toPaisa } from "./money";

describe("money", () => {
  it("formats paisa with Nepali digit grouping", () => {
    expect(formatRs(120000)).toBe("Rs 1,200");
    expect(formatRs(15000050)).toBe("Rs 1,50,000.5");
  });

  it("converts rupees to paisa without float drift", () => {
    expect(toPaisa(19.99)).toBe(1999);
  });

  it("never rounds a discount up", () => {
    expect(percentOff(160000, 120000)).toBe(25);
    expect(percentOff(30000, 20100)).toBe(33);
    expect(percentOff(1000, 1200)).toBe(0);
  });
});
