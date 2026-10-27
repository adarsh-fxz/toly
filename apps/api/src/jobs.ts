import { expireOverdueGroups } from "./services/groups";

const MINUTE = 60_000;

/** Light in-process housekeeping. Every job is idempotent, so running it on several instances is safe. */
export function startJobs() {
  const timer = setInterval(() => {
    expireOverdueGroups().catch((err) =>
      console.error("[jobs] expire groups failed", err),
    );
  }, MINUTE);
  timer.unref();
  return () => clearInterval(timer);
}
