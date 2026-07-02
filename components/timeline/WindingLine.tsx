"use client";

import { motion, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useState } from "react";
import { stringBroken, sharedPathProgress, sharedVineRatio } from "@/lib/sharedPath";

/** Horizontal bulge of the winding line within the 0–100 viewBox width. */
const AMPLITUDE = 26;
/** Vertical viewBox units allotted to each node row. */
const SEGMENT = 100;

/**
 * Builds a vertical zig-zag bezier that passes through the center axis (x=50)
 * at every node center and bulges alternately left/right in between — the
 * "winding vine" spine of the timeline.
 */
function buildPath(count: number): string {
  // Anchor points down the center axis: top edge, each node center, bottom edge.
  const ys = [0, ...Array.from({ length: count }, (_, i) => (i + 0.5) * SEGMENT), count * SEGMENT];

  let d = `M 50 ${ys[0]}`;
  for (let i = 1; i < ys.length; i++) {
    const y0 = ys[i - 1];
    const y1 = ys[i];
    const span = y1 - y0;
    const bulge = i % 2 === 1 ? 50 + AMPLITUDE : 50 - AMPLITUDE;
    // Cubic curve out toward `bulge` then back to the center axis at y1.
    d += ` C ${bulge} ${y0 + span * 0.25}, ${bulge} ${y1 - span * 0.25}, 50 ${y1}`;
  }
  return d;
}

export default function WindingLine({
  count,
  scrollYProgress,
}: {
  count: number;
  scrollYProgress: MotionValue<number>;
}) {
  const d = buildPath(count);
  const viewHeight = count * SEGMENT;

  const [isBroken, setIsBroken] = useState(false);
  useMotionValueEvent(stringBroken, "change", setIsBroken);

  // When vine is broken, use the [vineRatio → 1] slice of sharedPathProgress.
  // Otherwise fall back to Timeline's own scrollYProgress.
  const rawProgress = useTransform(
    [sharedPathProgress, sharedVineRatio, scrollYProgress],
    ([p, r, local]: number[]) =>
      r > 0 ? Math.max(0, Math.min(1, (p - r) / (1 - r))) : local
  );

  // Smooth out sudden jumps (e.g. from lazy-loaded photos shifting layout
  // mid-scroll and reshuffling the progress range) instead of teleporting.
  const effectiveProgress = useSpring(rawProgress, { stiffness: 300, damping: 40, mass: 0.5 });

  const headLength = useTransform(effectiveProgress, [0, 1], [0.0, 0.04]);

  return (
    <svg
      aria-hidden
      viewBox={`0 0 100 ${viewHeight}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    >
      <defs>
        <linearGradient id="winding-gold-rose" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-gold)" />
          <stop offset="60%" stopColor="var(--color-gold)" />
          <stop offset="100%" stopColor="var(--color-rose)" />
        </linearGradient>
      </defs>

      {/* Engraved track — hidden until string breaks, scroll-driven with effective progress. */}
      {isBroken && (
        <motion.path
          d={d}
          fill="none"
          stroke="var(--color-marble-light)"
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: effectiveProgress }}
        />
      )}

      {/* Drawn line: follows effective progress (shared when vine broken, local otherwise). */}
      <motion.path
        d={d}
        fill="none"
        stroke="url(#winding-gold-rose)"
        strokeWidth={2.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: effectiveProgress }}
      />

      {/* Bright comet head riding the leading edge. */}
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-gold-bright)"
        strokeWidth={4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: headLength, pathOffset: effectiveProgress }}
        className="drop-shadow-[0_0_6px_var(--color-gold-bright)]"
      />
    </svg>
  );
}
