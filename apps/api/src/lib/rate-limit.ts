import { createMiddleware } from "hono/factory";
import { env } from "../env";
import { ApiError } from "./errors";
import { redis } from "./redis";

const INCREMENT = `
local value = redis.call("INCR", KEYS[1])
if value == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
return value
`;

const memory = new Map<string, { count: number; resetAt: number }>();

async function hit(key: string, windowSeconds: number) {
  if (redis)
    return Number(await redis.eval(INCREMENT, 1, `rl:${key}`, windowSeconds));
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

/** Fixed-window limit per signed-in user, falling back to the client IP set by the edge proxy. */
export const rateLimit = (name: string, max: number, windowSeconds: number) =>
  createMiddleware<{ Variables: { user: { id: string } | null } }>(
    async (c, next) => {
      const who =
        c.get("user")?.id ?? c.req.header(env.CLIENT_IP_HEADER) ?? "anonymous";
      if ((await hit(`${name}:${who}`, windowSeconds)) > max) {
        throw new ApiError(
          429,
          "RATE_LIMITED",
          "Too many attempts. Wait a minute and try again.",
        );
      }
      await next();
    },
  );
