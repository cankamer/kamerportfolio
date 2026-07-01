"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Real outbound links. Brand names stay as-is; the "Contact" label is localized.
 *
 * TODO(Kamer): paste your Instagram / X (Twitter) handles below to enable them.
 * Leave href empty ("") to hide a link.
 */
const SOCIALS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/cankamer" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/kamer-can-313412387/" },
  { label: "Instagram", href: "" }, // e.g. https://instagram.com/<handle>
  { label: "X / Twitter", href: "" }, // e.g. https://x.com/<handle>
];

export default function SocialLinks() {
  const { d } = useLocale();

  const links = [
    ...SOCIALS.filter((s) => s.href),
    { label: d.nav.contact, href: "mailto:hellokamer07@gmail.com" },
  ];

  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith("http") ? "_blank" : undefined}
          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
          className="group relative font-sans text-sm tracking-wide text-ivory-dim transition-colors hover:text-gold"
        >
          {link.label}
          <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
        </a>
      ))}
    </nav>
  );
}
