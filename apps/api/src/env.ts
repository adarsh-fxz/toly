import { z } from "zod";

const optional = z
  .string()
  .trim()
  .optional()
  .transform((v) => v || undefined);

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().default(4000),
    WEB_URL: z.url().default("http://localhost:3000"),
    DATABASE_URI: z.url(),
    REDIS_URL: z.url().optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: optional,
    GOOGLE_CLIENT_SECRET: optional,
    TURNSTILE_SITE_KEY: optional,
    TURNSTILE_SECRET_KEY: optional,
    SMS_PROVIDER: z.enum(["console", "sparrow"]).default("console"),
    SPARROW_SMS_TOKEN: optional,
    SPARROW_SMS_FROM: optional,
  })
  .refine((e) => e.NODE_ENV !== "production" || e.SMS_PROVIDER !== "console", {
    message: "SMS_PROVIDER must be a real provider in production",
    path: ["SMS_PROVIDER"],
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
  .refine((e) => Boolean(e.GOOGLE_CLIENT_ID) === Boolean(e.GOOGLE_CLIENT_SECRET), {
    message: "Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET",
    path: ["GOOGLE_CLIENT_ID"],
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(z.prettifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
