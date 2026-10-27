import { env } from "../../env";
import { khalti } from "./khalti";
import { mock } from "./mock";
import type { PaymentProvider } from "./types";

export const payments: PaymentProvider =
  env.PAYMENTS_PROVIDER === "khalti" ? khalti : mock;
export type { PaymentProvider };
export { mock as mockPayments };
