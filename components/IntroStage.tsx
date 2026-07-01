"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Hero from "@/components/hero/Hero";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { stringBroken } from "@/lib/sharedPath";

/* =========================================================================
   INTRO STAGE
   The first page (Hero) and the scroll-bound door video share ONE screen.

   • The Hero is pinned (sticky) as the BACKGROUND.
   • The door video — encoded with a real alpha channel (VP9/WebM), so the
     chroma-keyed-out areas are genuinely transparent — sits on TOP. Through the
     opening doors / keyholes you see the pinned Hero behind.
   • Scrolling scrubs the clip: the doors swing open as you scroll. By the last
     frame the doors are fully gone (fully transparent) → the Hero stands alone.
   • Once the stage's scroll budget is spent the sticky releases and the Hero
     scrolls away normally into the timeline.

   The webm is encoded all-keyframe so seeking to any currentTime is instant.
   ========================================================================= */

// Total stage height. The first 100vh is the visible screen; the rest is the
// scroll budget over which the doors scrub open.
const STAGE_VH = 300;

// Fraction of the pinned scroll over which the doors finish opening. The doors
// are fully open by this point; the REMAINING pinned scroll (this → 1.0) is a
// "dwell" zone where the Hero stands alone, fully interactive — you can pluck
// the strings here before scrolling further snaps them into the timeline.
const VIDEO_SCRUB_END = 0.6;

export default function IntroStage() {
  const { d } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  // 0 when the stage top hits the viewport top; 1 once the scroll budget is
  // spent (sticky about to release).
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });

  // The scroll cue fades out as soon as the doors start moving.
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // Lock interaction with the first page (Hero) until the doors have fully
  // opened (the scrub end). Until then an invisible layer swallows all pointer
  // events so the guitar strings behind can't be plucked while the doors are
  // still closing. Once open — during the dwell — the Hero is interactive.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    return scrollYProgress.on("change", (v) => setRevealed(v >= VIDEO_SCRUB_END));
  }, [scrollYProgress]);

  // Prime the decoder: a paused video that has never played won't repaint on a
  // currentTime seek in many browsers. A muted play()→pause() warms it up.
  function prime(video: HTMLVideoElement) {
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        video.pause();
        video.currentTime = 0;
      }).catch(() => {
        /* autoplay blocked — seeks still usually paint once data is ready */
      });
    }
  }

  // Drive video.currentTime from scroll, smoothed with a per-frame lerp.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let current = video.currentTime;

    const tick = () => {
      const dur = duration || video.duration || 0;
      if (dur && video.readyState >= 2) {
        // Map only the first VIDEO_SCRUB_END of the pinned scroll to the clip;
        // past that the doors are fully open and the video holds its last frame.
        const p = Math.min(scrollYProgress.get() / VIDEO_SCRUB_END, 1);
        const target = p * dur;
        current += (target - current) * 0.18;
        if (Math.abs(target - current) < 0.001) current = target;
        if (!video.seeking) {
          try {
            video.currentTime = current;
          } catch {
            /* not seekable yet — ignore */
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, scrollYProgress]);

  return (
    <section ref={stageRef} className="relative" style={{ height: `${STAGE_VH}vh` }}>
      {/* Pinned screen: Hero behind, transparent door video in front. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background — the actual first page */}
        <Hero />

        {/* Interaction lock — swallows pointer events on the Hero until the
            doors have fully opened. Lets wheel/touch SCROLL through (scrolling
            drives the doors) but blocks clicks/hover on the strings beneath. */}
        {!revealed && (
          <div aria-hidden className="absolute inset-0 z-20" />
        )}

        {/* Foreground — alpha door video; transparent areas reveal the Hero.
            pointer-events-none so it never blocks the page once revealed. */}
        <video
          ref={videoRef}
          className="pointer-events-none absolute inset-0 z-30 h-full w-full object-cover"
          src="/kamerportfolio.webm"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onLoadedData={(e) => prime(e.currentTarget)}
        />

        {/* Rose petals — fall from cursor while scrolling, stop once doors open */}
        <RosePetalCanvas scrollYProgress={scrollYProgress} />

        {/* Scroll cue — fades out as the doors begin to open */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-12 z-40 flex flex-col items-center gap-2 text-center"
        >
          <span className="font-sans text-[10px] uppercase tracking-[0.4em] text-ivory/80">
            {d.intro.scrollCue}
          </span>
          <motion.span
            aria-hidden
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-px bg-gradient-to-b from-gold to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* =========================================================================
   ROSE PETAL CANVAS
   While the user scrolls through the intro (before doors fully open),
   rose petals fall from the cursor position.
   ========================================================================= */

const PETAL_COLORS = ["#7a1230", "#991840", "#5e0e24", "#b01e38", "#6e0a20", "#8c1228"];

type Petal = {
  x: number; y: number;
  vx: number; vy: number;
  rot: number; rotV: number;
  opacity: number; decay: number;
  w: number; h: number;
  color: string;
};

function drawPetalShape(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = Math.max(0, p.opacity);
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, -p.h / 2);
  ctx.bezierCurveTo( p.w / 2, -p.h / 2,  p.w / 2,  p.h / 2, 0,  p.h / 2);
  ctx.bezierCurveTo(-p.w / 2,  p.h / 2, -p.w / 2, -p.h / 2, 0, -p.h / 2);
  ctx.fill();
  ctx.restore();
}

function RosePetalCanvas({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: W / 2, y: H / 2 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const petals: Petal[] = [];

    const spawn = () => {
      const progress = scrollYProgress.get();
      // Start near end of video (≥0.5), stop once string snaps
      if (progress < 0.5) return;
      if (stringBroken.get()) return;

      if (Math.random() > 0.4) return;
      const count = 1;
      for (let i = 0; i < count; i++) {
        petals.push({
          x: mouse.x + (Math.random() - 0.5) * 24,
          y: mouse.y + (Math.random() - 0.5) * 24,
          vx: (Math.random() - 0.5) * 2,
          vy: 0.8 + Math.random() * 1.8,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.1,
          opacity: 0.7 + Math.random() * 0.3,
          decay: 0.006 + Math.random() * 0.005,
          w: 9 + Math.random() * 9,
          h: 6 + Math.random() * 7,
          color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        });
      }
    };

    const onScroll = () => spawn();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Also stop immediately when string breaks
    const unsubBroken = stringBroken.on("change", (broken) => {
      if (broken) {
        // Let existing petals finish falling but spawn no more — handled by spawn() guard
      }
    });

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.045;                        // gravity
        p.vx += Math.sin(p.rot * 0.5) * 0.018; // gentle side drift
        p.rot += p.rotV;
        p.opacity -= p.decay;
        if (p.opacity <= 0 || p.y > H + 30) { petals.splice(i, 1); continue; }
        drawPetalShape(ctx, p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      unsubBroken();
    };
  }, [scrollYProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-35"
    />
  );
}
