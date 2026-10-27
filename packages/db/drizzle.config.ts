import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile("../../.env");
} catch {}

const url = process.env.DATABASE_URI;
if (!url) throw new Error("DATABASE_URI is not set");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url },
  strict: true,
});
