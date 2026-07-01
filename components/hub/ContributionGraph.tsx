"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import SpaceShooter, { type Invader } from "./SpaceShooter";

/** GitHub green ramp (level 0 = empty, 1–4 = intensity). */
const GREEN = ["rgba(110,118,129,0.16)", "#0e4429", "#006d32", "#26a641", "#39d353"];
/** GitLab orange ramp — warms up from obsidian to gold-orange. */
const ORANGE = ["rgba(110,118,129,0.16)", "#5c2d00", "#a84800", "#e06c00", "#fc9231"];

interface Day {
  date: string;
  count: number;
  level: number; // 0–4
}

/** Map a raw contribution count to a 0–4 intensity level. */
function countToLevel(n: number): number {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  if (n <= 5) return 2;
  if (n <= 9) return 3;
  return 4;
}

/** Convert GitLab calendar.json `{date: count}` to the shared Day format. */
function fromGitLabJson(raw: Record<string, number>): Day[] {
  return Object.entries(raw)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count, level: countToLevel(count) }));
}

/** Group the flat day list into calendar columns (weeks × 7 days). */
function buildGrid(days: Day[]) {
  if (days.length === 0) return { cells: [] as Invader[], grid: [] as number[][], cols: 0 };
  const firstDow = new Date(days[0].date).getDay(); // 0 = Sunday
  const cols = Math.ceil((days.length + firstDow) / 7);
  const grid: number[][] = Array.from({ length: cols }, () => Array(7).fill(-1));
  const cells: Invader[] = [];
  days.forEach((day, i) => {
    const pos = i + firstDow;
    const col = Math.floor(pos / 7);
    const row = pos % 7;
    grid[col][row] = day.level;
    if (day.level > 0) cells.push({ col, row, level: day.level });
  });
  return { cells, grid, cols };
}

/** Deterministic fallback if the live API can't be reached. */
function fallbackDays(): Day[] {
  const out: Day[] = [];
  const start = new Date();
  start.setDate(start.getDate() - 364);
  for (let i = 0; i < 365; i++) {
    const dte = new Date(start);
    dte.setDate(start.getDate() + i);
    const level = (i * 3 + ((i * 7) % 5)) % 5;
    out.push({ date: dte.toISOString().slice(0, 10), count: level, level });
  }
  return out;
}

/**
 * Live GitHub contribution calendar (green), which — once you've scrolled a
 * little past it — lifts off into a playable "GitHub Space Shooter": the
 * contribution squares become a fleet of invaders to clear.
 *
 * Live data comes from the public, auth-free jogruber contributions API.
 */
/** Horizontally scrollable calendar strip; snaps to the newest (rightmost) week on mount/resize. */
function CalendarScroller({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [children]);
  return (
    <div ref={scrollRef} className="overflow-x-auto pb-1 [scrollbar-width:none]">
      {children}
    </div>
  );
}

export default function ContributionGraph({
  label,
  href,
  username,
  variant = "github",
}: {
  label: string;
  href?: string;
  username: string;
  variant?: "github" | "gitlab";
}) {
  const { d } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Day[] | null>(null);
  const [playing, setPlaying] = useState(false);

  const RAMP = variant === "gitlab" ? ORANGE : GREEN;

  // --- Live fetch -----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const url =
      variant === "gitlab"
        ? `/api/gitlab-calendar?user=${username}`
        : `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (cancelled) return;
        if (variant === "gitlab") {
          setDays(fromGitLabJson(json as Record<string, number>));
        } else {
          setDays((json as { contributions: Day[] }).contributions ?? fallbackDays());
        }
      })
      .catch(() => {
        if (!cancelled) setDays(fallbackDays());
      });
    return () => {
      cancelled = true;
    };
  }, [username, variant]);

  // --- Scroll trigger: launch the game after scrolling a bit past the card --
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight;
      if (top < vh * 0.35) setPlaying(true);
      else if (top > vh * 0.85) setPlaying(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { cells, grid, cols } = useMemo(
    () => buildGrid(days ?? []),
    [days]
  );
  const total = useMemo(
    () => (days ?? []).reduce((s, x) => s + x.count, 0),
    [days]
  );

  return (
    <div ref={ref}>
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center justify-between">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-sans text-xs uppercase tracking-[0.25em] text-gold-dim transition-colors hover:text-gold"
          >
            {label} ↗
          </a>
        ) : (
          <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold-dim">
            {label}
          </span>
        )}
        <span className="font-sans text-[11px] text-ivory-dim">
          {playing
            ? d.game.controls
            : days
              ? `${total.toLocaleString()} ${d.hub.contributions} · ${d.hub.placeholderNote}`
              : "…"}
        </span>
      </div>

      <div className="relative min-h-[6rem]">
        <AnimatePresence mode="wait">
          {playing && cols > 0 ? (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SpaceShooter invaders={cells} cols={cols} />
            </motion.div>
          ) : (
            <motion.div
              key="cal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <CalendarScroller>
                <div className="flex justify-center gap-[3px]">
                  {grid.map((week, w) => (
                    <div key={w} className="flex flex-col gap-[3px]">
                      {week.map((level, dd) => (
                        <span
                          key={dd}
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor: level < 0 ? "transparent" : RAMP[level],
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </CalendarScroller>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 font-sans text-[10px] text-ivory-dim">
        <span>{d.hub.contributions}</span>
        {RAMP.slice(1).map((c, i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </GlassCard>
    </div>
  );
}
