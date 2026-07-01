import type { Localized } from "@/lib/i18n/config";

/**
 * Domain types for "The Journey" timeline section.
 *
 * Per-entry text is `Localized` (tr/en/de) so cards translate with the rest of
 * the site. Category labels live in the dictionary (d.categories.*); here we
 * only keep the accent treatment used for nodes and chips.
 */

export type TimelineCategory =
  | "ai"
  | "electronics"
  | "robotics"
  | "social"
  | "software";

/** Tailwind text-color utility per category (e.g. "text-gold"). */
export const CATEGORY_ACCENT: Record<TimelineCategory, string> = {
  ai: "text-gold-bright",
  electronics: "text-gold",
  robotics: "text-rose-bright",
  social: "text-rose",
  software: "text-ivory",
};

/** Optional lazy-loaded media inside a card. Drop files in /public. */
export interface TimelineMedia {
  type: "image" | "video";
  /** Path under /public, e.g. "/projects/smarthome.jpg". */
  src: string;
  alt: Localized;
}

export interface TimelineEntry {
  id: string;
  /** e.g. "2024" or "2022 — 2024". */
  period: string;
  category: TimelineCategory;
  title: Localized;
  description: Localized;
  /** Tech / tools chips shown in the sans "tech data" voice (not translated). */
  tags: string[];
  /** Optional outbound link (repo, demo, video). */
  href?: string;
  media?: TimelineMedia;
  /**
   * Optional highlight metrics (e.g. plays, code blocks, loves). Rendered as a
   * compact row of value + localized label. `value` is raw (kept as a string so
   * "1500+" works); `label` translates with the rest of the site.
   */
  stats?: { label: Localized; value: string }[];
  /** Optional feature bullets — one short localized line each. */
  features?: Localized[];
  /**
   * Optional player testimonials. `author` is a proper name (the only i18n
   * exception); `text` is localized so quotes read in the active language.
   */
  comments?: { author: string; text: Localized }[];
  /**
   * Optional draggable photo Stack shown on the *opposite* side of the card
   * (card left → photos right, and vice-versa). Cards are 4:3 landscape. Paths
   * under /public (e.g. "/projects/teknofest/1.jpg") or remote URLs.
   */
  photos?: string[];
}
