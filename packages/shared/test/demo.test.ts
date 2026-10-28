import { describe, expect, it } from "vitest";
import { isDemoPhone } from "../src/demo";

describe("demo phone identities", () => {
  it("accepts only the designated synthetic range", () => {
    expect(isDemoPhone("+9779800000000")).toBe(true);
    expect(isDemoPhone("+9779800000999")).toBe(true);
    for (const phone of [
      "+9779800001000",
      "+9779812345678",
      "9800000001",
      "+97798000000010",
    ]) {
      expect(isDemoPhone(phone)).toBe(false);
    }
  });
});
