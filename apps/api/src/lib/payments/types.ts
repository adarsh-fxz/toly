export type PaymentRequest = {
  orderId: string;
  orderName: string;
  amountPaisa: number;
  returnUrl: string;
  customer: { name: string; phone: string | null };
};

export type PaymentStatus = "completed" | "pending" | "failed";

export type PaymentLookup = {
  status: PaymentStatus;
  amountPaisa: number;
  transactionId: string | null;
};

export interface PaymentProvider {
  readonly name: string;
  initiate(
    request: PaymentRequest,
  ): Promise<{ ref: string; paymentUrl: string }>;
  /** Server-to-provider check. The only thing we trust; browser redirects never mark anything paid. */
  lookup(ref: string): Promise<PaymentLookup>;
}
