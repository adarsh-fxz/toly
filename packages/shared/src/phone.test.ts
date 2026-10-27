import { describe, expect, it } from "vitest";
import {
  formatNepaliPhone,
  isNepaliMobile,
  normalizeNepaliPhone,
} from "./phone";

describe("normalizeNepaliPhone", () => {
  it.each([
    ["9841234567", "+9779841234567"],
    ["984 123 4567", "+9779841234567"],
    ["+977-980-1234567", "+9779801234567"],
    ["009779721234567", "+9779721234567"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeNepaliPhone(input)).toBe(expected);
  });

  it.each(["01-4412345", "98412345", "+919841234567", "9641234567", ""])(
    "rejects %s",
    (input) => {
      expect(normalizeNepaliPhone(input)).toBeNull();
    },
  );
});

describe("isNepaliMobile", () => {
  it("accepts only E.164 Nepali mobiles", () => {
    expect(isNepaliMobile("+9779841234567")).toBe(true);
    expect(isNepaliMobile("9841234567")).toBe(false);
  });
});

describe("formatNepaliPhone", () => {
  it("groups digits for display", () => {
    expect(formatNepaliPhone("+9779841234567")).toBe("+977 984-123-4567");
  });
});
