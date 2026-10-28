import { z } from "zod";

const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DEMO_MODE: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    PORT: z.coerce.number().int().default(4000),
    WEB_URL: z.url().default("http://localhost:3000"),
    DATABASE_URI: z.url(),
    REDIS_URL: z.url().optional(),
    // Header your edge proxy overwrites with the real client IP. Never trust a header clients can set themselves.
    CLIENT_IP_HEADER: z.string().toLowerCase().default("x-real-ip"),
    BETTER_AUTH_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: optional,
    GOOGLE_CLIENT_SECRET: optional,
    TURNSTILE_SITE_KEY: optional,
    TURNSTILE_SECRET_KEY: optional,
    SMS_PROVIDER: z.enum(["console", "sparrow"]).default("console"),
    PAYMENTS_PROVIDER: z.enum(["mock", "khalti"]).default("mock"),
    KHALTI_SECRET_KEY: optional,
    KHALTI_API_URL: z.url().default("https://dev.khalti.com/api/v2"),
    SPARROW_SMS_TOKEN: optional,
    SPARROW_SMS_FROM: optional,
  })
  .refine(
    (e) =>
      e.NODE_ENV !== "production" ||
      e.DEMO_MODE ||
      e.SMS_PROVIDER !== "console",
    {
      message: "SMS_PROVIDER must be a real provider in production",
      path: ["SMS_PROVIDER"],
    },
  )
  .refine(
    (e) =>
      e.NODE_ENV !== "production" ||
      e.DEMO_MODE ||
      e.PAYMENTS_PROVIDER !== "mock",
    {
      message: "PAYMENTS_PROVIDER must be a real provider in production",
      path: ["PAYMENTS_PROVIDER"],
    },
  )
  .refine(
    (e) =>
      !e.DEMO_MODE ||
      (e.SMS_PROVIDER === "console" &&
        e.PAYMENTS_PROVIDER === "mock" &&
        !e.GOOGLE_CLIENT_ID &&
        !e.GOOGLE_CLIENT_SECRET),
    {
      message:
        "Demo mode requires console SMS, mock payments and no Google OAuth",
      path: ["DEMO_MODE"],
    },
  )
  .refine((e) => e.PAYMENTS_PROVIDER !== "khalti" || e.KHALTI_SECRET_KEY, {
    message: "KHALTI_SECRET_KEY is required",
    path: ["KHALTI_SECRET_KEY"],
  })
  .refine(
    (e) =>
      e.SMS_PROVIDER !== "sparrow" ||
      (e.SPARROW_SMS_TOKEN && e.SPARROW_SMS_FROM),
    {
      message: "SPARROW_SMS_TOKEN and SPARROW_SMS_FROM are required",
      path: ["SPARROW_SMS_TOKEN"],
    },
  )
  .refine(
    (e) => Boolean(e.GOOGLE_CLIENT_ID) === Boolean(e.GOOGLE_CLIENT_SECRET),
    {
      message: "Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET",
      path: ["GOOGLE_CLIENT_ID"],
    },
  );
