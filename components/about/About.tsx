"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import CurvedLoop from "@/components/ui/CurvedLoop";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * "About" — the narrative bio plus a gilt fact sheet. Paragraphs fade up in
 * sequence; the fact card sits alongside on wide screens.
 */
export default function About() {
  const { d } = useLocale();

  return (
    <section
      id="about"
      className="relative z-10 mx-auto w-full max-w-5xl px-4 py-28 sm:px-8"
    >
      <SectionHeading eyebrow={d.about.eyebrow} title={d.about.title} className="mb-16" />

      <div className="grid gap-10 md:grid-cols-[1.6fr_1fr] md:items-start">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7 }}
            className="font-serif text-2xl leading-snug text-ivory"
          >
            {d.about.lead}
          </motion.p>

          <div className="mt-6 space-y-4">
            {d.about.body.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.1 }}
                className="font-sans text-sm leading-relaxed text-ivory-dim"
              >
                {para}
              </motion.p>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="p-6">
            <ul className="divide-y divide-gold/10">
              {d.about.facts.map((fact) => (
                <li
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-gold-dim">
                    {fact.label}
                  </span>
                  <span className="text-right font-serif text-base text-ivory">
                    {fact.value}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>

      {/* Curved marquee accent closing the section — full-bleed, edge to edge. */}
      <div className="relative left-1/2 mt-24 w-screen -translate-x-1/2">
        <CurvedLoop
          marqueeText={d.about.marquee}
          speed={0.5}
          curveAmount={260}
          interactive
          className="font-serif [fill:#ffffff]"
        />
      </div>
    </section>
  );
}
