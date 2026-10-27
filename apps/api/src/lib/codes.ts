import { randomInt } from "node:crypto";

// Crockford base32 without I, L, O, U: easy to read aloud and type at a counter.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** 8 random characters (40 bits), shown as XXXX-XXXX. */
export function voucherCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return code;
}

/** Accepts what staff type (any case, spaces, dashes, look-alike letters) and normalises it. */
export function normalizeVoucherCode(input: string): string {
  return input
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0");
}
