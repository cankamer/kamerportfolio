"use client";

import { motion } from "framer-motion";
import { TIMELINE } from "@/lib/data/timeline";
import SectionHeading from "@/components/ui/SectionHeading";
import TimelineNode from "./TimelineNode";
import ProjectCard from "./ProjectCard";
import Stack from "@/components/ui/Stack";
import { useInView } from "@/hooks/useInView";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "./timeline.types";

/** Draggable photo stack shown on the side opposite the card. Each card takes
 *  the shape of its own photo (see Stack.css); this is just the bounding box. */
function PhotoCluster({ photos, inView }: { photos: string[]; inView: boolean }) {
  if (!inView) return null;
  return (
    // Square-ish bounding box (340 × 340) so portrait, landscape and square
    // shots all fit; each card shrink-wraps to its photo's aspect ratio inside
    // it. Eases in with the card instead of popping.
    <motion.div
      className="w-[clamp(160px,24vw,340px)] h-[clamp(160px,24vw,340px)]"
      initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <Stack
        randomRotation
        sensitivity={180}
        sendToBackOnClick
        autoplay
        autoplayDelay={2600}
        pauseOnHover
        cards={photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt={`photo-${i + 1}`} className="card-image" loading="lazy" />
        ))}
      />
    </motion.div>
  );
}

/**
 * One timeline row. A single IntersectionObserver on the row drives both the
 * blooming node and the card, so the card fades in exactly as the flower opens.
 */
function TimelineRow({ entry, side }: { entry: TimelineEntry; side: "left" | "right" }) {
  // once:false → blooms replay each time the row re-enters the viewport.
  // The negative bottom margin delays the reveal until the row climbs higher.
  const { ref, inView } = useInView<HTMLLIElement>({
    threshold: 0.2,
    rootMargin: "0px 0px -35% 0px",
    once: false,
  });

  return (
    <li
      ref={ref}
      className="grid grid-cols-1 items-center gap-6 py-10 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:min-h-[58vh] sm:gap-8 sm:py-0"
    >
      {/* DOM order stays left-card, node, right-card so sm+ grid columns map
          correctly ([1fr_auto_1fr]); `order-*` only reshuffles the mobile
          single-column stack (node above the card) and resets via
          sm:order-none, where equal-order items fall back to source order.
          The flanking tracks use minmax(0,1fr) — plain 1fr floors at each
          column's min-content width, so the photo cluster's fixed-ish box
          could out-bid the card column for space and drag the center
          (auto) column off true center, desyncing the flower from the
          SVG line drawn at x=50%. minmax(0,_) keeps both tracks exactly
          equal regardless of content. */}
      <div className="order-2 flex min-w-0 justify-center sm:order-none sm:justify-end">
        {side === "left" ? (
          <ProjectCard entry={entry} side="left" inView={inView} />
        ) : (
          // Card is on the right → photos sit on the LEFT, pushed off the path.
          entry.photos?.length ? (
            <div className="hidden min-w-0 md:block md:mr-8 lg:mr-20 xl:mr-32">
              <PhotoCluster photos={entry.photos} inView={inView} />
            </div>
          ) : null
        )}
      </div>

      <div className="order-1 justify-self-center sm:order-none sm:justify-self-auto">
        <TimelineNode inView={inView} />
      </div>

      <div className="order-2 flex min-w-0 justify-center sm:order-none sm:justify-start">
        {side === "right" ? (
          <ProjectCard entry={entry} side="right" inView={inView} />
        ) : (
          // Card is on the left → photos sit on the RIGHT, pushed off the path.
          entry.photos?.length ? (
            <div className="hidden min-w-0 md:block md:ml-8 lg:ml-20 xl:ml-32">
              <PhotoCluster photos={entry.photos} inView={inView} />
            </div>
          ) : null
        )}
      </div>
    </li>
  );
}

export default function Timeline() {
  const { d } = useLocale();

  return (
    <section id="journey" className="relative z-20 mx-auto w-full max-w-6xl px-4 py-28 sm:px-8">
      <SectionHeading
        eyebrow={d.timeline.eyebrow}
        title={d.timeline.title}
        className="mb-24"
      />

      <div id="journey-path" className="relative">
        <ol className="relative">
          {TIMELINE.map((entry, i) => (
            <TimelineRow key={entry.id} entry={entry} side={i % 2 === 0 ? "left" : "right"} />
          ))}
        </ol>
      </div>
    </section>
  );
}
