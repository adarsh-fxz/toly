import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { serverApi } from "./api-server";

export const getMerchant = cache(async (merchantId: string) => {
  const client = await serverApi();
  const res = await client.api.v1.merchants[":id"].$get({
    param: { id: merchantId },
  });
  if (res.status === 401) redirect(`/sign-in?next=/merchant/${merchantId}`);
  if (!res.ok) notFound();
  return res.json();
});
