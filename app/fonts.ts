import { Cormorant_Garamond, Inter } from "next/font/google";

/**
 * Serif display face — used for all headings, classical/baroque voice.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

/**
 * Sleek sans — used for body copy and "tech data" (tags, metrics, dates).
 */
export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});
