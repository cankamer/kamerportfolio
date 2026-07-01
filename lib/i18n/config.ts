/**
 * i18n configuration: supported locales, country→locale mapping and the
 * detection helpers used on the server (in app/layout.tsx).
 *
 * Strategy (visitor's COUNTRY drives the default language):
 *   1. If a `locale` cookie exists (the visitor chose manually) → respect it.
 *   2. Else map the geo country (Vercel `x-vercel-ip-country`) → locale.
 *   3. Else fall back to the browser's Accept-Language header.
 *   4. Else English.
 */

export const LOCALES = ["tr", "en", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";

/** Human label + flag for the language switcher. */
export const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  tr: { label: "Türkçe", flag: "🇹🇷" },
  en: { label: "English", flag: "🇬🇧" },
  de: { label: "Deutsch", flag: "🇩🇪" },
};

/** ISO-3166 country code → locale. Anything unlisted falls back to English. */
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  TR: "tr",
  // German-speaking (DACH + Liechtenstein)
  DE: "de",
  AT: "de",
  CH: "de",
  LI: "de",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function localeFromCountry(country: string | undefined | null): Locale | undefined {
  if (!country) return undefined;
  return COUNTRY_TO_LOCALE[country.toUpperCase()];
}

/** Parse an Accept-Language header and return the first supported locale. */
export function localeFromAcceptLanguage(header: string | undefined | null): Locale | undefined {
  if (!header) return undefined;
  const tags = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .filter(Boolean);

  for (const tag of tags) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return undefined;
}

/**
 * Resolve the locale on the server from the available signals.
 * Cookie (explicit choice) wins, then country, then browser language.
 */
export function resolveLocale(opts: {
  cookie?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(opts.cookie)) return opts.cookie;
  return (
    localeFromCountry(opts.country) ??
    localeFromAcceptLanguage(opts.acceptLanguage) ??
    DEFAULT_LOCALE
  );
}

/** A string available in every supported language — used for content data. */
export type Localized = Record<Locale, string>;

/** Pick the right language out of a Localized value. */
export function pick(value: Localized, locale: Locale): string {
  return value[locale] ?? value[DEFAULT_LOCALE];
}
