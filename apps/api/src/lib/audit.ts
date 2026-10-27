import { schema, type Tx } from "@toly/db";
import { db } from "../db";

type AuditEntry = {
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  meta?: Record<string, unknown>;
};

export async function audit(entry: AuditEntry, tx: Tx | typeof db = db) {
  await tx
    .insert(schema.auditLogs)
    .values({ ...entry, meta: entry.meta ?? {} });
}
