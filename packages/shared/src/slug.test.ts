import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Himalayan Java Café — Thamel")).toBe(
      "himalayan-java-cafe-thamel",
    );
  });

  it("drops characters outside a-z and 0-9", () => {
    expect(slugify("  Momo & Co.!! ")).toBe("momo-co");
  });

  it("returns empty for non-latin names so callers can fall back", () => {
    expect(slugify("मोमो घर")).toBe("");
  });
});
