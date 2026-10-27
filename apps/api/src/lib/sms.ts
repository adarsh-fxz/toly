import { env } from "../env";

type Sender = (to: string, text: string) => Promise<void>;

const consoleSender: Sender = async (to, text) => {
  console.info(`[sms] to=${to} ${text}`);
};

// https://docs.sparrowsms.com — expects local 10-digit numbers.
const sparrowSender: Sender = async (to, text) => {
  const res = await fetch("https://api.sparrowsms.com/v2/sms/", {
    method: "POST",
    body: new URLSearchParams({
      token: env.SPARROW_SMS_TOKEN ?? "",
      from: env.SPARROW_SMS_FROM ?? "",
      to: to.replace(/^\+977/, ""),
      text,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Sparrow SMS failed with status ${res.status}`);
  }
};

export const sendSms: Sender =
  env.SMS_PROVIDER === "sparrow" ? sparrowSender : consoleSender;
