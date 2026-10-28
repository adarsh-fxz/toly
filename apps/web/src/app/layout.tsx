import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { bricolage, devanagari, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Toly: group deals around Kathmandu",
    template: "%s | Toly",
  },
  description:
    "Round up your toly, unlock group prices at cafés and venues across Kathmandu Valley, and pay the venue directly.",
  applicationName: "Toly",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b13" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        bricolage.variable,
        inter.variable,
        devanagari.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
