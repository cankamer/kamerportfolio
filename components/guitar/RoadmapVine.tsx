"use client";

import {
  motion,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { WINDING_AMPLITUDE_RATIO } from "./buildPaths";
import { cometHeadY, sharedPathProgress, sharedVineRatio } from "@/lib/sharedPath";

interface RoadmapVineProps {
  widthPx: number;
  segments: number;
  heightPx: number;
  strokeWidth?: number;
  reduced?: boolean;
  /** Vine-relative X the broken string stays anchored to (the RIGHT edge). */
  anchorX?: number;
  /** Vine-relative X where the left edge of the screen is (the broken end). */
  leftEdgeX?: number;
  crossingYs?: number[]; // vine-relative Y positions where path crosses center axis
  /** Document-space Y of the vine's top, to publish the comet head's page position. */
  docTop?: number;
}

// marble-light (#21212a) is near-invisible on obsidian (#0a0a0c); use a
// clearly visible engraved-track grey with a subtle baroque blue-purple tint.
const GREY = "#35354d";

export default function RoadmapVine({
  widthPx,
  segments,
  heightPx,
  strokeWidth = 1.4,
  anchorX = 0,
  leftEdgeX = 0,
  crossingYs,
  docTop = 0,
}: RoadmapVineProps) {
  // Scroll progress: shared 0→1 (vineRatio=1 so this equals sharedPathProgress)
  const rawScrollYProgress = useTransform(
    [sharedPathProgress, sharedVineRatio],
    ([p, r]: number[]) => r > 0 ? Math.max(0, Math.min(1, p / r)) : 0
  );

  // Smooth out sudden jumps (e.g. from lazy-loaded photos shifting layout
  // mid-scroll and reshuffling the progress range) instead of teleporting.
  const scrollYProgress = useSpring(rawScrollYProgress, { stiffness: 300, damping: 40, mass: 0.5 });

  const seg = Math.max(1, Math.round(segments));
  const axis = widthPx / 2;
  const amp = WINDING_AMPLITUDE_RATIO * widthPx;
  const stepY = heightPx / seg; // used only as uniform fallback
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Crossing points: [0, ...card centers, heightPx] — non-uniform when crossingYs given.
  const points =
    crossingYs && crossingYs.length > 0
      ? [0, ...crossingYs, heightPx]
      : Array.from({ length: seg + 1 }, (_, i) => i * stepY);

  // Typical inter-node spacing — the curl steepness we want every segment to
  // match. (points[2]-points[1] is the gap between the first two card centers.)
  const refH = points.length > 3 ? points[2] - points[1] : heightPx;

  // Dynamically calculate the exact ratio of the fall-in path length to the total path length
  // so we know exactly when the comet reaches the first flower node.
  const y1_calc = points[1] ?? heightPx;
  const straightEnd_calc = lerp(anchorX, axis, 0.7);
  const cp1X_calc = lerp(straightEnd_calc, axis, 0.6);
  const y2_calc = points[2] ?? (y1_calc + refH);
  const firstSegH_calc = y2_calc - y1_calc;
  const firstSegAmp_calc = amp * Math.min(1, firstSegH_calc / refH);
  const targetCp2X_calc = axis - firstSegAmp_calc;
  const targetCp2Y_calc = y1_calc - firstSegH_calc * 0.25;

  const bezLen = 
    Math.abs(cp1X_calc - straightEnd_calc) + 
    Math.hypot(targetCp2X_calc - cp1X_calc, targetCp2Y_calc - 0) + 
    Math.hypot(axis - targetCp2X_calc, y1_calc - targetCp2Y_calc);
  const lFallIn = Math.abs(anchorX - straightEnd_calc) + bezLen * 0.95; // 0.95 factor for bezier shortening

  let lRest = 0;
  for (let i = 2; i < points.length; i++) {
    const y0 = points[i - 1];
    const yy = points[i];
    const segH = yy - y0;
    const segAmp = amp * Math.min(1, segH / refH);
    const sLen = 2 * Math.hypot(segAmp, segH * 0.25) + segH * 0.5;
    lRest += sLen * 0.95; 
  }

  const R = lFallIn / (lFallIn + lRest || 1);

  // We want the comet to travel faster over the initial broken string section.
  // It reaches `R` (the flower) when scrolled by `swingEndV` (which is faster than 1:1).
  const swingEndV = R * 0.65; 
  
  const cometOffset = useTransform(scrollYProgress, (v) => {
    if (v <= swingEndV) {
      return (v / swingEndV) * R;
    } else {
      return R + ((v - swingEndV) / (1 - swingEndV)) * (1 - R);
    }
  });

  const headLength = useTransform(cometOffset, [0, 1], [0, 0.03]);

  // ONE continuous stroke = the snapped string + the lit road.
  // The string is anchored at the right (anchorX). When broken, the left end (leftEdgeX,0)
  // swings down into the center axis as the user scrolls.
  const dDynamic = useTransform(scrollYProgress, (v) => {
    const y1 = points[1] ?? heightPx;
    const t = Math.min(1, v / swingEndV);
    let path = `M ${anchorX} 0`;
    const straightEnd = lerp(anchorX, axis, 0.7);
    path += ` L ${straightEnd} 0`;
    const endX = lerp(leftEdgeX, axis, t);
    const endY = lerp(0, y1, t);
    const cp1X = lerp(lerp(straightEnd, leftEdgeX, 0.5), lerp(straightEnd, axis, 0.6), t);
    const cp1Y = 0; // Fixed to 0 to keep the tangent perfectly horizontal and avoid sharp corners

    // To ensure perfect tangent continuity at the connection point (axis, y1),
    // cp2 must mirror the first control point of the outgoing segment.
    // The outgoing segment (i=2) bulges right to `axis + firstSegAmp`.
    const y2 = points[2] ?? (y1 + refH);
    const firstSegH = y2 - y1;
    const firstSegAmp = amp * Math.min(1, firstSegH / refH);
    const targetCp2X = axis - firstSegAmp;
    const targetCp2Y = y1 - firstSegH * 0.25;

    const cp2X = lerp(leftEdgeX, targetCp2X, t);
    const cp2Y = lerp(0, targetCp2Y, t);
    
    path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    for (let i = 2; i < points.length; i++) {
      const y0 = points[i - 1];
      const yy = points[i];
      const segH = yy - y0;
      const segAmp = amp * Math.min(1, segH / refH);
      const bulge = i % 2 === 1 ? axis - segAmp : axis + segAmp;
      path += ` C ${bulge} ${y0 + segH * 0.25}, ${bulge} ${yy - segH * 0.25}, ${axis} ${yy}`;
    }
    return path;
  });

  // The fall-in segment alone (this will be 100% visible immediately so we can see it swing)
  const dFallIn = useTransform(scrollYProgress, (v) => {
    const y1 = points[1] ?? heightPx;
    const t = Math.min(1, v / swingEndV);
    let path = `M ${anchorX} 0`;
    const straightEnd = lerp(anchorX, axis, 0.7);
    path += ` L ${straightEnd} 0`;
    const endX = lerp(leftEdgeX, axis, t);
    const endY = lerp(0, y1, t);
    const cp1X = lerp(lerp(straightEnd, leftEdgeX, 0.5), lerp(straightEnd, axis, 0.6), t);
    const cp1Y = 0; // Fixed to 0 to keep the tangent perfectly horizontal and avoid sharp corners

    // Mirror the outgoing tangent for a perfectly smooth connection
    const y2 = points[2] ?? (y1 + refH);
    const firstSegH = y2 - y1;
    const firstSegAmp = amp * Math.min(1, firstSegH / refH);
    const targetCp2X = axis - firstSegAmp;
    const targetCp2Y = y1 - firstSegH * 0.25;

    const cp2X = lerp(leftEdgeX, targetCp2X, t);
    const cp2Y = lerp(0, targetCp2Y, t);

    path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    return path;
  });

  // The rest of the timeline vine (this pays out only after the swing is done)
  const buildRest = () => {
    const y1 = points[1] ?? heightPx;
    let path = `M ${axis} ${y1}`;
    for (let i = 2; i < points.length; i++) {
      const y0 = points[i - 1];
      const yy = points[i];
      const segH = yy - y0;
      const segAmp = amp * Math.min(1, segH / refH);
      const bulge = i % 2 === 1 ? axis - segAmp : axis + segAmp;
      path += ` C ${bulge} ${y0 + segH * 0.25}, ${bulge} ${yy - segH * 0.25}, ${axis} ${yy}`;
    }
    return path;
  };
  const dRest = buildRest();

  const restPathLength = useTransform(cometOffset, (v) => Math.max(0, (v - R) / (1 - R)));

  // Publish where the lit line's leading edge is on the page, so each flower
  // can bloom the moment the line reaches it. Measured on the real path
  // geometry (a detached <path> holding the current `d`), not estimated.
  const probe = useRef<SVGPathElement | null>(null);
  const frame = useRef(0);
  const measureHead = () => {
    if (!probe.current) {
      probe.current = document.createElementNS("http://www.w3.org/2000/svg", "path");
    }
    const el = probe.current;
    el.setAttribute("d", dDynamic.get());
    const total = el.getTotalLength();
    if (!total) return;
    const frac = Math.min(1, cometOffset.get() + headLength.get());
    cometHeadY.set(docTop + el.getPointAtLength(frac * total).y);
  };
  // Deferred to the next frame (and coalesced): the value can change while
  // React is rendering, and flowers re-render in response to it.
  const publishHead = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      measureHead();
    });
  };
  useMotionValueEvent(cometOffset, "change", publishHead);
  useEffect(() => {
    publishHead();
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      cometHeadY.set(-1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docTop, heightPx, widthPx, crossingYs]);

  return (
    <div aria-hidden className="pointer-events-none w-full" style={{ height: heightPx }}>
      <svg
        viewBox={`0 0 ${widthPx} ${heightPx}`}
        width={widthPx}
        height={heightPx}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="vine-gold-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2={heightPx}>
            <stop offset="0%"   stopColor="var(--color-gold-bright)" />
            <stop offset="50%"  stopColor="var(--color-gold)" />
            <stop offset="100%" stopColor="var(--color-rose)" />
          </linearGradient>
          <linearGradient id="vine-fall-grad" gradientUnits="userSpaceOnUse" x1={leftEdgeX} y1="0" x2={anchorX} y2="0">
            <stop offset="0%" stopColor="var(--color-gold-dim)" />
            <stop offset="50%" stopColor="var(--color-gold-bright)" />
            <stop offset="100%" stopColor="var(--color-gold)" />
          </linearGradient>
        </defs>

        {/* Fall-In section - ALWAYS fully drawn so the string physics works without disappearing */}
        <motion.path
          d={dFallIn}
          fill="none"
          stroke={GREY}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <motion.path
          d={dFallIn}
          fill="none"
          stroke="url(#vine-fall-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 2px rgba(201,162,75,0.35))" }}
        />

        {/* Rest of the vine - pays out only after the string has fully swung into the center */}
        <motion.path
          d={dRest}
          fill="none"
          stroke={GREY}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{ pathLength: restPathLength }}
        />
        <motion.path
          d={dRest}
          fill="none"
          stroke="url(#vine-gold-grad)"
          strokeWidth={strokeWidth + 0.6}
          strokeLinecap="round"
          style={{ pathLength: restPathLength }}
        />

        {/* Bright comet at the leading edge traverses the unified path seamlessly */}
        <motion.path
          d={dDynamic}
          fill="none"
          stroke="var(--color-gold-bright)"
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
          style={{ pathLength: headLength, pathOffset: cometOffset }}
          className="drop-shadow-[0_0_8px_var(--color-gold-bright)]"
        />
      </svg>
    </div>
  );
}
