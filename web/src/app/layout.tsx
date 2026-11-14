import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Inter_Tight } from "next/font/google";
import Nav from "@/components/Nav";
import SiteFooter from "@/components/SiteFooter";
import { INTRO_BOOT_SCRIPT } from "@/lib/intro";
import "./globals.css";

// Inter stands in for PP Neue Montreal (licensed); swap the family here if the licence is bought.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Display face for big headlines (tighter, more sculptural than Inter at 100px+)
const interTight = Inter_Tight({ variable: "--font-display", subsets: ["latin"] });
// Italic serif accent for a single word in a headline
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Laxman Sirvi — AI & Full-Stack Developer",
  description:
    "B.Tech CSE (AI & ML) student at GCET with an IIT Madras Foundation in Data Science, building production AI end to end: agentic search, full-stack platforms and AI assistants.",
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-intro is set by the boot script before hydration, hence suppressHydrationWarning.
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      </head>
      <body>
        <Nav />
        {children}
        {/* the wordmark is drawn on a canvas, so it needs the real (next/font) family name */}
        <SiteFooter fontFamily={interTight.style.fontFamily} />
      </body>
    </html>
  );
}
