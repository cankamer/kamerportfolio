"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Plays a single LOCAL audio file (the Romance Anónimo recording shipped in
 * /public) through a plain HTMLAudioElement, with two distinct behaviours:
 *
 *   1. TOP OF PAGE — `touch()` is called on every string interaction. The track
 *      fades in and keeps playing only WHILE the user keeps strumming; the
 *      moment they stop (no new touch within IDLE_MS) it fades out quickly.
 *
 *   2. SCROLLING — `enterBackground()` switches to a continuous ambient mode:
 *      the track plays through, uninterrupted, regardless of strumming. Scroll
 *      back to the very top (`exitBackground()`) returns to mode 1.
 *
 * Volume is ramped manually (requestAnimationFrame) since HTMLAudioElement has
 * no built-in fades. Browsers block playback until a user gesture, but the
 * first `touch()` originates from a pointer/key event so playback is allowed.
 */

const TARGET_VOLUME = 0.12;
/** Quick fade-in when strumming / entering background. */
const FADE_IN_MS = 280;
/** "hemen" — near-instant fade-out when strumming stops. */
const FADE_OUT_MS = 260;
/** Grace period after the last touch before we treat strumming as finished. */
const IDLE_MS = 650;

export interface SongTrack {
  ready: boolean;
  /** Prime the element on the first user gesture so hover playback is allowed. */
  unlock: () => void;
  /**
   * Best-effort auto-prime on page load (no gesture). Where the browser's
   * autoplay policy permits it, this unlocks the element so later strumming
   * plays with no initial click; where it doesn't, it silently no-ops and the
   * gesture-based `unlock` remains the fallback.
   */
  autoPrime: () => void;
  /** A string was plucked at the top: play + (re)arm the idle fade-out. */
  touch: () => void;
  /** Scrolling started: play continuously in the background. */
  enterBackground: () => void;
  /** Scrolled back to the top: resume touch-gated playback. */
  exitBackground: () => void;
}

export function useSongTrack(src: string): SongTrack {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundRef = useRef(false);
  /** True while we INTEND the track to be playing (vs. a silent prime). */
  const activeRef = useRef(false);
  const primedRef = useRef(false);
  const [ready, setReady] = useState(false);

  const ensure = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    if (typeof window === "undefined") return null;
    const a = new Audio(src);
    a.loop = true;
    a.preload = "auto";
    a.volume = 0;
    audioRef.current = a;
    setReady(true);
    return a;
  }, [src]);

  /** Ramp the element volume to `target` over `ms`, optionally pausing at the end. */
  const fadeTo = useCallback((target: number, ms: number, pauseAtEnd = false) => {
    const a = audioRef.current;
    if (!a) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const from = a.volume;
    const start = performance.now();
    const step = (now: number) => {
      const t = ms <= 0 ? 1 : Math.min(1, (now - start) / ms);
      a.volume = Math.max(0, Math.min(1, from + (target - from) * t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        if (pauseAtEnd) {
          a.pause();
          activeRef.current = false;
        }
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  /**
   * Satisfy the browser's autoplay policy on the very first user gesture
   * (a discrete click/tap/key — hover does NOT count). We start playback
   * silently and immediately stop it, which marks the element as user-unlocked
   * so later HOVER-driven `touch()` calls can play with no extra click.
   */
  const unlock = useCallback(() => {
    if (primedRef.current) return;
    const a = ensure();
    if (!a) return;
    primedRef.current = true;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        // Don't kill real playback if a strum already started one.
        if (!activeRef.current) {
          a.pause();
          a.currentTime = 0;
        }
      }).catch(() => {
        primedRef.current = false;
      });
    }
  }, [ensure]);

  /**
   * Open the track for ~half a second at zero volume the moment the page
   * loads, then stop it. If the browser allows it, the element is now
   * user-unlocked and the song will play on the first strum without any click.
   * If autoplay is blocked, the promise rejects and we leave it unprimed so the
   * first real gesture still unlocks it.
   */
  const autoPrime = useCallback(() => {
    if (primedRef.current) return;
    const a = ensure();
    if (!a) return;
    a.volume = 0;
    const p = a.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        primedRef.current = true;
        setTimeout(() => {
          if (!activeRef.current) {
            a.pause();
            a.currentTime = 0;
            a.volume = 0;
          }
        }, 500);
      }).catch(() => {
        // Autoplay blocked — stay unprimed; gesture unlock will handle it.
      });
    }
  }, [ensure]);

  const startPlayback = useCallback(() => {
    const a = ensure();
    if (!a) return;
    activeRef.current = true;
    if (a.paused) void a.play().catch(() => {});
    fadeTo(TARGET_VOLUME, FADE_IN_MS);
  }, [ensure, fadeTo]);

  const clearIdle = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const touch = useCallback(() => {
    if (backgroundRef.current) return; // background mode ignores per-pluck gating
    startPlayback();
    clearIdle();
    idleTimerRef.current = setTimeout(() => {
      idleTimerRef.current = null;
      if (!backgroundRef.current) fadeTo(0, FADE_OUT_MS, true);
    }, IDLE_MS);
  }, [startPlayback, clearIdle, fadeTo]);

  const enterBackground = useCallback(() => {
    if (backgroundRef.current) return;
    backgroundRef.current = true;
    clearIdle();
    startPlayback();
  }, [clearIdle, startPlayback]);

  const exitBackground = useCallback(() => {
    if (!backgroundRef.current) return;
    backgroundRef.current = false;
    clearIdle();
    // Returned to the top without strumming: fade the ambient track out.
    fadeTo(0, FADE_OUT_MS, true);
  }, [clearIdle, fadeTo]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      const a = audioRef.current;
      audioRef.current = null;
      if (a) {
        a.pause();
        a.src = "";
      }
    };
  }, []);

  return useMemo(
    () => ({ ready, unlock, autoPrime, touch, enterBackground, exitBackground }),
    [ready, unlock, autoPrime, touch, enterBackground, exitBackground]
  );
}
