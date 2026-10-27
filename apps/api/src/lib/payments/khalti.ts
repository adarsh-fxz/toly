import { env } from "../../env";
import type { PaymentProvider, PaymentStatus } from "./types";

// https://docs.khalti.com/khalti-epayment/ — amounts are in paisa.
async function call<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${env.KHALTI_API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok)
    throw new Error(`Khalti ${path} failed with status ${res.status}`);
  return (await res.json()) as T;
}

function mapStatus(status: string): PaymentStatus {
  if (status === "Completed") return "completed";
  if (status === "Pending" || status === "Initiated") return "pending";
  return "failed";
}

export const khalti: PaymentProvider = {
  name: "khalti",
  async initiate(request) {
    const data = await call<{ pidx: string; payment_url: string }>(
      "/epayment/initiate/",
      {
        return_url: request.returnUrl,
        website_url: env.WEB_URL,
        amount: request.amountPaisa,
        purchase_order_id: request.orderId,
        purchase_order_name: request.orderName,
        customer_info: {
          name: request.customer.name || "Toly customer",
          ...(request.customer.phone
            ? { phone: request.customer.phone.replace(/^\+977/, "") }
            : {}),
        },
      },
    );
    return { ref: data.pidx, paymentUrl: data.payment_url };
  },
  async lookup(ref) {
    const data = await call<{
      status: string;
      total_amount: number;
      transaction_id: string | null;
    }>("/epayment/lookup/", { pidx: ref });
    return {
      status: mapStatus(data.status),
      amountPaisa: data.total_amount,
      transactionId: data.transaction_id,
    };
  },
};
