"use client";

import {
  motion,
  useSpring,
  useTransform,
  cubicBezier,
  type MotionValue,
} from "framer-motion";

/* =========================================================================
   GRAND DOORS
   Code-drawn replacement for the old door video. The leaves are CSS/SVG, so
   they stay sharp at any resolution and scrub continuously with scroll.

   Two matte plaster leaves slide apart to the left and right as you scroll,
   each carrying its own rose garland along the outer edge. The leaves are
   mirror images and meet flush side by side; every piece of hardware belongs
   to exactly ONE leaf (the keyhole plate lives on the right leaf), so nothing
   is cut in half or duplicated as the doors part.
   ========================================================================= */

const easeDoor = cubicBezier(0.65, 0, 0.35, 1);

const svgUrl = (body: string, w: number, h: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`,
  )}")`;

// Matte plaster: soft mottling + fine grain on a dark graphite base.
const MOTTLE = svgUrl(
  `<filter id='m'><feTurbulence type='fractalNoise' baseFrequency='0.004 0.006' numOctaves='5' seed='4'/>` +
    `<feColorMatrix type='matrix' values='0 0 0 0 0.75 0 0 0 0 0.74 0 0 0 0 0.72 0.55 0 0 0 -0.22'/></filter>` +
    `<rect width='100%' height='100%' filter='url(#m)'/>`,
  900,
  1600,
);

const GRAIN = svgUrl(
  `<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
    `<feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/></filter>` +
    `<rect width='100%' height='100%' filter='url(#g)'/>`,
  240,
  240,
);

const PLASTER = [
  GRAIN,
  MOTTLE,
  "linear-gradient(180deg,#232327 0%,#1b1b1f 55%,#141417 100%)",
].join(",");

// Muted, brushed bronze — low saturation so it reads as metal, not bling.
const BRONZE =
  "linear-gradient(90deg,#3b3326 0%,#6f624b 30%,#a4957a 50%,#6f624b 70%,#3b3326 100%)";

/** Recessed V-groove rectangle (no molding, just a cut in the plaster). */
function Groove({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute"
      style={{
        ...style,
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.55), inset 1px 1px 0 1px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.045)",
      }}
    />
  );
}

/** Slim vertical pull bar on two standoffs. */
function PullBar({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="absolute"
      style={{
        top: "50%",
        [side === "left" ? "right" : "left"]: "6.5vmin",
        height: "34vmin",
        width: "1.3vmin",
        transform: "translateY(-50%)",
      }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className="absolute left-1/2"
          style={{
            [i ? "bottom" : "top"]: "3vmin",
            width: "0.9vmin",
            height: "1.4vmin",
            transform: "translateX(-50%)",
            background: "#2b261d",
            boxShadow: "0 0.6vmin 0.8vmin rgba(0,0,0,0.6)",
          }}
        />
      ))}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: BRONZE,
          boxShadow: "0.3vmin 1vmin 1.6vmin rgba(0,0,0,0.55)",
        }}
      />
    </div>
  );
}

function Leaf({ side, x }: { side: "left" | "right"; x: MotionValue<string> }) {
  const left = side === "left";
  return (
    <motion.div
      className="absolute top-0 h-full w-1/2"
      style={{ [left ? "left" : "right"]: 0, x }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: PLASTER,
            backgroundSize: "cover",
            transform: left ? undefined : "scaleX(-1)",
          }}
        />
        {/* Soft light falloff toward the outer edge and floor. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${left ? "90deg" : "270deg"}, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 45%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 100%)`,
          }}
        />

        <Groove style={{ left: "12%", right: "12%", top: "8%", height: "52%" }} />
        <Groove style={{ left: "12%", right: "12%", top: "66%", height: "26%" }} />

        {/* Rose garland hugging the outer edge. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={left ? "/intro/roses-left.webp" : "/intro/roses-right.webp"}
          alt=""
          draggable={false}
          className="absolute top-0 h-full w-auto max-w-none select-none"
          style={{ [left ? "left" : "right"]: 0 }}
        />
      </div>

      <PullBar side={side} />

      {!left && (
        /* Keyhole plate — right leaf only. */
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: "calc(50% + 21vmin)",
              left: "6.5vmin",
              width: "2.6vmin",
              height: "4.4vmin",
              transform: "translateX(-50%)",
              background: BRONZE,
              borderRadius: "0.4vmin",
              boxShadow: "0 0.6vmin 1vmin rgba(0,0,0,0.5)",
            }}
          >
            <svg viewBox="0 0 10 16" style={{ width: "0.9vmin", height: "1.5vmin" }} aria-hidden>
              <circle cx="5" cy="5" r="3" fill="#121110" />
              <path d="M3.6 6.5 H6.4 L7.2 14 H2.8 Z" fill="#121110" />
            </svg>
          </div>
      )}

      {/* Identical bevel on both inner edges, so the leaves meet flush. */}
      <div
        className="absolute top-0 h-full"
        style={{
          [left ? "right" : "left"]: 0,
          width: "0.35vmin",
          background: `linear-gradient(${left ? "90deg" : "270deg"}, rgba(255,255,255,0.06), rgba(0,0,0,0.75))`,
        }}
      />
    </motion.div>
  );
}

/** Shadow a leaf casts into the widening gap. Rendered BEHIND both leaves,
 *  so while the doors are closed it is hidden instead of darkening the other
 *  leaf (which made one door look stacked on top of the other). */
function GapShadow({ side, x }: { side: "left" | "right"; x: MotionValue<string> }) {
  const left = side === "left";
  return (
    <motion.div
      className="absolute top-0 h-full w-1/2"
      style={{ [left ? "left" : "right"]: 0, x }}
    >
      <div
        className="absolute top-0 h-full"
        style={{
          [left ? "left" : "right"]: "100%",
          width: "5vmin",
          background: `linear-gradient(${left ? "90deg" : "270deg"}, rgba(0,0,0,0.5), transparent)`,
        }}
      />
    </motion.div>
  );
}

export default function GrandDoors({
  progress,
  scrubEnd,
}: {
  progress: MotionValue<number>;
  scrubEnd: number;
}) {
  const smooth = useSpring(progress, { stiffness: 140, damping: 30, mass: 0.35 });
  const p = useTransform(smooth, (v) => Math.min(Math.max(v / scrubEnd, 0), 1));

  // 105% so the gap shadows also leave the screen.
  const leftX = useTransform(p, [0, 1], ["0%", "-105%"], { ease: easeDoor });
  const rightX = useTransform(p, [0, 1], ["0%", "105%"], { ease: easeDoor });
  const display = useTransform(p, (v) => (v >= 1 ? "none" : "block"));

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      style={{ display }}
    >
      <GapShadow side="left" x={leftX} />
      <GapShadow side="right" x={rightX} />
      <Leaf side="left" x={leftX} />
      <Leaf side="right" x={rightX} />
    </motion.div>
  );
}
