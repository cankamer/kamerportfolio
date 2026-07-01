"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { GUITAR_STRINGS, BREAKING_STRING_INDEX, type GuitarStringDef } from "@/lib/data/strings";
import { useGuitarAudio } from "@/lib/audio/useGuitarAudio";
import { useSongTrack } from "@/lib/audio/useSongTrack";
import { type Orientation } from "./guitar/buildPaths";
import GuitarString from "./guitar/GuitarString";
import RoadmapVine from "./guitar/RoadmapVine";
import AudioUnlockOrb from "./ui/AudioUnlockOrb";
import { stringBroken, sharedPathProgress, sharedVineRatio } from "@/lib/sharedPath";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/* =========================================================================
   INTERACTIVE GUITAR STRINGS
   STATE A (top): 6 full-width hoverable/strummable strings, real tuning.
   STATE B (scroll > 20px): the thinnest string snaps and springs into the
   SAME winding line as "A Winding Path of Craft" — it descends from the break
   point and connects to the top of the timeline spine. Its audio then closes.
   ========================================================================= */

const SCROLL_BREAK_THRESHOLD = 30;
/** Below this, a broken string heals back and re-joins (hysteresis vs. break). */
const SCROLL_HEAL_THRESHOLD = 8;

function computeLanes(orientation: Orientation, w: number, h: number) {
  const count = GUITAR_STRINGS.length;
  if (orientation === "horizontal") {
    const start = 28;
    const end = Math.max(start + 1, h - 20);
    return GUITAR_STRINGS.map((_, i) => start + ((end - start) * i) / (count - 1));
  }
  const start = 28;
  const end = Math.max(start + 1, w - 20);
  return GUITAR_STRINGS.map((_, i) => start + ((end - start) * i) / (count - 1));
}

interface VineSpec {
  heightPx: number;
  segments: number;
  topPx: number;
  topDoc: number;
  leftDoc: number;
  leftPx: number;
  rightPx: number; // vine-relative X of the container's RIGHT edge (the anchor)
  widthPx: number;
  crossingYs: number[]; // vine-relative Y where path crosses center (= card centers)
}

