"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export interface Invader {
  col: number;
  row: number;
  level: number; // 1–4 (green intensity)
}

/** GitHub green ramp (index 0 unused here — only lit cells become invaders). */
const GREEN = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

const PLAY_H = 320;
/** Cells this level or above are "busy days" — they take two hits to destroy. */
const TOUGH_LEVEL = 3;

/**
 * GitHub Space Shooter — the contribution squares lift off as a fleet of green
 * invaders. Move with ← → (or A/D / mouse), fire with Space / click. Busy days
 * (high contribution count) take two hits. Clear them all to win.
 */
export default function SpaceShooter({
  invaders,
  cols,
}: {
  invaders: Invader[];
  cols: number;
}) {
  const { d } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cleared, setCleared] = useState(false);
  const [lost, setLost] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = parent.clientWidth;
    const H = PLAY_H;

    const setSize = () => {
      W = parent.clientWidth;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    // --- Layout the invader grid from the contribution cells ----------------
    const gap = 2;
    const cellW = Math.max(6, Math.min(16, Math.floor((W - 24) / cols) - gap));
    const gridW = cols * (cellW + gap);
    const offX = (W - gridW) / 2;
    const offY = 18;
    const fleet = invaders.map((c) => {
      const maxHp = c.level >= TOUGH_LEVEL ? 2 : 1;
      return {
        level: c.level,
        bx: offX + c.col * (cellW + gap),
        by: offY + c.row * (cellW + gap),
        hp: maxHp,
        maxHp,
        alive: true,
      };
    });

    // --- Entities -----------------------------------------------------------
    const player = { x: W / 2, halfW: 15, y: H - 26, speed: 5 };
    const bullets: { x: number; y: number }[] = [];
    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: Math.random() * 1.4 + 0.3,
    }));
    const keys: Record<string, boolean> = {};
    let driftX = 0;
    let driftY = 0;
    let dir = 1;
    let lastShot = 0;
    let raf = 0;
    let winNotified = false;
    let loseNotified = false;
    // Reaching this line (just above the ship) means the fleet has landed.
    const loseLine = player.y - 12;

    const GAME_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "d"];
    const kd = (e: KeyboardEvent) => {
      if (GAME_KEYS.includes(e.key)) e.preventDefault();
      keys[e.key] = true;
    };
    const ku = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      player.x = Math.min(W - player.halfW, Math.max(player.halfW, e.clientX - r.left));
    };
    const shoot = () => {
      const now = performance.now();
      if (now - lastShot < 170) return;
      lastShot = now;
      bullets.push({ x: player.x, y: player.y - 20 });
    };
    canvas.addEventListener("keydown", kd);
    canvas.addEventListener("keyup", ku);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", shoot);
    canvas.focus();

    const drawShip = (px: number, py: number) => {
      ctx.save();
      ctx.translate(px, py);
      // Engine flame (flickers).
      const f = 5 + Math.random() * 5;
      ctx.fillStyle = "rgba(255,176,64,0.9)";
      ctx.beginPath();
      ctx.moveTo(-3, 2);
      ctx.lineTo(3, 2);
      ctx.lineTo(0, 2 + f);
      ctx.closePath();
      ctx.fill();
      // Swept wings.
      ctx.fillStyle = "#1b7f3b";
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(15, 3);
      ctx.lineTo(6, 3);
      ctx.lineTo(4, 0);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, 3);
      ctx.lineTo(-15, 3);
      ctx.closePath();
      ctx.fill();
      // Bright fuselage.
      ctx.fillStyle = "#39d353";
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(6, 4);
      ctx.lineTo(-6, 4);
      ctx.closePath();
      ctx.fill();
      // Glass cockpit.
      ctx.fillStyle = "rgba(223,255,233,0.95)";
      ctx.beginPath();
      ctx.arc(0, -6, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const over = winNotified || loseNotified;

      // Freeze all motion once the round is decided (overlay takes over).
      if (!over) {
        if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
        if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;
        player.x = Math.min(W - player.halfW, Math.max(player.halfW, player.x));
        if (keys[" "] || keys["ArrowUp"]) shoot();

        driftX += dir * 0.22;
        if (driftX > 16 || driftX < -16) {
          dir *= -1;
          driftY += cellW * 0.4;
        }

        for (const b of bullets) b.y -= 7;
        for (const b of bullets) {
          for (const inv of fleet) {
            if (!inv.alive) continue;
            const ix = inv.bx + driftX;
            const iy = inv.by + driftY;
            if (b.x >= ix && b.x <= ix + cellW && b.y >= iy && b.y <= iy + cellW) {
              inv.hp -= 1;
              if (inv.hp <= 0) inv.alive = false;
              b.y = -999;
              break;
            }
          }
        }
        for (let i = bullets.length - 1; i >= 0; i--) {
          if (bullets[i].y < -12) bullets.splice(i, 1);
        }
      }

      // --- Draw -------------------------------------------------------------
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (const s of stars) {
        s.y += 0.15 * s.s;
        if (s.y > H) s.y = 0;
        ctx.globalAlpha = 0.15 + s.s * 0.2;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      }
      ctx.globalAlpha = 1;

      let remaining = 0;
      let landed = false;
      for (const inv of fleet) {
        if (!inv.alive) continue;
        remaining++;
        const ix = inv.bx + driftX;
        const iy = inv.by + driftY;
        if (iy + cellW >= loseLine) landed = true;
        ctx.fillStyle = GREEN[inv.level] ?? GREEN[4];
        ctx.fillRect(ix, iy, cellW, cellW);
        // Damaged tough cell: scorch mark.
        if (inv.hp < inv.maxHp) {
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.fillRect(ix + cellW * 0.28, iy + cellW * 0.28, cellW * 0.44, cellW * 0.44);
        }
      }

      ctx.fillStyle = "#39d353";
      for (const b of bullets) ctx.fillRect(b.x - 1.5, b.y - 7, 3, 7);

      drawShip(player.x, player.y);

      ctx.fillStyle = "rgba(230,230,210,0.55)";
      ctx.font = "11px monospace";
      ctx.fillText(`enemies: ${remaining}`, 12, H - 10);

      if (remaining === 0 && !winNotified && !loseNotified) {
        winNotified = true;
        setCleared(true);
      } else if (landed && !loseNotified && !winNotified) {
        loseNotified = true;
        setLost(true);
      }
    };
    loop();

    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("keydown", kd);
      canvas.removeEventListener("keyup", ku);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", shoot);
      window.removeEventListener("resize", onResize);
    };
  }, [invaders, cols, resetKey]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        aria-label="GitHub Space Shooter"
        className="w-full cursor-crosshair rounded-md outline-none"
        style={{ height: PLAY_H }}
      />

      {(cleared || lost) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md bg-obsidian/70 backdrop-blur-sm">
          <span
            className={`font-serif text-4xl sm:text-5xl ${
              cleared ? "text-gold-bright" : "text-rose"
            }`}
          >
            {cleared ? d.game.won : d.game.lost}
          </span>
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-ivory-dim">
            {cleared ? d.game.wonNote : d.game.lostNote}
          </span>
          <button
            type="button"
            onClick={() => {
              setCleared(false);
              setLost(false);
              setResetKey((k) => k + 1);
            }}
            className="mt-2 cursor-pointer rounded-full border border-gold/30 px-5 py-1.5 font-sans text-xs uppercase tracking-[0.25em] text-gold transition-colors hover:border-gold/60 hover:text-gold-bright"
          >
            ↻ {d.game.retry}
          </button>
        </div>
      )}
    </div>
  );
}
