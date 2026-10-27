// Nepali mobile numbers: NTC (984–986, 974–976) and Ncell (980–982, 970–972) all start with 97 or 98.
const LOCAL_MOBILE = /^9[78]\d{8}$/;
const E164_MOBILE = /^\+9779[78]\d{8}$/;

export function normalizeNepaliPhone(input: string): string | null {
  const compact = input.replace(/[\s().-]/g, "");
  const local = compact.replace(/^(\+977|00977|977)/, "");
  return LOCAL_MOBILE.test(local) ? `+977${local}` : null;
}

export function isNepaliMobile(e164: string): boolean {
  return E164_MOBILE.test(e164);
}

export function formatNepaliPhone(e164: string): string {
  const local = e164.replace(/^\+977/, "");
  return `+977 ${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}