export default function InteractiveGuitarStrings() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audio = useGuitarAudio();
  const song = useSongTrack("/romance-anonimo.mp3");
  const { d } = useLocale();

  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [reduced, setReduced] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const [broken, setBroken] = useState(false);
  const [vine, setVine] = useState<VineSpec | null>(null);
  const brokenRef = useRef(false);

  // Attention cue: until the user actually plucks a string, fire a silent
  // ripple across the stack every few seconds so it's obvious the strings are
  // interactive. `played` latches true on the first real strum and stops it.
  const [invite, setInvite] = useState(0);
  const playedRef = useRef(false);
  const [played, setPlayed] = useState(false);

  const ready = dims.w > 0 && dims.h > 0;
  const lanes = ready ? computeLanes(orientation, dims.w, dims.h) : [];
  const length = orientation === "horizontal" ? dims.w : dims.h;

  /**
   * Measure the gap from the break point down to the top of the timeline's
   * winding line (#journey-path) so the vine reaches it exactly and the two
   * lines read as one continuous spine.
   */
  const computeVine = useCallback(() => {
    const el = containerRef.current;
    const journey = document.getElementById("journey-path");
    if (!el || !journey) return;

    const rect = el.getBoundingClientRect();
    const jrect = journey.getBoundingClientRect();
    const o = window.innerWidth < 560 ? "vertical" : "horizontal";
    const ls = computeLanes(o, rect.width, rect.height);
    const breakLane = ls[BREAKING_STRING_INDEX] ?? rect.height;
    const topPx = o === "vertical" ? rect.height : breakLane;

    const startDoc = rect.top + window.scrollY + topPx;
    // Extend all the way to the BOTTOM of #journey-path so the vine IS the path.
    const targetDoc = jrect.bottom + window.scrollY;
    const heightPx = Math.max(280, targetDoc - startDoc);

    const leftPx = jrect.left - rect.left;
    // Container's right edge in vine-local coords — the string breaks at the LEFT
    // and so stays anchored to the RIGHT; the path starts here.
    const rightPx = rect.right - jrect.left;
    const widthPx = jrect.width;

    // Document-absolute position for portal rendering (escapes hero's stacking context).
    const topDoc  = startDoc;
    const leftDoc = jrect.left + window.scrollX;

    // Measure each card's vertical center in document coords → convert to vine-relative Y.
    // These become the exact crossing points where the vine passes through the center axis.
    const liEls = document.querySelectorAll<HTMLElement>("#journey-path > ol > li");
    const crossingYs = Array.from(liEls).map((li) => {
      const r = li.getBoundingClientRect();
      return (r.top + window.scrollY + r.height / 2) - startDoc;
    });
    const segments = crossingYs.length || 4;

    setVine({ heightPx, segments, topPx, topDoc, leftDoc, leftPx, rightPx, widthPx, crossingYs });
  }, []);

  // --- Measure container + derive orientation -------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      // Sticky: ignore transient 0 / sub-pixel measurements so the strings are
      // never blanked out by a stray layout pass.
      if (rect.width > 0 && rect.height > 0) {
        setDims((prev) =>
          Math.abs(prev.w - rect.width) > 1 || Math.abs(prev.h - rect.height) > 1
            ? { w: rect.width, h: rect.height }
            : prev
        );
      }
      setOrientation(window.innerWidth < 560 ? "vertical" : "horizontal");
      if (brokenRef.current) computeVine();
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [computeVine]);

  // --- Periodic "pluck me" invitation until the first real strum -----------
  useEffect(() => {
    if (reduced || orientation !== "horizontal") return;
    const id = setInterval(() => {
      if (playedRef.current || brokenRef.current) return;
      setInvite((n) => n + 1);
    }, 3400);
    return () => clearInterval(id);
  }, [reduced, orientation]);

  // --- prefers-reduced-motion ----------------------------------------------
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // --- Try to start the song on load without waiting for a click -----------
  // Browsers may still block this (autoplay policy); if so the gesture unlock
  // below remains the fallback.
  useEffect(() => {
    song.autoPrime();
  }, [song]);

  // --- Unlock the AudioContext on the first DISCRETE user gesture -----------
  // (Browsers only allow audio to start after click/tap/key — not hover.)
  useEffect(() => {
    const unlock = () => {
      audio.ensure();
      // Prime the recording within this gesture so later HOVER-strumming plays
      // without needing a separate click on a string.
      song.unlock();
      setUnlocked(true);
    };
    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "touchstart",
      "keydown",
      "click",
    ];
    events.forEach((e) => window.addEventListener(e, unlock, { once: true, passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, [audio, song]);

  // --- Scroll → snap the thinnest string; scroll back up → heal & re-join ---
  useEffect(() => {
    const onScroll = () => {
      // Measure scroll RELATIVE to the Hero ("first page"), not the absolute
      // page top. With the intro video occupying a tall spacer above the Hero,
      // the absolute scrollY is already large before the Hero is even visible —
      // using it would snap the string while the first page hasn't arrived yet.
      const heroEl = document.getElementById("home");
      const heroTop = heroEl
        ? heroEl.getBoundingClientRect().top + window.scrollY
        : 0;
      const y = window.scrollY - heroTop;

      // Once the user starts scrolling the recording plays continuously in the
      // background; scrolling all the way back to the top returns to the
      // strum-gated mode at the hero.
      if (y > SCROLL_HEAL_THRESHOLD) song.enterBackground();
      else song.exitBackground();

      // Heal: returning to the top re-forms the string and removes the vine.
      if (brokenRef.current && y < SCROLL_HEAL_THRESHOLD) {
        brokenRef.current = false;
        setBroken(false);
        setVine(null);
        return;
      }

      // Break: instantly snap the string without vibration animation.
      if (!brokenRef.current && y > SCROLL_BREAK_THRESHOLD) {
        brokenRef.current = true;
        setBroken(true);
        computeVine();
        
        audio.pluck(GUITAR_STRINGS[BREAKING_STRING_INDEX].frequency, {
          snap: true,
          intensity: 1,
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [audio, song]);

  // Re-measure the vine whenever the timeline itself changes size — new cards,
  // or lazy-loaded photos settling in — so the line's endpoint always tracks
  // the actual bottom of #journey-path instead of a stale one-time measurement.
  useEffect(() => {
    if (!broken) return;
    const journeyEl = document.getElementById("journey-path");
    if (!journeyEl) return;
    const ro = new ResizeObserver(() => computeVine());
    ro.observe(journeyEl);
    return () => ro.disconnect();
  }, [broken, computeVine]);

  // Signal broken state + drive the shared scroll progress that covers vine→timeline.
  useEffect(() => {
    stringBroken.set(broken);
    if (!broken || !vine) {
      sharedPathProgress.set(0);
      sharedVineRatio.set(0);
      return;
    }

    const el = containerRef.current;
    const journeyEl = document.getElementById("journey-path");
    if (!el || !journeyEl) return;

    const elRect = el.getBoundingClientRect();
    const journeyRect = journeyEl.getBoundingClientRect();
    const scrollNow = window.scrollY;
    const vh = window.innerHeight;

    // Document-absolute Y positions
    const vineTopDoc = elRect.top + scrollNow + vine.topPx;
    // Vine now extends to journeyEnd, so vineRatio = 1.
    sharedVineRatio.set(1);

    // progress=0: string snaps — gold visible at vine top immediately
    // progress=1: vine-bottom (= journey-path bottom) reaches viewport center
    const journeyEndDoc = journeyRect.bottom + scrollNow;
    // The string snaps SCROLL_BREAK_THRESHOLD past the Hero's top (Hero-relative,
    // so the intro spacer above the Hero doesn't offset this).
    const heroEl = document.getElementById("home");
    const heroTopDoc = heroEl
      ? heroEl.getBoundingClientRect().top + scrollNow
      : 0;
    const scrollAt0 = heroTopDoc + SCROLL_BREAK_THRESHOLD;
    const scrollAt1 = journeyEndDoc - vh / 2; // finishes when vine bottom at center
    const range = scrollAt1 - scrollAt0;

    const update = () => {
      const p = range > 0
        ? Math.max(0, Math.min(1, (window.scrollY - scrollAt0) / range))
        : 0;
      sharedPathProgress.set(p);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      sharedPathProgress.set(0);
      sharedVineRatio.set(0);
    };
  }, [broken, vine]);



  const handlePluck = useCallback(
    (_def: GuitarStringDef, _intensity: number) => {
      // First real strum: stop the attention ripple and hide the hint.
      if (!playedRef.current) {
        playedRef.current = true;
        setPlayed(true);
      }
      // Plays the recording only while the user keeps strumming; it fades out
      // on its own shortly after they stop (handled inside useSongTrack).
      song.touch();
    },
    [song]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: orientation === "vertical" ? "52vh" : "11rem" }}
    >
      {ready && (
        <svg
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          width={dims.w}
          height={dims.h}
          className="absolute inset-0 overflow-visible"
        >
          {GUITAR_STRINGS.map((def, i) => {
            const isBreaker = i === BREAKING_STRING_INDEX;

            // Once broken, the bottom string becomes ONE continuous stroke: the
            // RoadmapVine (rendered via portal below) starts at the left nut,
            // sweeps down into the centre and winds down the timeline. Nothing
            // is drawn here in the string SVG — the vine IS the broken string.
            if (isBreaker && broken) {
              return null;
            }
            return (
              <GuitarString
                key={def.id}
                def={def}
                index={i}
                orientation={orientation}
                lane={lanes[i]}
                length={length}
                interactive={!broken}
                reduced={reduced}
                invite={played ? 0 : invite}
                onPluck={handlePluck}
              />
            );
          })}
        </svg>
      )}

      {/* Track info above the strings */}
      {ready && !broken && orientation === "horizontal" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-x-0 -top-9 flex items-center justify-center gap-2 font-sans text-[10px] uppercase tracking-[0.3em] text-gold-dim"
        >
          <AudioUnlockOrb armed={unlocked} />
          <span className="text-ivory-dim">Romance Anónimo</span>
          <span className="text-gold-dim">—</span>
          <span>Narciso Yepes</span>
        </motion.div>
      )}

      {/* Persistent hint below the strings — a glowing, pulsing pill with an
          animated equalizer so the "pluck to play" call-to-action is obvious.
          Fades out once the user has strummed for the first time. */}
      <AnimatePresence>
        {ready && !broken && !played && orientation === "horizontal" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="pointer-events-none absolute inset-x-0 -bottom-10 flex items-center justify-center"
          >
            <div
              className="flex items-center gap-2.5 rounded-full border border-gold/40 bg-obsidian/50 px-4 py-1.5 backdrop-blur-sm"
              style={{ boxShadow: "0 0 18px rgba(201,162,75,0.28)" }}
            >
              <EqualizerBars />
              <span className="font-sans text-[11px] uppercase tracking-[0.26em] text-gold-bright">
                {d.hero.strumHint}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vine rendered into body via portal to escape hero's z-10 stacking context. */}
      {broken && vine && createPortal(
        <div
          className="pointer-events-none"
          style={{
            position: "absolute",
            top: vine.topDoc,
            left: vine.leftDoc,
            width: vine.widthPx,
            zIndex: 15,
          }}
        >
          <RoadmapVine
            widthPx={vine.widthPx}
            heightPx={vine.heightPx}
            segments={vine.segments}
            crossingYs={vine.crossingYs}
            strokeWidth={GUITAR_STRINGS[BREAKING_STRING_INDEX].thickness}
            reduced={reduced}
            anchorX={vine.rightPx}
            leftEdgeX={-vine.leftPx}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

/** Three little dancing bars that read instantly as "music / press to play". */
function EqualizerBars() {
  const bars = [0, 0.18, 0.36];
  return (
    <span className="flex items-end gap-[3px] h-3" aria-hidden>
      {bars.map((delay, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gold-bright"
          animate={{ height: ["35%", "100%", "45%", "85%", "35%"] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
          style={{ height: "35%" }}
        />
      ))}
    </span>
  );
}

