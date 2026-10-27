import "server-only";
import type { InferResponseType } from "hono/client";
import { cache } from "react";
import type { api } from "./api";
import { serverApi } from "./api-server";

export type CurrentUser = InferResponseType<typeof api.api.v1.me.$get, 200>;

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const client = await serverApi();
  const res = await client.api.v1.me.$get();
  if (res.status !== 200) return null;
  return res.json();
});
