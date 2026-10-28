import { describe, expect, it } from "vitest";
import { envSchema } from "../src/env-schema";

const production = {
  NODE_ENV: "production",
  DATABASE_URI: "postgresql://test:password@localhost/demo",
  BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-test",
};

describe("hosted demo configuration", () => {
  it("refuses production mocks without an explicit demo flag", () => {
    expect(envSchema.safeParse(production).success).toBe(false);
    expect(
      envSchema.safeParse({ ...production, DEMO_MODE: "false" }).success,
    ).toBe(false);
  });

  it("allows a demo while preserving production mode", () => {
    const env = envSchema.parse({ ...production, DEMO_MODE: "true" });
    expect(env.NODE_ENV).toBe("production");
    expect(env.DEMO_MODE).toBe(true);
    expect(env.PAYMENTS_PROVIDER).toBe("mock");
  });

  it("refuses real integrations in a demo", () => {
    for (const real of [
      {
        SMS_PROVIDER: "sparrow",
        SPARROW_SMS_TOKEN: "test",
        SPARROW_SMS_FROM: "test",
      },
      { PAYMENTS_PROVIDER: "khalti", KHALTI_SECRET_KEY: "test" },
      { GOOGLE_CLIENT_ID: "test", GOOGLE_CLIENT_SECRET: "test" },
    ]) {
      expect(
        envSchema.safeParse({ ...production, DEMO_MODE: "true", ...real })
          .success,
      ).toBe(false);
    }
  });

  it("accepts real providers for a normal production deployment", () => {
    const env = envSchema.parse({
      ...production,
      SMS_PROVIDER: "sparrow",
      SPARROW_SMS_TOKEN: "test",
      SPARROW_SMS_FROM: "test",
      PAYMENTS_PROVIDER: "khalti",
      KHALTI_SECRET_KEY: "test",
    });
    expect(env.DEMO_MODE).toBe(false);
  });

  it("rejects ambiguous boolean strings", () => {
    expect(
      envSchema.safeParse({ ...production, DEMO_MODE: "yes" }).success,
    ).toBe(false);
  });
});
