"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";

/* =========================================================================
   LOGO ORIGIN
   Where the logo comes from: two hands make the OK sign, palms facing each
   other, rings facing the viewer, the other three fingers held together and
   pointing up. The hands slide together until the two rings overlap into one,
   then the fingers lean in until their tips meet — an open triangle standing
   on a ring. The hand details fade away and the logo is left behind.

   Final-pose geometry is the favicon (app/icon.svg) scaled x6.25, so the last
   frame is the logo exactly.
   ========================================================================= */

const C = { x: 200, y: 262.5 }; // ring centre
const R = 78.1; // ring radius (stroke centre)
const W = 21.25; // ring stroke
const K = { x: 121.2, y: 252.4 }; // knuckle: pivot of the finger bar
const LEG = 211.4; // knuckle → apex
const LEG_W = 23.75; // finger bar stroke in the logo
const ANGLE = 21.88; // finger bar tilt from vertical in the logo
const SPREAD = 118; // how far apart the hands start

const OUTLINE = "#2b2d33";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
const pt = (deg: number, r = R) => {
  const a = (deg * Math.PI) / 180;
  return `${(C.x + Math.cos(a) * r).toFixed(2)} ${(C.y + Math.sin(a) * r).toFixed(2)}`;
};

/** Short radial tick across the ring band — a knuckle crease. */
function Crease({ deg, opacity }: { deg: number; opacity: number }) {
  return (
    <path
      d={`M${pt(deg, R - W / 2 + 3)} L${pt(deg, R + W / 2 - 3)}`}
      stroke={OUTLINE}
      strokeWidth="1.6"
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

/** Palm, wrist, cuff and the thumb/index ring — everything but the three
 *  raised fingers. Drawn for the viewer's LEFT hand in its final pose. */
function HandBase({ silver, detail }: { silver: string; detail: number }) {
  // The ring of the OK sign: index finger over the top, thumb underneath,
  // tips meeting on the far side.
  const index = `M${pt(190)} A${R} ${R} 0 1 1 ${pt(20)}`;
  const thumb = `M${pt(140)} A${R} ${R} 0 0 0 ${pt(20)}`;
  return (
    <g>
      {/* jacket sleeve + shirt cuff */}
      <g opacity={detail}>
        <path d="M74 400 L182 400 L150 520 L18 520 Z" fill="#141418" stroke="#2e2e36" strokeWidth="2" />
        <rect x="84" y="384" width="92" height="18" rx="3" fill={silver} stroke={OUTLINE} strokeWidth="2" />
      </g>
      {/* palm seen from the side, thumb mound meeting the ring */}
      <path
        d={`M111.5 258 C 98 290, 94 330, 100 362 L 100 390 L 162 390 C 166 372, 160 350, 140.2 327.8 A ${R + W / 2} ${R + W / 2} 0 0 1 111.5 258 Z`}
        fill={silver}
        stroke={OUTLINE}
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity={detail}
      />
      <path
        d="M146 338 C 138 352, 128 364, 116 370"
        fill="none"
        stroke={OUTLINE}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={detail * 0.6}
      />

      {/* the ring the logo keeps */}
      <circle cx={C.x} cy={C.y} r={R} fill="none" stroke={silver} strokeWidth={W} />

      {/* finger detail on top of the ring: outlines, creases, touching tips */}
      <g opacity={detail}>
        <path d={thumb} fill="none" stroke={OUTLINE} strokeWidth={W + 3} strokeLinecap="round" />
        <path d={thumb} fill="none" stroke={silver} strokeWidth={W - 1} strokeLinecap="round" />
        <path d={index} fill="none" stroke={OUTLINE} strokeWidth={W + 3} strokeLinecap="round" />
        <path d={index} fill="none" stroke={silver} strokeWidth={W - 1} strokeLinecap="round" />
        <Crease deg={235} opacity={0.7} />
        <Crease deg={290} opacity={0.7} />
        <Crease deg={345} opacity={0.7} />
        <Crease deg={95} opacity={0.7} />
      </g>
    </g>
  );
}

/** Middle, ring and little finger held together. They start as three
 *  outlined fingers and merge into the single bar of the logo. */
function HandFingers({
  silver,
  rotate,
  merge,
  shadow,
}: {
  silver: string;
  rotate: number;
  merge: number;
  shadow: string | undefined;
}) {
  const fingers = [
    { x: -31, len: 172 }, // little finger (outermost, shortest)
    { x: -16, len: 196 }, // ring finger
    { x: 0, len: LEG }, // middle finger — its tip becomes the apex
  ];
  const fw = lerp(15.5, LEG_W, merge);
  const detail = 1 - merge;
  return (
    <g transform={`translate(${K.x} ${K.y}) rotate(${ANGLE + rotate})`} filter={shadow}>
      {fingers.map((f, i) => {
        const x = f.x * (1 - merge);
        const len = lerp(f.len, LEG, merge);
        return (
          <g key={i}>
            <line x1={x} y1={10 * detail} x2={x} y2={-len} stroke={OUTLINE} strokeWidth={fw + 3.5} strokeLinecap="round" opacity={detail} />
            <line x1={x} y1={10 * detail} x2={x} y2={-len} stroke={silver} strokeWidth={fw} strokeLinecap="round" />
            {[0.34, 0.62].map((k) => (
              <line
                key={k}
                x1={x - fw / 2 + 2.5}
                x2={x + fw / 2 - 2.5}
                y1={-len * k}
                y2={-len * k}
                stroke={OUTLINE}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={detail * 0.7}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}

/** The artwork at a given progress t (0 → 1). */
export function LogoOriginFrame({ t, className }: { t: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const silverId = `lo-silver-${uid}`;
  const shadowId = `lo-shadow-${uid}`;
  const silver = `url(#${silverId})`;

  const appear = ease(seg(t, 0.0, 0.14));
  const slide = ease(seg(t, 0.12, 0.56));
  const bend = ease(seg(t, 0.44, 0.74));
  const settle = ease(seg(t, 0.74, 0.94));

  const dx = -SPREAD * (1 - slide);
  const dy = (1 - appear) * 24;
  const rotate = -ANGLE * (1 - bend);
  const shadow = settle > 0.5 ? `url(#${shadowId})` : undefined;

  const hand = (part: "base" | "fingers") => (
    <g transform={`translate(${dx} ${dy})`} opacity={appear}>
      {part === "base" ? (
        <HandBase silver={silver} detail={1 - settle} />
      ) : (
        <HandFingers silver={silver} rotate={rotate} merge={settle} shadow={shadow} />
      )}
    </g>
  );
  const mirrored = (part: "base" | "fingers") => (
    <g transform="translate(400 0) scale(-1 1)">{hand(part)}</g>
  );

  return (
    <svg viewBox="-50 20 500 450" className={className} role="img" aria-label="Kamer Can logo origin">
      <defs>
        <linearGradient id={silverId} gradientUnits="userSpaceOnUse" x1="60" y1="40" x2="340" y2="420">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#d9dbe0" />
          <stop offset="1" stopColor="#9ea2aa" />
        </linearGradient>
        <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity="0.9" />
        </filter>
      </defs>
      {/* Both bases first, then both finger sets, so each finger bar sits on
          top of the ring exactly like the logo. */}
      {hand("base")}
      {mirrored("base")}
      {hand("fingers")}
      {mirrored("fingers")}
    </svg>
  );
}

/** Plays the animation once it scrolls into view; click to replay. */
export default function LogoOrigin({ className }: { className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const t = useMotionValue(0);
  const [frame, setFrame] = useState(0);
  useMotionValueEvent(t, "change", setFrame);

  const play = () => {
    t.set(0);
    return animate(t, 1, { duration: 4.2, ease: "linear" });
  };

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      t.set(1);
      return;
    }
    const controls = play();
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => play()}
      className={`block cursor-pointer ${className ?? ""}`}
      aria-label="Replay logo animation"
    >
      <LogoOriginFrame t={frame} className="h-full w-full" />
    </button>
  );
}
