import { z } from "zod";
import { envSchema } from "./env-schema";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(z.prettifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
