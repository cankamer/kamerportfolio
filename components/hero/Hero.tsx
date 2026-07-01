"use client";

import { motion } from "framer-motion";
import HeroCanvas from "./HeroCanvas";
import InteractiveGuitarStrings from "@/components/InteractiveGuitarStrings";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function Hero() {
  const { d } = useLocale();
  return (
    <section
      id="home"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      {/* Full-bleed background photo with darkening overlay */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/moodyfloral.png')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <HeroCanvas />

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="font-sans text-xs uppercase tracking-[0.4em] text-gold-dim"
      >
        {d.hero.eyebrow}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 max-w-4xl text-6xl leading-[0.95] text-ivory sm:text-7xl md:text-8xl"
      >
        {d.hero.titleA}{" "}
        <span className="text-gold-foil italic">{d.hero.titleEmphasis1}</span>{" "}
        {d.hero.titleB}
        <br />
        <span className="text-gold-foil italic">{d.hero.titleEmphasis2}</span>.
      </motion.h1>



      {/* Interactive guitar strings — full-bleed, edge to edge & symmetric.
          `self-stretch -mx-6` cancels the section's px-6 so the band reaches
          both screen edges; the entry animation lives on the inner motion.div
          (margins don't fight Framer's transform). */}
      <div className="mt-14 -mx-6 self-stretch">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="w-full"
        >
          <InteractiveGuitarStrings />
        </motion.div>
      </div>

    </section>
  );
}
