import { hc } from "hono/client";
import type { AppType } from "./app";

export type { AppType };

export const createClient = (...args: Parameters<typeof hc>) =>
  hc<AppType>(...args);
