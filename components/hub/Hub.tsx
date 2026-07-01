"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import ContributionGraph from "./ContributionGraph";
import SocialLinks from "./SocialLinks";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * "The Hub" — the GitHub contribution calendar plus contact / social links.
 * Live API wiring (real contributions) arrives in a later phase.
 */
export default function Hub() {
  const { d } = useLocale();

  return (
    <section
      id="hub"
      className="relative z-10 mx-auto w-full max-w-5xl px-4 py-28 sm:px-8"
    >
      <SectionHeading eyebrow={d.hub.eyebrow} title={d.hub.title} className="mb-16" />

      <ContributionGraph
        label="GitHub"
        href="https://github.com/cankamer"
        username="cankamer"
      />


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-20 text-center"
      >
        <h3 className="text-3xl text-ivory sm:text-4xl">{d.contact.title}</h3>
        <p className="mx-auto mt-3 max-w-md font-sans text-sm leading-relaxed text-ivory-dim">
          {d.contact.line}
        </p>
        <div className="mt-8">
          <SocialLinks />
        </div>
      </motion.div>
    </section>
  );
}
