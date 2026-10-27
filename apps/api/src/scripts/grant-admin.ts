// Usage: pnpm --filter @toly/api admin:grant +9779800000000
import { eq, schema } from "@toly/db";
import { normalizeNepaliPhone } from "@toly/shared/phone";
import { db } from "../db";
import { audit } from "../lib/audit";

const phone = normalizeNepaliPhone(process.argv[2] ?? "");
if (!phone) {
  console.error("Pass the admin's verified Nepali mobile number");
  process.exit(1);
}

const [user] = await db
  .update(schema.user)
  .set({ role: "admin" })
  .where(eq(schema.user.phoneNumber, phone))
  .returning({ id: schema.user.id, name: schema.user.name });

if (!user) {
  console.error("No account uses that number. Sign in once with it first.");
  process.exit(1);
}

await audit({
  actorId: null,
  action: "user.grant_admin",
  targetType: "user",
  targetId: user.id,
});
console.log(
  `${user.name || user.id} is now an admin. They must add a passkey before using admin tools.`,
);
process.exit(0);
