import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function createDb(url: string, options: { max?: number } = {}) {
  // Neon's pooler runs PgBouncer in transaction mode, which cannot share prepared statements.
  const sql = postgres(url, { max: options.max ?? 10, prepare: false });
  return drizzle(sql, { schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

export * from "drizzle-orm";
export { schema };
