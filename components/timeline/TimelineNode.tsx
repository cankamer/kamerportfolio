"use client";

import { motion, useMotionValueEvent } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { cometHeadY, stringBroken } from "@/lib/sharedPath";

/* A water lily (nilüfer) seen from above, sitting on the center axis of the
   winding line: three overlapping rings of broad, soft-pointed petals (each
   ring offset by half a step from the one below), a ring of short stamens and
   a golden seed pod. */
const OUTER = Array.from({ length: 8 }, (_, i) => i * 45);
const MIDDLE = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);
const INNER = Array.from({ length: 8 }, (_, i) => i * 45);
const STAMENS = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5);

const PETAL_OUTER = "M0 0 C 12 -6 14.5 -27 0 -43 C -14.5 -27 -12 -6 0 0 Z";
const PETAL_MIDDLE = "M0 0 C 9.5 -5 11.5 -22 0 -34 C -11.5 -22 -9.5 -5 0 0 Z";
const PETAL_INNER = "M0 0 C 7 -4 8.5 -16 0 -25 C -8.5 -16 -7 -4 0 0 Z";
const PETAL_STAMEN = "M0 0 C 2.6 -3 3 -8 0 -13 C -3 -8 -2.6 -3 0 0 Z";

/** One petal. The wrapper fixes its angle; the inner group blooms it open from
 *  its base (fill-box origin = bottom-centre of the petal). */
function Petal({
  angle,
  d,
  open,
  delay,
  fillOpacity,
  stroke,
}: {
  angle: number;
  d: string;
  open: boolean;
  delay: number;
  fillOpacity: number;
  stroke: string;
}) {
  return (
    <g transform={`rotate(${angle})`}>
      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        initial={{ scaleY: 0.08, scaleX: 0.25, opacity: 0 }}
        animate={
          open
            ? { scaleY: 1, scaleX: 1, opacity: 1 }
            : { scaleY: 0.08, scaleX: 0.25, opacity: 0 }
        }
        transition={
          open
            ? { type: "spring", stiffness: 90, damping: 13, delay }
            : { duration: 0.35, ease: "easeIn" }
        }
      >
        <path
          d={d}
          fill="currentColor"
          fillOpacity={fillOpacity}
          stroke={stroke}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
      </motion.g>
    </g>
  );
}

/**
 * A node sitting on the center axis of the winding line. It blooms the moment
 * the lit line (the comet head) reaches it, and folds shut again if the user
 * scrolls back above it. Without a line (reduced motion, no vine) it falls
 * back to `inView` — the row's own scroll reveal.
 */
export default function TimelineNode({ inView }: { inView: boolean }) {
  const coreRef = useRef<HTMLSpanElement>(null);
  // While a line is being drawn, `reached` says whether its head has passed this
  // flower. Updated only from the line's own motion events.
  const [track, setTrack] = useState({ on: false, reached: false });

  const evaluate = useCallback(() => {
    const head = cometHeadY.get();
    const on = stringBroken.get() && head >= 0;
    let reached = false;
    if (on && coreRef.current) {
      const r = coreRef.current.getBoundingClientRect();
      reached = head >= r.top + window.scrollY + r.height / 2 - 2;
    }
    setTrack((t) => (t.on === on && t.reached === reached ? t : { on, reached }));
  }, []);

  useMotionValueEvent(cometHeadY, "change", evaluate);
  useMotionValueEvent(stringBroken, "change", evaluate);

  const open = track.on ? track.reached : inView;

  return (
    <div className="relative z-20 flex h-full w-12 items-center justify-center">
      {/* Lotus */}
      <svg
        viewBox="-46 -46 92 92"
        width="108"
        height="108"
        className="absolute text-gold"
        aria-hidden
        style={{ overflow: "visible" }}
      >
        <motion.circle
          r="44"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={0.6}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={open ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        {OUTER.map((a, i) => (
          <Petal
            key={`o${a}`}
            angle={a}
            d={PETAL_OUTER}
            open={open}
            delay={i * 0.045}
            fillOpacity={0.12}
            stroke="var(--color-gold-dim)"
          />
        ))}
        {MIDDLE.map((a, i) => (
          <Petal
            key={`m${a}`}
            angle={a}
            d={PETAL_MIDDLE}
            open={open}
            delay={0.25 + i * 0.045}
            fillOpacity={0.2}
            stroke="var(--color-gold)"
          />
        ))}
        {INNER.map((a, i) => (
          <Petal
            key={`i${a}`}
            angle={a}
            d={PETAL_INNER}
            open={open}
            delay={0.5 + i * 0.045}
            fillOpacity={0.3}
            stroke="var(--color-gold-bright)"
          />
        ))}
        {STAMENS.map((a, i) => (
          <Petal
            key={`s${a}`}
            angle={a}
            d={PETAL_STAMEN}
            open={open}
            delay={0.78 + i * 0.03}
            fillOpacity={0.55}
            stroke="var(--color-gold-bright)"
          />
        ))}
      </svg>

      {/* Pulsing halo */}
      <motion.span
        className="absolute h-5 w-5 rounded-full bg-rose-bright/40 blur-sm"
        initial={{ scale: 0, opacity: 0 }}
        animate={
          open
            ? { scale: [1, 1.6, 1], opacity: [0.5, 0.15, 0.5] }
            : { scale: 0, opacity: 0 }
        }
        transition={{
          duration: 2.4,
          repeat: open ? Infinity : 0,
          ease: "easeInOut",
          delay: open ? 1 : 0,
        }}
      />

      {/* Seed pod — also the exact point the line passes through. */}
      <motion.span
        ref={coreRef}
        data-timeline-node
        className="relative h-3.5 w-3.5 rounded-full bg-rose-bright shadow-[0_0_16px_3px_rgba(200,58,94,0.6)] ring-2 ring-gold"
        initial={{ scale: 0 }}
        animate={open ? { scale: 1 } : { scale: 0 }}
        transition={
          open
            ? { delay: 0.8, type: "spring", stiffness: 320, damping: 18 }
            : { duration: 0.25 }
        }
      />
    </div>
  );
}
