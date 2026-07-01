"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * Tiny synth-based guitar audio engine.
 *
 * Notes are SYNTHESIZED with the Web Audio API (additive oscillators + a
 * plucked envelope) rather than loaded as files, which gives us:
 *   • zero-latency playback (no fetch / decode),
 *   • exact, real tuning frequencies,
 *   • no binary assets to ship.
 *
 * Browsers block audio until a user gesture, so the AudioContext is created
 * lazily on the first interaction via `ensure()`. Every `pluck()` also calls
 * `ensure()` defensively and resumes a suspended context.
 */

export interface PluckOptions {
  /** 0–1 strength; scales volume and brightness. */
  intensity?: number;
  /** Render the dry, percussive "string break" transient instead of a note. */
  snap?: boolean;
}

export interface GuitarAudio {
  /** Create / resume the AudioContext. Safe to call repeatedly. */
  ensure: () => void;
  /** Play a plucked note at `frequency` Hz (or a snap transient). */
  pluck: (frequency: number, opts?: PluckOptions) => void;
}

export function useGuitarAudio(): GuitarAudio {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);

  const ensure = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return;

      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);

      // Pre-bake a short white-noise buffer for snap/break transients.
      const len = Math.floor(ctx.sampleRate * 0.4);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

      ctxRef.current = ctx;
      masterRef.current = master;
      noiseRef.current = buffer;
    }

    if (ctxRef.current.state === "suspended") {
      void ctxRef.current.resume();
    }
  }, []);

  const pluck = useCallback(
    (frequency: number, opts: PluckOptions = {}) => {
      ensure();
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;

      const intensity = Math.max(0, Math.min(1, opts.intensity ?? 0.85));
      const now = ctx.currentTime;

      // Per-voice envelope and tone-shaping filter.
      const env = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = opts.snap ? 6 : 1;
      filter.frequency.setValueAtTime(
        Math.min(ctx.sampleRate / 2 - 1000, frequency * (opts.snap ? 9 : 5)),
        now
      );
      filter.connect(env);
      env.connect(master);

      const decay = opts.snap ? 0.28 : 1.7;
      const peak = (opts.snap ? 0.28 : 0.22) * (0.5 + intensity * 0.5);

      // Plucked amplitude envelope: near-instant attack, exponential decay.
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(peak, now + 0.005);
      env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      // Additive partials give the note body. Snap gets a brighter, detuned set.
      const partials = opts.snap
        ? [
            { mult: 1, gain: 0.4, type: "sawtooth" as OscillatorType },
            { mult: 2.7, gain: 0.3, type: "square" as OscillatorType },
          ]
        : [
            { mult: 1, gain: 1, type: "triangle" as OscillatorType },
            { mult: 2, gain: 0.45, type: "triangle" as OscillatorType },
            { mult: 3, gain: 0.22, type: "sine" as OscillatorType },
          ];

      const stopAt = now + decay + 0.05;
      for (const p of partials) {
        const osc = ctx.createOscillator();
        osc.type = p.type;
        osc.frequency.setValueAtTime(frequency * p.mult, now);
        const g = ctx.createGain();
        g.gain.value = p.gain;
        osc.connect(g);
        g.connect(filter);
        osc.start(now);
        osc.stop(stopAt);
      }

      // Percussive transient: a filtered noise burst (snap = the string break).
      if (noiseRef.current) {
        const src = ctx.createBufferSource();
        src.buffer = noiseRef.current;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = opts.snap ? frequency * 4 : frequency * 2;
        bp.Q.value = opts.snap ? 0.8 : 2;
        const ng = ctx.createGain();
        const nPeak = opts.snap ? 0.5 : 0.12;
        const nDecay = opts.snap ? 0.18 : 0.04;
        ng.gain.setValueAtTime(nPeak * (0.4 + intensity * 0.6), now);
        ng.gain.exponentialRampToValueAtTime(0.0001, now + nDecay);
        src.connect(bp);
        bp.connect(ng);
        ng.connect(master);
        src.start(now);
        src.stop(now + nDecay + 0.02);
      }
    },
    [ensure]
  );

  // Tear down the context when the component using the hook unmounts.
  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      masterRef.current = null;
      noiseRef.current = null;
      if (ctx && ctx.state !== "closed") void ctx.close();
    };
  }, []);

  return useMemo(() => ({ ensure, pluck }), [ensure, pluck]);
}
