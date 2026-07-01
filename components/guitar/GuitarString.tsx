"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { GuitarStringDef } from "@/lib/data/strings";
import type { Orientation } from "./buildPaths";

interface GuitarStringProps {
  def: GuitarStringDef;
  /** Position in the string stack — used to stagger the intro shimmer. */
  index?: number;
  orientation: Orientation;
  /** Resting position on the cross axis. */
  lane: number;
  /** Span along the main axis. */
  length: number;
  /** Whether hover/pluck is active (false once broken). */
  interactive: boolean;
  /** When true, run the violent high-frequency snap, then call onSnapEnd. */
  snapping?: boolean;
  onSnapEnd?: () => void;
  /** Reduced-motion: damp the physics. */
  reduced?: boolean;
  /** Bumped by the parent to fire a silent attention ripple (no audio). */
  invite?: number;
  /** Play the note for this string. */
  onPluck: (def: GuitarStringDef, intensity: number) => void;
}

export default function GuitarString({
  def,
  index = 0,
  orientation,
  lane,
  length,
  interactive,
  snapping = false,
  onSnapEnd,
  reduced = false,
  invite = 0,
  onPluck,
}: GuitarStringProps) {
  // Displacement of the midpoint along the vibration (cross) axis.
  const disp = useMotionValue(0);
  const cp = useTransform(disp, (v) => lane + v);
  const dirRef = useRef(1);
  const lastStrumRef = useRef(0);

  // Build the path for both orientations (hooks must run unconditionally).
  const dHorizontal = useMotionTemplate`M 0 ${lane} Q ${length / 2} ${cp} ${length} ${lane}`;
  const dVertical = useMotionTemplate`M ${lane} 0 Q ${cp} ${length / 2} ${lane} ${length}`;
  const d = orientation === "horizontal" ? dHorizontal : dVertical;

  // String physics: thinner strings vibrate a touch wider; everything is kept
  // subtle and well-damped so it reads as a quick "pluck", not a wild wobble.
  const amp = (reduced ? 0.3 : 1) * (4 + (3.2 - def.thickness) * 2);
  const stiffness = 420 + (3.2 - def.thickness) * 120;
  const mass = 0.35 + def.thickness * 0.14;

  function strum(intensity = 0.85, x?: number, y?: number) {
    if (!interactive) return;
    // Cooldown: overlapping hit-areas would otherwise re-trigger every move.
    const now = performance.now();
    if (now - lastStrumRef.current < 110) return;
    lastStrumRef.current = now;

    const sign = (dirRef.current *= -1);
    disp.set(sign * amp * (0.7 + intensity * 0.4));
    animate(disp, 0, {
      type: "spring",
      stiffness,
      damping: reduced ? 30 : 15,
      mass,
    });
    onPluck(def, intensity);

    // Shed a few sakura petals at the touch point (SakuraCursor listens).
    if (x != null && y != null) {
      window.dispatchEvent(
        new CustomEvent("sakura-pluck", { detail: { x, y, intensity } })
      );
    }
  }

  // Intro: on first load each string gives a gentle, staggered shimmer — a
  // silent visual ripple (no audio, no petals) that fades into stillness.
  useEffect(() => {
    if (reduced) return;
    const a = amp * 0.8;
    const delay = 220 + index * 110;
    const t = setTimeout(() => {
      animate(disp, [0, a, -a * 0.7, a * 0.45, -a * 0.28, a * 0.15, -a * 0.07, 0], {
        duration: 1.6,
        ease: "easeOut",
      });
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invitation: a silent ripple the parent fires every few seconds before the
  // user has touched a string. Staggered by index so the wave visibly travels
  // across the stack — a clear "these are interactive, pluck them" cue.
  useEffect(() => {
    if (invite === 0 || reduced || !interactive) return;
    const a = amp * 0.85;
    const delay = index * 95;
    const t = setTimeout(() => {
      animate(disp, [0, a, -a * 0.6, a * 0.36, -a * 0.2, a * 0.1, 0], {
        duration: 1.35,
        ease: "easeOut",
      });
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invite]);

  // Snap: a quick, violent tremor that decays fast, then we hand back to the
  // parent — the string trembles and breaks almost immediately.
  useEffect(() => {
    if (!snapping) return;
    const a = reduced ? amp * 0.5 : amp * 1.6;
    const controls = animate(
      disp,
      [0, a, -a * 0.75, a * 0.5, -a * 0.32, a * 0.18, -a * 0.08, 0],
      { duration: reduced ? 0.15 : 0.24, ease: "easeOut" }
    );
    controls.then(() => onSnapEnd?.());
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapping]);

  // If a snap is cancelled mid-tremor (scrolled back to the top before it
  // broke), the stopped animation leaves the string bent — settle it to rest.
  const prevSnapping = useRef(false);
  useEffect(() => {
    if (prevSnapping.current && !snapping) {
      animate(disp, 0, { type: "spring", stiffness: 220, damping: 22 });
    }
    prevSnapping.current = snapping;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapping]);

  return (
    <g>
      <defs>
        {/* userSpaceOnUse (not objectBoundingBox): a straight string has a
            zero-height bbox, which makes an objectBoundingBox gradient
            degenerate and the stroke vanish once the vibration settles. */}
        <linearGradient
          id={`string-grad-${def.id}`}
          gradientUnits="userSpaceOnUse"
          x1={orientation === "horizontal" ? 0 : lane}
          y1={orientation === "horizontal" ? lane : 0}
          x2={orientation === "horizontal" ? length : lane}
          y2={orientation === "horizontal" ? lane : length}
        >
          <stop offset="0%" stopColor="var(--color-gold-dim)" />
          <stop offset="50%" stopColor="var(--color-gold-bright)" />
          <stop offset="100%" stopColor="var(--color-gold)" />
        </linearGradient>
      </defs>

      {/* Visible metallic string */}
      <motion.path
        d={d}
        fill="none"
        stroke={`url(#string-grad-${def.id})`}
        strokeWidth={def.thickness}
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 2px rgba(201,162,75,0.35))" }}
      />

      {/* Slim invisible hit-area for strumming (kept narrow so adjacent strings
          don't both fire as the cursor passes between them). */}
      {interactive && (
        <motion.path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={14}
          strokeLinecap="round"
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
          onPointerEnter={(e) => strum(0.8, e.clientX, e.clientY)}
          onPointerDown={(e) => strum(1, e.clientX, e.clientY)}
        />
      )}
    </g>
  );
}
