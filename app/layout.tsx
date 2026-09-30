import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { cormorant, inter } from "./fonts";
import "./globals.css";
import { LOCALE_COOKIE, resolveLocale } from "@/lib/i18n/config";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import FloralBackground from "@/components/three/FloralBackground";
import SakuraCursor from "@/components/SakuraCursor";
import SideNav from "@/components/SideNav";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ScrollToTopOnLoad from "@/components/ScrollToTopOnLoad";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Kamer Can — Creative Technologist",
  description:
    "Kamer Can — Computer Engineering student building at the seam of AI, electronics and software. A neo-classical, baroque-inspired portfolio.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve language from the visitor's saved choice, then country, then browser.
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    cookie: cookieStore.get(LOCALE_COOKIE)?.value,
    country: headerList.get("x-vercel-ip-country"),
    acceptLanguage: headerList.get("accept-language"),
  });

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="relative min-h-full overflow-x-hidden" suppressHydrationWarning>
        <LocaleProvider initialLocale={locale}>
          <ScrollToTopOnLoad />
          <SmoothScroll />
          <FloralBackground />
          <SakuraCursor />

          {/* Floating controls (no full-width header bar) */}
          <div className="fixed right-5 top-5 z-50">
            <LanguageSwitcher />
          </div>
          <SideNav />

          <div id="top">{children}</div>
        </LocaleProvider>
      </body>
    </html>
  );
}
