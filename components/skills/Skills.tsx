"use client";

import { useMemo } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import CircularGallery, { type GalleryItem } from "@/components/ui/CircularGallery";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Shrink the font size so `text` fits within `maxWidth` (SVG <text> doesn't
 * wrap). `factor` ≈ average glyph width / font size for the typeface.
 */
function fitFont(text: string, maxFont: number, maxWidth: number, factor: number) {
  const est = text.length * maxFont * factor;
  if (est <= maxWidth) return maxFont;
  return Math.max(18, Math.floor(maxWidth / (text.length * factor)));
}

/**
 * Render a single skill group as a baroque card image (data-URI SVG) so it can
 * ride the WebGL circular gallery. Dark marble field, gilt frame, serif title,
 * skill list beneath.
 */
function cardSVG(title: string, items: string[]): string {
  const W = 700;
  const H = 900;
  const MAX_W = W - 90; // keep clear of the gilt frame
  const shown = items.slice(0, 7);
  const lines = shown
    .map((item, i) => {
      const fs = fitFont(item, 34, MAX_W, 0.5);
      return `<text x="${W / 2}" y="${300 + i * 80}" text-anchor="middle" font-family="Georgia, serif" font-size="${fs}" fill="#cdc6b8">${esc(item)}</text>`;
    })
    .join("");
  const titleFs = fitFont(title, 56, MAX_W, 0.58);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#14141a"/>
        <stop offset="100%" stop-color="#0a0a0c"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8a6d2f"/>
        <stop offset="50%" stop-color="#ecd18a"/>
        <stop offset="100%" stop-color="#c9a24b"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="${H}" rx="36" fill="url(#bg)"/>
    <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="28" fill="none" stroke="#c9a24b" stroke-opacity="0.35" stroke-width="2"/>
    <rect x="${W / 2 - 120}" y="110" width="240" height="3" rx="1.5" fill="url(#gold)"/>
    <text x="${W / 2}" y="190" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="${titleFs}" fill="#ecd18a">${esc(title)}</text>
    <text x="${W / 2}" y="234" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#8a6d2f" letter-spacing="4">✦ ✦ ✦</text>
    ${lines}
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * "The Atelier" — skill groups presented as a curved, draggable WebGL gallery
 * (React Bits' CircularGallery). Drag, scroll, or use arrow keys to spin.
 */
export default function Skills() {
  const { d } = useLocale();

  const items = useMemo<GalleryItem[]>(
    () =>
      d.skills.groups.map((group) => ({
        image: cardSVG(group.title, group.items),
        text: group.title,
      })),
    [d.skills.groups]
  );

  return (
    <section
      id="skills"
      className="relative z-10 mx-auto w-full max-w-6xl px-4 py-28 sm:px-8"
    >
      <SectionHeading eyebrow={d.skills.eyebrow} title={d.skills.title} className="mb-12" />

      {/* Full-bleed: break out of the section's max-w container so the gallery
          spans edge to edge (see CLAUDE.md → Full-bleed sections). */}
      <div className="relative left-1/2 h-[700px] w-screen -translate-x-1/2 overflow-visible">
        <CircularGallery
          items={items}
          bend={2.5}
          borderRadius={0.05}
          textColor="#ecd18a"
          font="bold 30px Georgia"
          scrollEase={0.04}
        />
      </div>
    </section>
  );
}
