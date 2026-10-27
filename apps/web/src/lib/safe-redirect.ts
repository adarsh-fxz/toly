// Only allow same-site relative paths, so `?next=` can never become an open redirect.
export function safeNextPath(value: string | null | undefined, fallback = "/") {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return fallback;
  }
  return value;
}
