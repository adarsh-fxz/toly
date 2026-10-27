import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../env";

const TTL_SECONDS = 60;
const key = createHmac("sha256", env.BETTER_AUTH_SECRET)
  .update("toly:voucher-token:v1")
  .digest();

function sign(payload: string) {
  return createHmac("sha256", key)
    .update(payload)
    .digest("base64url")
    .slice(0, 22);
}

/** Short-lived token shown as the voucher QR. The screen re-fetches it, so screenshots go stale fast. */
export function issueVoucherToken(voucherId: string, now = Date.now()) {
  const exp = Math.floor(now / 1000) + TTL_SECONDS;
  const payload = `${voucherId}.${exp}`;
  return {
    token: `toly1.${payload}.${sign(payload)}`,
    expiresAt: new Date(exp * 1000),
  };
}

export type TokenCheck =
  | { ok: true; voucherId: string }
  | { ok: false; reason: "MALFORMED" | "BAD_SIGNATURE" | "TOKEN_EXPIRED" };

export function verifyVoucherToken(
  token: string,
  now = Date.now(),
): TokenCheck {
  const match = /^toly1\.([0-9a-f-]{36})\.(\d{10})\.([\w-]{22})$/.exec(
    token.trim(),
  );
  if (!match) return { ok: false, reason: "MALFORMED" };
  const [, voucherId = "", exp = "0", signature = ""] = match;

  const expected = Buffer.from(sign(`${voucherId}.${exp}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, reason: "BAD_SIGNATURE" };
  }
  // A little grace for slow counters and clock drift between the phone and the server.
  if (Number(exp) * 1000 + 15_000 < now)
    return { ok: false, reason: "TOKEN_EXPIRED" };
  return { ok: true, voucherId };
}
