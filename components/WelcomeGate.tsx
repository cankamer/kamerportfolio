"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ProfileCard from "@/components/ui/ProfileCard";
import GlassSurface from "@/components/ui/GlassSurface";

function Starfield() {
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

    const COUNT = 260;
    const stars = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
      // depth 0 = far (moves less), 1 = close (moves more)
      depth: Math.random(),
    }));

    // Smoothed mouse offset
    const mouse = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / W - 0.5) * 2; // -1 → 1
      mouse.y = (e.clientY / H - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const draw = (t: number) => {
      // Lerp toward target mouse position
      smooth.x += (mouse.x - smooth.x) * 0.06;
      smooth.y += (mouse.y - smooth.y) * 0.06;

      ctx.clearRect(0, 0, W, H);

      for (const s of stars) {
        const alpha = 0.45 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
        // Parallax: deeper stars move less
        const strength = 28 * s.depth;
        const px = s.x + smooth.x * strength;
        const py = s.y + smooth.y * strength;

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 248, 230, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
    />
  );
}

function LiquidButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <GlassSurface
      width={160}
      height={44}
      borderRadius={22}
      backgroundOpacity={0.12}
      saturation={1.6}
      distortionScale={-90}
      redOffset={0}
      greenOffset={0}
      blueOffset={0}
      className="border border-white/20 transition-[border-color] duration-300 hover:border-white/45"
    >
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full items-center justify-center font-sans text-xs uppercase tracking-wide text-white/60 transition-colors hover:text-white"
      >
        {label}
      </button>
    </GlassSurface>
  );
}

export default function WelcomeGate() {
  const { d } = useLocale();
  const [visible, setVisible] = useState(true);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (gone) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [gone]);

  if (gone) return null;

  return (
    <AnimatePresence onExitComplete={() => setGone(true)}>
      {visible && (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <Starfield />

          {/* Welcome label above the card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-3 text-center"
          >
            <span
              className="h-px w-10 sm:w-16"
              style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.3))" }}
            />
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-white/40">
              {d.gate.welcome}
            </p>
            <span
              className="h-px w-10 sm:w-16"
              style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.3))" }}
            />
          </motion.div>

          {/* ProfileCard */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProfileCard
              name="Kamer Can"
              title={d.hero.eyebrow}
              handle="kamercan"
              status={d.gate.available}
              contactText={d.gate.diveIn}
              avatarUrl="/photos/avatar.png"
              showUserInfo={false}
              enableTilt={true}
              enableMobileTilt={false}
              behindGlowEnabled={true}
              behindGlowColor="rgba(200, 200, 200, 0.35)"
              behindGlowSize="55%"
              innerGradient="linear-gradient(145deg, rgba(5,5,5,0.98) 0%, rgba(40,40,40,0.12) 55%, rgba(0,0,0,0.99) 100%)"
            />
          </motion.div>

          {/* Dive In — liquid button */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <LiquidButton label={d.gate.diveIn} onClick={() => setVisible(false)} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
