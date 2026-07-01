"use client";

import { motion } from "framer-motion";

const PETAL_ANGLES = [0, 90, 180, 270];

/**
 * A node sitting on the center axis of the winding line. When its row scrolls
 * into view it "blooms": four gilt petals unfold and the rose core springs in.
 * The `inView` flag is shared with the row's ProjectCard so they reveal in sync.
 */
export default function TimelineNode({ inView }: { inView: boolean }) {
  return (
    <div className="relative z-20 flex h-full w-12 items-center justify-center">
      {/* Baroque petal flourish */}
      <motion.svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        className="absolute text-gold"
        initial={{ scale: 0, rotate: -60, opacity: 0 }}
        animate={
          inView
            ? { scale: 1, rotate: 0, opacity: 0.85 }
            : { scale: 0, rotate: -60, opacity: 0 }
        }
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {PETAL_ANGLES.map((a) => (
          <path
            key={a}
            d="M30 30 Q 42 16 30 4 Q 18 16 30 30 Z"
            transform={`rotate(${a} 30 30)`}
            fill="currentColor"
            fillOpacity={0.12}
            stroke="currentColor"
            strokeWidth={0.75}
          />
        ))}
      </motion.svg>

      {/* Pulsing halo */}
      <motion.span
        className="absolute h-5 w-5 rounded-full bg-rose-bright/40 blur-sm"
        initial={{ scale: 0, opacity: 0 }}
        animate={
          inView
            ? { scale: [1, 1.6, 1], opacity: [0.5, 0.15, 0.5] }
            : { scale: 0, opacity: 0 }
        }
        transition={{
          duration: 2.4,
          repeat: inView ? Infinity : 0,
          ease: "easeInOut",
        }}
      />

      {/* Rose core */}
      <motion.span
        className="relative h-3.5 w-3.5 rounded-full bg-rose-bright shadow-[0_0_16px_3px_rgba(200,58,94,0.6)] ring-2 ring-gold"
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : { scale: 0 }}
        transition={{ delay: 0.18, type: "spring", stiffness: 320, damping: 18 }}
      />
    </div>
  );
}
