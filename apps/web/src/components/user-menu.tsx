"use client";

import { LogOut, Settings, ShieldCheck, Store, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { CurrentUser } from "@/lib/session";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ user }: { user: CurrentUser | null }) {
  const router = useRouter();

  if (!user) {
    return (
      <Link href="/sign-in" className={buttonVariants({ size: "sm" })}>
        Sign in
      </Link>
    );
  }

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Open account menu"
      >
        <Avatar className="size-10">
          {user.image ? <AvatarImage src={user.image} alt="" /> : null}
          <AvatarFallback className="bg-ink font-semibold text-ink-foreground">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">
            {user.name || "Your account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/me" />}>
            <Ticket aria-hidden />
            My tolys and vouchers
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/account" />}>
            <Settings aria-hidden />
            Account and security
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/merchant" />}>
            <Store aria-hidden />
            For venues
          </DropdownMenuItem>
          {user.role === "admin" ? (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <ShieldCheck aria-hidden />
              Admin
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
