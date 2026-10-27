import type { SecondaryStorage } from "better-auth";
import { Redis } from "ioredis";
import { env } from "../env";

// INCR + EXPIRE on first write, so the window is fixed from the first hit.
const INCREMENT_SCRIPT = `
local value = redis.call("INCR", KEYS[1])
if value == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
return value
`;

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2 })
  : null;

export const redisStorage: SecondaryStorage | undefined = redis
  ? {
      get: (key) => redis.get(key),
      getAndDelete: (key) => redis.getdel(key),
      increment: async (key, ttl) =>
        Number(await redis.eval(INCREMENT_SCRIPT, 1, key, ttl)),
      set: async (key, value, ttl) => {
        if (ttl) await redis.set(key, value, "EX", ttl);
        else await redis.set(key, value);
      },
      delete: async (key) => {
        await redis.del(key);
      },
    }
  : undefined;
