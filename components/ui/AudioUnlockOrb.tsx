"use client";

import { motion } from "framer-motion";

/**
 * A small round "liquid glass" orb that sits to the LEFT of the song title.
 * It does NOT control playback — its only job is to draw the eye and invite the
 * visitor's FIRST click on the page, which is what browsers require before any
 * audio (incl. hover-strumming) is allowed to sound.
 *
 * Before that first gesture (`armed = false`) it pulses with ripple rings as a
 * gentle call-to-action; once the page is armed it settles into a calm,
 * inert gold dot.
 */
export default function AudioUnlockOrb({ armed }: { armed: boolean }) {
  return (
    <span className="relative grid h-7 w-7 place-items-center" aria-hidden>
      {/* Expanding ripple rings — only while waiting for the first click */}
      {!armed &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-gold/50"
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.9,
            }}
          />
        ))}

      {/* The glass orb */}
      <motion.span
        className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-full border border-gold/40 bg-obsidian/40 backdrop-blur-md"
        animate={{
          boxShadow: armed
            ? "inset 0 0 4px rgba(201,162,75,0.15)"
            : [
                "0 0 6px rgba(201,162,75,0.25), inset 0 0 4px rgba(201,162,75,0.2)",
                "0 0 16px rgba(201,162,75,0.55), inset 0 0 7px rgba(201,162,75,0.4)",
                "0 0 6px rgba(201,162,75,0.25), inset 0 0 4px rgba(201,162,75,0.2)",
              ],
        }}
        transition={
          armed ? { duration: 0.4 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* Churning liquid fill */}
        <motion.span
          className="absolute -inset-2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, var(--color-gold-bright), transparent 55%), radial-gradient(circle at 70% 70%, var(--color-gold), transparent 60%)",
            filter: "blur(2px)",
          }}
          animate={
            armed
              ? { scale: 1, rotate: 0, opacity: 0.25 }
              : { scale: [1, 1.25, 0.9, 1.15, 1], rotate: [0, 90, 180, 270, 360], opacity: 0.6 }
          }
          transition={
            armed ? { duration: 0.4 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
        />

        {/* Glassy specular highlight */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.35), transparent 45%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Solid gold core */}
        <span className="relative z-10 h-2 w-2 rounded-full bg-gold-bright" />
      </motion.span>
    </span>
  );
}
