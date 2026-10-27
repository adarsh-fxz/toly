import { describe, expect, it } from "vitest";
import { merchantApplicationSchema } from "./merchant";

const valid = {
  name: "Bhatti Café",
  category: "cafe",
  area: "Jhamsikhel",
  address: "Jhamsikhel Road, Lalitpur",
  phone: "9801234567",
};

describe("merchantApplicationSchema", () => {
  it("normalizes the counter phone to E.164", () => {
    const result = merchantApplicationSchema.parse(valid);
    expect(result.phone).toBe("+9779801234567");
    expect(result.panNumber).toBeUndefined();
  });

  it("rejects a malformed PAN", () => {
    const result = merchantApplicationSchema.safeParse({
      ...valid,
      panNumber: "12ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a landline counter number", () => {
    const result = merchantApplicationSchema.safeParse({
      ...valid,
      phone: "01-5551234",
    });
    expect(result.success).toBe(false);
  });
});
