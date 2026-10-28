// Toly · app/fonts.ts
// Use in app/layout.tsx:
//   <html lang="en" suppressHydrationWarning className={`${bricolage.variable} ${inter.variable} ${devanagari.variable}`}>
// Theme: wrap children in next-themes <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
import {
  Bricolage_Grotesque,
  Inter,
  Noto_Sans_Devanagari,
} from "next/font/google";

// variable font (wght 200–800 + optical size), so in-between weights like 650 render exactly
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-devanagari",
  display: "swap",
});
