"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { TIMELINE } from "@/lib/data/timeline";
import SectionHeading from "@/components/ui/SectionHeading";
import TimelineNode from "./TimelineNode";
import ProjectCard from "./ProjectCard";
import Stack from "@/components/ui/Stack";
import LogoOrigin from "@/components/logo/LogoOrigin";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "./timeline.types";

/** Draggable photo stack shown on the side opposite the card. Each card takes
 *  the shape of its own photo (see Stack.css); this is just the bounding box. */
function PhotoCluster({
  photos,
  mounted,
  progress,
}: {
  photos: string[];
  mounted: boolean;
  /** 0→1, tied directly to the row's scroll position — never a discrete pop. */
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [0, 1], [0, 1]);
  const scale = useTransform(progress, [0, 1], [0.85, 1]);
  const filter = useTransform(progress, [0, 1], ["blur(8px)", "blur(0px)"]);

  if (!mounted) return null;
  return (
    // Square-ish bounding box (340 × 340) so portrait, landscape and square
    // shots all fit; each card shrink-wraps to its photo's aspect ratio inside
    // it. Tracks scroll position directly so it can never "pop" ahead of it.
    <motion.div
      className="w-[clamp(160px,24vw,340px)] h-[clamp(160px,24vw,340px)]"
      style={{ opacity, scale, filter }}
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

/** Animated piece shown in the photo slot (entry.showcase). Fades in with
 *  the row like the photo stack, then plays once it is in view. */
function ShowcaseCluster({ mounted, progress }: { mounted: boolean; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 1], [0, 1]);
  const scale = useTransform(progress, [0, 1], [0.85, 1]);

  if (!mounted) return null;
  return (
    <motion.div style={{ opacity, scale }}>
      <LogoOrigin className="w-[clamp(180px,26vw,360px)] aspect-[500/450]" />
    </motion.div>
  );
}

/**
 * One timeline row. Reveal is tied directly to the row's scroll position
 * (not a discrete IntersectionObserver flip), so the card/flower/photos
 * always match exactly how far the user has scrolled — they can never
 * "pop in" ahead of or behind a fast scroll.
 */
function TimelineRow({ entry, side }: { entry: TimelineEntry; side: "left" | "right" }) {
  const rowRef = useRef<HTMLLIElement>(null);
  // start 90%: begins revealing just before the row enters the viewport.
  // start 40%: fully revealed once it's climbed most of the way up — mirrors
  // the old rootMargin -35% delay, but continuously instead of as a jump.
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start 90%", "start 40%"],
  });

  // Cheap boolean, only for mount/unmount of heavy content (lazy media,
  // draggable photo stack) — never drives the actual animation.
  const [mounted, setMounted] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => setMounted(v > 0));

  return (
    <li
      ref={rowRef}
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
          <ProjectCard entry={entry} side="left" progress={scrollYProgress} mounted={mounted} />
        ) : (
          // Card is on the right → photos sit on the LEFT, pushed off the path.
          entry.showcase ? (
            <div className="hidden min-w-0 md:block md:mr-8 lg:mr-20 xl:mr-32">
              <ShowcaseCluster mounted={mounted} progress={scrollYProgress} />
            </div>
          ) : entry.photos?.length ? (
            <div className="hidden min-w-0 md:block md:mr-8 lg:mr-20 xl:mr-32">
              <PhotoCluster photos={entry.photos} mounted={mounted} progress={scrollYProgress} />
            </div>
          ) : null
        )}
      </div>

      <div className="order-1 justify-self-center sm:order-none sm:justify-self-auto">
        <TimelineNode inView={mounted} />
      </div>

      <div className="order-2 flex min-w-0 justify-center sm:order-none sm:justify-start">
        {side === "right" ? (
          <ProjectCard entry={entry} side="right" progress={scrollYProgress} mounted={mounted} />
        ) : (
          // Card is on the left → photos sit on the RIGHT, pushed off the path.
          entry.showcase ? (
            <div className="hidden min-w-0 md:block md:ml-8 lg:ml-20 xl:ml-32">
              <ShowcaseCluster mounted={mounted} progress={scrollYProgress} />
            </div>
          ) : entry.photos?.length ? (
            <div className="hidden min-w-0 md:block md:ml-8 lg:ml-20 xl:ml-32">
              <PhotoCluster photos={entry.photos} mounted={mounted} progress={scrollYProgress} />
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
