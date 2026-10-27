type AuthError =
  | { code?: string; message?: string; status?: number }
  | null
  | undefined;

const messages: Record<string, string> = {
  INVALID_PHONE_NUMBER: "Enter a Nepali mobile number, like 98XXXXXXXX.",
  INVALID_OTP: "That code didn't match. Check the SMS and try again.",
  OTP_EXPIRED: "That code has expired. Send a new one.",
  TOO_MANY_ATTEMPTS: "Too many wrong codes. Send a new code to try again.",
  PHONE_NUMBER_EXIST:
    "This number already belongs to another Toly account. Sign out and sign in with the number instead.",
  MISSING_RESPONSE: "Complete the security check, then try again.",
  VERIFICATION_FAILED:
    "The security check failed. Refresh the page and try again.",
};

export function authErrorMessage(
  error: AuthError,
  fallback = "Something went wrong. Try again.",
) {
  if (!error) return fallback;
  if (error.status === 429)
    return "Too many attempts. Wait a few minutes, then try again.";
  const known = error.code ? messages[error.code] : undefined;
  if (known) return known;
  return error.message || fallback;
}
