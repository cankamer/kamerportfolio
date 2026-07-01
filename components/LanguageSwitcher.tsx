"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOCALES, LOCALE_META } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import GlassSurface from "@/components/ui/GlassSurface";

/**
 * Gilt language pill in the top-right corner. The language defaults to the
 * visitor's country (resolved on the server) but can be changed here; the
 * choice is remembered in a cookie.
 */
export default function LanguageSwitcher() {
  const { locale, d, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <GlassSurface
        width={116}
        height={44}
        borderRadius={22}
        backgroundOpacity={0.12}
        saturation={1.6}
        distortionScale={-90}
        redOffset={0}
        greenOffset={0}
        blueOffset={0}
        className="border border-gold/20 transition-[border-color] duration-300 hover:border-gold/45"
      >
        <button
          type="button"
          aria-label={d.switcher.aria}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-full w-full items-center justify-center gap-2 px-3",
            "font-sans text-xs tracking-wide text-ivory-dim transition-colors",
            "hover:text-gold"
          )}
        >
          <span aria-hidden className="text-sm leading-none">
            {LOCALE_META[locale].flag}
          </span>
          <span className="uppercase">{locale}</span>
          <motion.span
            aria-hidden
            animate={{ rotate: open ? 180 : 0 }}
            className="text-[9px] text-gold-dim"
          >
            ▾
          </motion.span>
        </button>
      </GlassSurface>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-gold/20",
              "bg-marble/90 p-1 backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)]"
            )}
          >
            {LOCALES.map((l) => (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(l);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-sans text-sm transition-colors",
                    l === locale
                      ? "bg-gold/10 text-gold"
                      : "text-ivory-dim hover:bg-gold/5 hover:text-ivory"
                  )}
                >
                  <span aria-hidden>{LOCALE_META[l].flag}</span>
                  {LOCALE_META[l].label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
