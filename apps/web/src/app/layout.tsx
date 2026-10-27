import type { Metadata, Viewport } from "next";
import { Anek_Devanagari, Mukta } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const anek = Anek_Devanagari({
  subsets: ["latin", "devanagari"],
  axes: ["wdth"],
  variable: "--font-anek",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mukta",
});

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
    { media: "(prefers-color-scheme: light)", color: "#f6f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#11132a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased", anek.variable, mukta.variable)}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
