import { createDb } from "@toly/db";
import { env } from "./env";

export const db = createDb(env.DATABASE_URI);
