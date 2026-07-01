"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Final full-height section — a quiet baroque coda that also gives the page
 * room to scroll past the Hub (so the contribution game can arm).
 */
export default function Closing() {
  const { d } = useLocale();
  const year = new Date().getFullYear();

  return (
    <section
      id="closing"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        {/* Gilt monogram */}
        <span className="font-serif text-6xl text-gold-bright sm:text-7xl">
          KC
        </span>

        {/* Gold divider with a centred rosette */}
        <div className="mt-8 flex items-center gap-3 text-gold/60">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 sm:w-28" />
          <span className="text-sm">✦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 sm:w-28" />
        </div>

        <p className="mt-8 max-w-md font-serif text-xl leading-snug text-ivory sm:text-2xl">
          {d.footer.built}
        </p>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-10 cursor-pointer font-sans text-[11px] uppercase tracking-[0.3em] text-gold-dim transition-colors hover:text-gold"
        >
          ↑ <span className="ml-1">{d.footer.backToTop}</span>
        </button>

        <span className="mt-6 font-sans text-[11px] tracking-wide text-ivory-dim">
          © {year} Kâmer Can
        </span>
      </motion.div>
    </section>
  );
}
