import type { InferResponseType } from "hono/client";
import type { api } from "./api";

export type PublicDeal = InferResponseType<
  (typeof api.api.v1.deals)[":slug"]["$get"],
  200
>;
export type MerchantDeal = InferResponseType<
  (typeof api.api.v1.merchants)[":id"]["deals"][":dealId"]["$get"],
  200
>;
export type GroupView = InferResponseType<
  (typeof api.api.v1.groups)[":id"]["$get"],
  200
>;
export type PublicWheel = InferResponseType<
  (typeof api.api.v1.venues)[":slug"]["wheel"]["$get"],
  200
>;
