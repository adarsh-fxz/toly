import { env } from "../../env";
import type { PaymentLookup, PaymentProvider } from "./types";

// Local development only: env validation refuses this provider in production.
const payments = new Map<string, PaymentLookup & { returnUrl: string }>();

export const mock: PaymentProvider & {
  settle(ref: string, outcome: "completed" | "failed"): string | null;
} = {
  name: "mock",
  async initiate(request) {
    const ref = `mock_${crypto.randomUUID()}`;
    payments.set(ref, {
      status: "pending",
      amountPaisa: request.amountPaisa,
      transactionId: null,
      returnUrl: request.returnUrl,
    });
    const url = new URL("/pay/mock", env.WEB_URL);
    url.searchParams.set("ref", ref);
    url.searchParams.set("amount", String(request.amountPaisa));
    url.searchParams.set("name", request.orderName);
    return { ref, paymentUrl: url.toString() };
  },
  async lookup(ref) {
    const payment = payments.get(ref);
    if (!payment)
      return { status: "failed", amountPaisa: 0, transactionId: null };
    return {
      status: payment.status,
      amountPaisa: payment.amountPaisa,
      transactionId: payment.transactionId,
    };
  },
  settle(ref, outcome) {
    const payment = payments.get(ref);
    if (!payment) return null;
    payment.status = outcome;
    payment.transactionId =
      outcome === "completed" ? `mock_txn_${Date.now()}` : null;
    return payment.returnUrl;
  },
};
