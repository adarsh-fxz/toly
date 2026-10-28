import { Suspense } from "react";
import { SiteBody } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-5 focus:py-3 focus:text-background"
      >
        Skip to content
      </a>
      <Suspense>
        <SiteHeader />
      </Suspense>
      <Suspense>
        <SiteBody>{children}</SiteBody>
      </Suspense>
      <SiteFooter />
    </>
  );
}
