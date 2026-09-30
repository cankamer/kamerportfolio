"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pick } from "@/lib/i18n/config";
import { CATEGORY_ACCENT, type TimelineEntry } from "./timeline.types";
import { cn } from "@/lib/utils";

/** Spring feel for the 3D tilt (from React Bits' TiltedCard). */
const springValues = { damping: 30, stiffness: 100, mass: 2 };
/** Max tilt in degrees and the hover lift. Subtle — these cards are large. */
const ROTATE_AMPLITUDE = 9;
const SCALE_ON_HOVER = 1.03;

/**
 * A single journey card. Slides + unblurs in from its side, tracking the
 * row's scroll position directly (not a discrete IntersectionObserver flip)
 * so it can never "pop in" ahead of or behind a fast scroll. `mounted` only
 * gates lazy media, not the animation itself.
 */
export default function ProjectCard({
  entry,
  side,
  progress,
  mounted,
}: {
  entry: TimelineEntry;
  side: "left" | "right";
  /** 0→1, tied directly to the row's scroll position. */
  progress: MotionValue<number>;
  mounted: boolean;
}) {
  const { locale, d } = useLocale();
  const accent = CATEGORY_ACCENT[entry.category];
  const dir = side === "left" ? -1 : 1;

  const opacity = useTransform(progress, [0, 1], [0, 1]);
  // Slide in from the card's side. On phones the card spans the full width,
  // so a small nudge keeps it from starting half off-screen.
  // Measured after mount so server and client render the same first frame.
  const offset = useRef(60);
  useEffect(() => {
    offset.current = window.innerWidth < 640 ? 16 : 60;
  }, []);
  const x = useTransform(progress, (v) => (1 - v) * dir * offset.current);
  const filter = useTransform(progress, [0, 1], ["blur(10px)", "blur(0px)"]);

  // --- 3D tilt (TiltedCard mechanics) ---------------------------------------
  const tiltRef = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -ROTATE_AMPLITUDE);
    rotateY.set((offsetX / (rect.width / 2)) * ROTATE_AMPLITUDE);
  }

  function handleMouseEnter() {
    scale.set(SCALE_ON_HOVER);
  }

  function handleMouseLeave() {
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-md [perspective:900px]"
    >
    <motion.article
      ref={tiltRef}
      style={{ opacity, x, filter, rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl",
        "border border-gold/15 bg-marble/50 p-6 backdrop-blur-md",
        "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)] transition-colors",
        "hover:border-gold/40",
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px",
        "before:bg-gradient-to-r before:from-transparent before:via-gold/70 before:to-transparent",
        "text-left",
        side === "left" && "sm:text-right"
      )}
    >
      {/* Optional lazy media — only mounts once the card is in view. */}
      {entry.media && mounted && (
        <div className="mb-4 overflow-hidden rounded-xl border border-gold/10">
          {entry.media.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.media.src}
              alt={pick(entry.media.alt, locale)}
              loading="lazy"
              className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <video
              src={entry.media.src}
              muted
              loop
              playsInline
              preload="none"
              className="h-44 w-full object-cover"
            />
          )}
        </div>
      )}

      <div
        className={cn(
          "flex flex-wrap items-center gap-3",
          "justify-start",
          side === "left" && "sm:justify-end"
        )}
      >
        <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold-dim">
          {entry.period}
        </span>
        <span className="h-1 w-1 rounded-full bg-gold/50" />
        <span className={cn("font-sans text-xs tracking-wide", accent)}>
          {d.categories[entry.category]}
        </span>
      </div>

      <h3 className="mt-2 text-2xl text-ivory">{pick(entry.title, locale)}</h3>

      <p className="mt-3 font-sans text-sm leading-relaxed text-ivory-dim">
        {pick(entry.description, locale)}
      </p>

      <ul
        className={cn(
          "mt-4 flex flex-wrap gap-2",
          "justify-start",
          side === "left" && "sm:justify-end"
        )}
      >
        {entry.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-gold/20 bg-obsidian-50/60 px-2.5 py-0.5 font-sans text-[11px] tracking-wide text-ivory-dim"
          >
            {tag}
          </li>
        ))}
      </ul>

      {entry.stats && entry.stats.length > 0 && (
        <dl
          className={cn(
            "mt-5 flex flex-wrap gap-x-6 gap-y-3",
            "justify-start",
            side === "left" && "sm:justify-end"
          )}
        >
          {entry.stats.map((stat) => (
            <div key={pick(stat.label, locale)} className="leading-tight">
              <dt className={cn("font-serif text-2xl", accent)}>{stat.value}</dt>
              <dd className="font-sans text-[10px] uppercase tracking-[0.18em] text-ivory-dim">
                {pick(stat.label, locale)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {entry.features && entry.features.length > 0 && (
        <div className="mt-6 border-t border-gold/10 pt-4">
          <h4 className="font-sans text-[11px] uppercase tracking-[0.22em] text-gold-dim">
            {d.timeline.features}
          </h4>
          <ul className="mt-3 space-y-1.5">
            {entry.features.map((feature) => (
              <li
                key={pick(feature, locale)}
                className={cn(
                  "flex items-start gap-2 font-sans text-sm text-ivory-dim",
                  "text-left",
                  side === "left" && "sm:flex-row-reverse sm:text-right"
                )}
              >
                <span aria-hidden className={cn("mt-0.5 shrink-0", accent)}>
                  ✦
                </span>
                <span>{pick(feature, locale)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.comments && entry.comments.length > 0 && (
        <div className="mt-6 border-t border-gold/10 pt-4">
          <h4 className="font-sans text-[11px] uppercase tracking-[0.22em] text-gold-dim">
            {d.timeline.comments}
          </h4>
          <ul className="mt-3 space-y-3">
            {entry.comments.map((comment) => (
              <li
                key={comment.author}
                className="rounded-xl border border-gold/10 bg-obsidian-50/40 px-3.5 py-2.5"
              >
                <p className="font-sans text-sm italic leading-relaxed text-ivory-dim">
                  “{pick(comment.text, locale)}”
                </p>
                <span className={cn("mt-1.5 block font-sans text-[11px] tracking-wide", accent)}>
                  @{comment.author}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.href && (
        <a
          href={entry.href}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "mt-5 inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.2em]",
            "text-gold transition-colors hover:text-gold-bright"
          )}
        >
          {d.timeline.explore}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
      )}
      </motion.article>
    </div>
  );
}
