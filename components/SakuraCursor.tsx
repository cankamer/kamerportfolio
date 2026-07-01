"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle velvet rose petals shed when the guitar strings are strummed.
 *
 * GuitarString dispatches a "sakura-pluck" event (with the touch point and
 * strum intensity); each one releases a small burst of rose petals — in the
 * site's deep-rose / gül kırmızısı palette — that drift down, sway, spin and
 * fade out. Nothing spawns on plain cursor movement, and the whole thing
 * yields to `prefers-reduced-motion`.
 */
export default function SakuraCursor() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // Respect reduced-motion (works on both mouse + touch otherwise).
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Velvet rose tones, matched to the site's baroque palette
    // (deep rose, gül kırmızısı, with a couple of lighter blush highlights).
    const palette: [string, string][] = [
      ["#8b1e3f", "#4a0f22"], // deep rose → near-black wine
      ["#7a1733", "#3a0a1b"],
      ["#9c2347", "#52102a"],
      ["#6a1029", "#2e0714"],
    ];

    // A single rose petal: broad rounded fan at the top (with a soft cusp in the
    // centre), tapering to a point at the base (50,92), in a 100×100 box.
    const PETAL =
      "M50,92 C24,78 18,40 30,16 C38,2 46,10 50,18 C54,10 62,2 70,16 C82,40 76,78 50,92 Z";

    let gradId = 0;
    // Build a shaded rose-petal SVG (deeper at the base, lighter toward the tip).
    const petalSvg = ([light, dark]: [string, string]) => {
      const id = `rp${gradId++}`;
      return `<svg viewBox="0 0 100 100" width="100%" height="100%" style="display:block">
        <defs>
          <linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="${dark}"/>
            <stop offset="100%" stop-color="${light}"/>
          </linearGradient>
        </defs>
        <path d="${PETAL}" fill="url(#${id})"/>
        <path d="M50,90 C40,70 40,40 48,20" fill="none"
              stroke="${dark}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      </svg>`;
    };

    const spawn = (x: number, y: number) => {
      const petal = document.createElement("span");
      const size = 10 + Math.random() * 10; // 10–20px petal
      const drift = (Math.random() - 0.5) * 120; // horizontal sway
      const fall = 60 + Math.random() * 90; // downward travel
      const spin = (Math.random() - 0.5) * 540; // degrees
      const duration = 2200 + Math.random() * 1400;
      const color = palette[(Math.random() * palette.length) | 0];

      petal.innerHTML = petalSvg(color);
      petal.style.cssText = `
        position:absolute;
        left:${x}px;
        top:${y}px;
        width:${size}px;
        height:${size}px;
        opacity:0;
        will-change:transform,opacity;
        transform:translate(-50%,-50%) rotate(${Math.random() * 360}deg);
        filter:drop-shadow(0 1px 2px rgba(94,15,40,0.45));
      `;

      petal.animate(
        [
          { transform: `translate(-50%,-50%) rotate(0deg)`, opacity: 0 },
          { opacity: 0.85, offset: 0.15 },
          {
            transform: `translate(calc(-50% + ${drift}px), calc(-50% + ${fall}px)) rotate(${spin}deg)`,
            opacity: 0,
          },
        ],
        { duration, easing: "cubic-bezier(0.25,0.6,0.3,1)", fill: "forwards" }
      );

      layer.appendChild(petal);
      window.setTimeout(() => petal.remove(), duration + 50);
    };

    // Petals are shed only when a guitar string is strummed (GuitarString
    // dispatches "sakura-pluck" with the touch point + intensity).
    const onPluck = (e: Event) => {
      const { x, y, intensity = 0.8 } = (e as CustomEvent).detail ?? {};
      if (x == null || y == null) return;
      // A sparse shed around the pluck point — 1 petal, occasionally 2 on a hard hit.
      const count = 1 + (intensity > 0.9 && Math.random() < 0.5 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const ox = (Math.random() - 0.5) * 24;
        const oy = (Math.random() - 0.5) * 24;
        spawn(x + ox, y + oy);
      }
    };

    window.addEventListener("sakura-pluck", onPluck);
    return () => window.removeEventListener("sakura-pluck", onPluck);
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    />
  );
}
