import { sql } from "@toly/db";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { db } from "../src/db";
import { hasDatabase, resetDatabase } from "./helpers";

describe.skipIf(!hasDatabase)("hosted demo authentication", () => {
  let app: typeof import("../src/app").default;

  beforeAll(async () => {
    await resetDatabase();
    await db.execute(sql`truncate table rate_limit`);
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEMO_MODE", "true");
    vi.stubEnv("WEB_URL", "https://toly.page");
    ({ default: app } = await import("../src/app"));
  });

  const post = (path: string, body: unknown, origin = "https://toly.page") =>
    app.request(`/api/auth/${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin,
        "x-real-ip": "192.0.2.10",
      },
      body: JSON.stringify(body),
    });

  it("returns a one-time demo code and issues secure cookies", async () => {
    const phoneNumber = "+9779800000042";
    const send = await post("phone-number/send-otp", { phoneNumber });
    expect(send.status).toBe(200);
    const code = send.headers.get("x-toly-demo-code");
    expect(code).toMatch(/^\d{6}$/);
    expect(send.headers.get("cache-control")).toBe("no-store");
    const verify = await post("phone-number/verify", { phoneNumber, code });
    expect(verify.status).toBe(200);
    expect(verify.headers.get("set-cookie")).toContain("Secure");
    expect(verify.headers.get("set-cookie")).toContain("HttpOnly");
    expect(
      (await post("phone-number/verify", { phoneNumber, code })).status,
    ).not.toBe(200);
  });

  it("rejects real numbers and requests from another origin", async () => {
    const real = await post("phone-number/send-otp", {
      phoneNumber: "+9779812345678",
    });
    expect(real.status).toBe(400);
    expect(real.headers.get("x-toly-demo-code")).toBeNull();
    expect(
      (
        await post(
          "phone-number/send-otp",
          { phoneNumber: "+9779800000043" },
          "https://other.invalid",
        )
      ).status,
    ).toBe(403);
  });

  it("disables credential enrollment for shared demo identities", async () => {
    const response = await app.request(
      "/api/auth/passkey/generate-register-options",
    );
    expect(response.status).toBe(404);
  });
});
