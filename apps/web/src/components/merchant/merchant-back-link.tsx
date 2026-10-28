"use client";
import { usePathname } from "next/navigation";
import { BackLink } from "@/components/layout/back-link";
export function MerchantBackLink({ merchantId }: { merchantId: string }) {
  const pathname = usePathname();
  const base = `/merchant/${merchantId}`;
  const editor = pathname.startsWith(`${base}/deals/`);
  return (
    <BackLink href={editor ? `${base}/deals` : pathname === base ? "/" : base}>
      {editor
        ? "Venue deals"
        : pathname === base
          ? "All deals"
          : "Venue overview"}
    </BackLink>
  );
}
