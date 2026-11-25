import gsap from 'gsap';
import { RunnerGame } from './runner.js';
import { COATS, COLORS, PixelBuffer, PixelCatDirector, SCENE_HEIGHT, SCENE_WIDTH, SIT, clamp01, drawAlert, drawCat, drawHearts, drawShadow, drawZzz } from './pixelcat/engine.js';
import { NAV_CAT_SCENES, drawBookkeepingStage, renderNavCatScene } from './pixelcat/navScenes.js';
import { WALK_CROP, WALK_FRAMES, walkFrame } from './pixelcat/walk.js';

const h = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

/* ───────────────────────── Haneko pixel cats ───────────────────────── */

// Haneko's own mascot engine (shapes scanned into a tiny pixel buffer), ported from the web app.
// `about` is the four-cat team; the rest are the landing menu's little scenes, `vault` among them.
const CAT_SCENES = ['about', 'faq', 'demo', 'tour', 'forecast', 'business', 'advisor', 'meeting', 'pricing', 'vault'];
const CAT_FPS = 12;

export function catsWidget() {
  const el = h(`
    <div class="widget">
      <div class="cats">${CAT_SCENES.map((id) => {
        const s = NAV_CAT_SCENES[id];
        return `<canvas width="${s.width}" height="${s.height}" style="--w:${s.width}" aria-hidden="true"></canvas>`;
      }).join('')}</div>
    </div>`);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cells = [...el.querySelectorAll('canvas')].map((canvas, i) => {
    const ctx = canvas.getContext('2d');
    const scene = NAV_CAT_SCENES[CAT_SCENES[i]];
    return { scene, ctx, buffer: new PixelBuffer(scene.width, scene.height), image: ctx.createImageData(scene.width, scene.height) };
  });
  const draw = (time) =>
    cells.forEach((c) => {
      renderNavCatScene(c.buffer, c.scene, still ? c.scene.stillTime : time);
      c.image.data.set(c.buffer.data);
      c.ctx.putImageData(c.image, 0, 0);
    });
  let raf = 0;
  let lastTick = -1;
  const loop = (now) => {
    const tick = Math.floor((now / 1000) * CAT_FPS);
    if (tick !== lastTick) {
      lastTick = tick;
      draw(now / 1000);
    }
    raf = requestAnimationFrame(loop);
  };
  if (still) draw(0);
  else raf = requestAnimationFrame(loop);
  return { el, destroy: () => cancelAnimationFrame(raf) };
}

// Haneko's landing-page hero cat (hero-cat.tsx), the calico Istanbul cat at a large whole-number scale:
// it sleeps by the purple folder until you get here, wakes up ("!" and a stretch), then stamps invoices
// with its paw and files them, cheering after every three. Clicking it shows hearts.
const HERO_SCENE = NAV_CAT_SCENES.bookkeeping;
const WAKE_DELAY = 0.9;
const WAKE_SECONDS = 2.8; // the engine's wake-up segment; it ends sitting, where the work scene starts
const PET_SECONDS = 1.8;

export function catHeroWidget() {
  const el = h(`
    <div class="widget cat-hero">
      <button class="cat-hero-btn" type="button" aria-label="Haneko’s calico cat. Click to pet it.">
        <canvas width="${HERO_SCENE.width}" height="${SCENE_HEIGHT}" aria-hidden="true"></canvas>
      </button>
    </div>`);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = el.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const buffer = new PixelBuffer(HERO_SCENE.width, SCENE_HEIGHT);
  const image = ctx.createImageData(HERO_SCENE.width, SCENE_HEIGHT);
  const flush = () => (image.data.set(buffer.data), ctx.putImageData(image, 0, 0));
  const now = () => performance.now() / 1000;

  if (still) {
    renderNavCatScene(buffer, HERO_SCENE, HERO_SCENE.stillTime, { coat: COATS.calico });
    flush();
    return { el };
  }

  // asleep until the cat is properly on screen, then the wake-up starts from that moment
  let startedAt = null;
  const director = new PixelCatDirector('sleeping', now());
  const seen = new IntersectionObserver(([e]) => e.isIntersecting && startedAt === null && (startedAt = now()), { threshold: 0.6 });
  seen.observe(el);

  let petAt = null;
  el.querySelector('button').addEventListener('click', () => (petAt = now()));
  const pet = (t) => {
    if (petAt === null) return null;
    const p = (t - petAt) / PET_SECONDS;
    if (p >= 1) return (petAt = null);
    return clamp01(p);
  };

  const drawMoment = (t) => {
    const p = pet(t);
    const workAt = startedAt === null ? Infinity : startedAt + WAKE_DELAY + WAKE_SECONDS;
    if (t < workAt) {
      if (startedAt !== null && t - startedAt > WAKE_DELAY) director.setMode('awake', t);
      let frame = { ...director.frameAt(t), coat: COATS.calico };
      if (p !== null) frame = { ...frame, eyes: 'happy', mouth: 'smile', isSleeping: false };
      buffer.clear();
      drawBookkeepingStage(buffer);
      drawShadow(buffer, frame);
      drawCat(buffer, frame);
      if (frame.isSleeping) drawZzz(buffer, frame, t);
      if (frame.alertProgress !== undefined) drawAlert(buffer, frame, frame.alertProgress);
      if (p !== null) drawHearts(buffer, frame, p);
    } else {
      renderNavCatScene(buffer, HERO_SCENE, t - workAt, { coat: COATS.calico });
      if (p !== null) drawHearts(buffer, SIT, p);
    }
    flush();
  };

  let raf = 0;
  let lastTick = -1;
  const loop = (ms) => {
    const tick = Math.floor((ms / 1000) * CAT_FPS);
    if (tick !== lastTick) {
      lastTick = tick;
      drawMoment(now());
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return { el, destroy: () => (cancelAnimationFrame(raf), seen.disconnect()) };
}

// Haneko's AI-chat backdrop (ai-chat-cat-backdrop.tsx): the engine's walking cat, each pixel printed as a
// character tile (the ascii-koi technique: light fur gets sparse glyphs, shade and outline dense ones),
// leaving fading ASCII paw prints. Never two cats with the same coat at once.
const WALK_COATS = [COATS.calico, COATS.tuxedo, COATS.orangeTabby, COATS.fold];
const WALK_CYCLE = [2, 2.4]; // seconds per step cycle; a cat moves one tile per gait frame, so paws don't slide
const BLINK_MS = 150;
const RAMP = ' .:-=+*#%@';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const PRINT_GLYPHS = ['.', ':', '·', "'"];
const PRINT_LIFE_MS = 3200;
const WALK_FRAME_MS = 1000 / 15;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (items) => items[Math.floor(Math.random() * items.length)];
const lum = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const byte = (v) => Math.max(0, Math.min(255, Math.round(v)));

function walkSprite(coat, gait, blinking, cell, dir, ratio) {
  const buffer = new PixelBuffer(SCENE_WIDTH, SCENE_HEIGHT);
  drawCat(buffer, walkFrame(coat, gait, blinking));
  const sprite = document.createElement('canvas');
  sprite.width = Math.ceil(WALK_CROP.width * cell * ratio);
  sprite.height = Math.ceil(WALK_CROP.height * cell * ratio);
  const c = sprite.getContext('2d');
  c.scale(ratio, ratio);
  c.font = `600 ${(cell * 0.92).toFixed(1)}px ${MONO}`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const snap = (v) => Math.round(v * ratio) / ratio;
  const gap = Math.max(0.5, cell * 0.08);
  const glyphs = [];
  for (let row = 0; row < WALK_CROP.height; row++) {
    for (let col = 0; col < WALK_CROP.width; col++) {
      const sx = WALK_CROP.x + (dir === 1 ? col : WALK_CROP.width - 1 - col);
      const i = ((WALK_CROP.y + row) * SCENE_WIDTH + sx) * 4;
      const alpha = buffer.data[i + 3] / 255;
      if (!alpha) continue;
      const [r, g, b] = [buffer.data[i], buffer.data[i + 1], buffer.data[i + 2]];
      const outline = r === COLORS.outline[0] && g === COLORS.outline[1] && b === COLORS.outline[2];
      const x = col * cell;
      const y = row * cell;
      c.globalAlpha = alpha * (outline ? 0.8 : 1);
      c.fillStyle = `rgb(${r} ${g} ${b})`;
      const x0 = snap(x + gap);
      const y0 = snap(y + gap);
      c.fillRect(x0, y0, snap(x + cell - gap) - x0, snap(y + cell - gap) - y0);
      const index = Math.max(1, Math.min(RAMP.length - 1, 1 + Math.round((1 - lum(r, g, b)) * 8) + (outline ? 1 : 0)));
      glyphs.push([RAMP[index], `rgb(${byte(r * 0.5)} ${byte(g * 0.5)} ${byte(b * 0.5)})`, x + cell / 2, y + cell / 2, alpha * 0.62]);
    }
  }
  for (const [glyph, color, x, y, a] of glyphs) {
    c.globalAlpha = a;
    c.fillStyle = color;
    c.fillText(glyph, x, y);
  }
  return sprite;
}

export function catWalkWidget() {
  const el = h(`<div class="widget cat-walk"><canvas aria-hidden="true"></canvas></div>`);
  const canvas = el.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sprites = new Map();
  let ratio = 1;
  let width = 0;
  let height = 0;
  let walkers = [];
  let prints = [];
  let raf = 0;
  let last = 0;
  const cells = () => (width < 560 ? [2, 3, 3] : [3, 4, 4]);
  const BANDS = 2;

  const sprite = (w) => {
    const gait = w.frame % WALK_FRAMES;
    const blinking = w.blinkIn <= 0;
    const key = `${w.coat}:${w.cell}:${w.dir}:${gait}:${blinking}`;
    if (!sprites.has(key)) sprites.set(key, walkSprite(WALK_COATS[w.coat], gait, blinking, w.cell, w.dir, ratio));
    return sprites.get(key);
  };
  const freeCoat = (others) => {
    const taken = new Set(others.map((w) => w.coat));
    const free = WALK_COATS.map((_, i) => i).filter((i) => !taken.has(i));
    return pick(free.length ? free : WALK_COATS.map((_, i) => i));
  };
  const make = (band, initial, others) => {
    const cell = pick(cells());
    const sw = WALK_CROP.width * cell;
    const sh = WALK_CROP.height * cell;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const bandH = (height * 0.92) / BANDS;
    return {
      x: Math.round(initial ? rand(-sw * 0.2, width - sw * 0.8) : dir === 1 ? -sw - 8 : width + 8),
      y: height * 0.03 + band * bandH + rand(0, Math.max(0, bandH - sh)),
      cell,
      frameMs: (rand(...WALK_CYCLE) * 1000) / WALK_FRAMES,
      dir,
      coat: freeCoat(others),
      band,
      frame: Math.floor(Math.random() * WALK_FRAMES),
      since: 0,
      blinkIn: rand(1500, 5000),
      wait: initial ? 0 : rand(1200, 4000),
    };
  };
  const seed = () => {
    prints = [];
    walkers = [];
    for (let b = 0; b < BANDS; b++) walkers.push(make(b, true, walkers));
  };
  const draw = (t) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#8a8170';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 11px ${MONO}`;
    for (const p of prints) {
      ctx.globalAlpha = 0.7 * Math.max(0, 1 - (t - p.born) / PRINT_LIFE_MS);
      ctx.fillText(p.glyph, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    for (const w of walkers) ctx.drawImage(sprite(w), w.x, Math.round(w.y), WALK_CROP.width * w.cell, WALK_CROP.height * w.cell);
  };
  const advance = (w, idx, ms, t) => {
    if (w.wait > 0) return { ...w, wait: w.wait - ms };
    const n = { ...w, since: w.since + ms, blinkIn: w.blinkIn - ms };
    if (n.blinkIn < -BLINK_MS) n.blinkIn = rand(2500, 6000);
    while (n.since >= n.frameMs) {
      n.since -= n.frameMs;
      n.frame += 1;
      n.x += w.cell * w.dir;
      // half-way through the cycle a back paw lands (walk.ts); the print stays where it landed
      const gait = n.frame % WALK_FRAMES;
      if (gait === 0 || gait === WALK_FRAMES / 2) {
        const sx = Math.round((gait === 0 ? 27 : 28.5) + 4.2 + 0.8);
        const col = w.dir === 1 ? sx - WALK_CROP.x : WALK_CROP.width - 1 - (sx - WALK_CROP.x);
        prints.push({ x: n.x + col * w.cell + w.cell / 2, y: n.y + (51 - WALK_CROP.y) * w.cell + 2, glyph: pick(PRINT_GLYPHS), born: t });
      }
    }
    const sw = WALK_CROP.width * w.cell;
    const gone = w.dir === 1 ? n.x > width + 16 : n.x < -sw - 16;
    return gone ? make(w.band, false, walkers.filter((_, i) => i !== idx)) : n;
  };
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const nextRatio = devicePixelRatio || 1;
    const changed = Math.round(r.width) !== width || Math.round(r.height) !== height;
    if (nextRatio !== ratio || changed) sprites.clear();
    ratio = nextRatio;
    width = Math.round(r.width);
    height = Math.round(r.height);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (changed || !walkers.length) seed();
    draw(performance.now());
  };
  const loop = (t) => {
    raf = requestAnimationFrame(loop);
    if (t - last < WALK_FRAME_MS) return;
    const ms = Math.min(t - last, 200);
    last = t;
    prints = prints.filter((p) => t - p.born < PRINT_LIFE_MS);
    walkers.forEach((w, i) => (walkers[i] = advance(w, i, ms, t)));
    draw(t);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  if (!still) {
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  return { el, destroy: () => (cancelAnimationFrame(raf), ro.disconnect()) };
}

/* ───────────────────────── Underwater enhancement ───────────────────────── */

function contrastStretch(src) {
  // Kamer's kontrastger(): ((c - min) * (240 - min) / (max - min)) + 10, per channel
  const out = new Uint8ClampedArray(src.length);
  for (let ch = 0; ch < 3; ch++) {
    let mn = 255;
    let mx = 0;
    for (let i = ch; i < src.length; i += 4) {
      if (src[i] < mn) mn = src[i];
      if (src[i] > mx) mx = src[i];
    }
    const k = (240 - mn) / Math.max(1, mx - mn);
    for (let i = ch; i < src.length; i += 4) out[i] = (src[i] - mn) * k + 10;
  }
  for (let i = 3; i < src.length; i += 4) out[i] = 255;
  return out;
}

function equalize(src) {
  // cv.equalizeHist on each channel
  const out = new Uint8ClampedArray(src.length);
  const total = src.length / 4;
  for (let ch = 0; ch < 3; ch++) {
    const hist = new Uint32Array(256);
    for (let i = ch; i < src.length; i += 4) hist[src[i]]++;
    let cdf = 0;
    let cdfMin = 0;
    const lut = new Uint8ClampedArray(256);
    for (let v = 0; v < 256; v++) {
      cdf += hist[v];
      if (!cdfMin && cdf) cdfMin = cdf;
      lut[v] = Math.round(((cdf - cdfMin) / Math.max(1, total - cdfMin)) * 255);
    }
    for (let i = ch; i < src.length; i += 4) out[i] = lut[src[i]];
  }
  for (let i = 3; i < src.length; i += 4) out[i] = 255;
  return out;
}

function drawHisto(canvas, data) {
  const w = (canvas.width = canvas.clientWidth * 2 || 300);
  const hh = (canvas.height = 92);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, hh);
  ctx.globalCompositeOperation = 'lighter';
  ['rgba(255,80,80,0.75)', 'rgba(80,255,140,0.75)', 'rgba(90,150,255,0.75)'].forEach((c, ch) => {
    const hist = new Float32Array(256);
    for (let i = ch; i < data.length; i += 4) hist[data[i]]++;
    const max = Math.max(...hist);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(0, hh);
    for (let v = 0; v < 256; v++) ctx.lineTo((v / 255) * w, hh - (hist[v] / max) * (hh - 4));
    ctx.lineTo(w, hh);
    ctx.closePath();
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
}

export function enhanceWidget() {
  const el = h(`
    <div class="widget">
      <div class="enhance">
        <canvas class="before"></canvas>
        <canvas class="after"></canvas>
        <div class="handle"></div>
        <span class="lbl l">Raw</span><span class="lbl r">Enhanced</span>
      </div>
      <div class="histos"><div><small>Histogram · raw</small><canvas class="hb"></canvas></div><div><small>Histogram · enhanced</small><canvas class="ha"></canvas></div></div>
      <div class="widget-bar">
        <div class="chips"><button class="chip on" data-mode="stretch">Contrast stretch</button><button class="chip" data-mode="eq">Histogram equalisation</button></div>
        <span class="widget-note">The underwater photo from my assignment, processed live in the browser</span>
      </div>
    </div>`);
  const wrap = el.querySelector('.enhance');
  const before = el.querySelector('.before');
  const after = el.querySelector('.after');
  let raw = null;
  let mode = 'stretch';
  const img = new Image();
  img.src = '/media/sualti.jpg';
  const render = () => {
    if (!raw) return;
    const out = mode === 'stretch' ? contrastStretch(raw.data) : equalize(raw.data);
    after.getContext('2d').putImageData(new ImageData(out, raw.width, raw.height), 0, 0);
    drawHisto(el.querySelector('.ha'), out);
  };
  img.onload = () => {
    [before, after].forEach((c) => {
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
    });
    const bctx = before.getContext('2d', { willReadFrequently: true });
    bctx.drawImage(img, 0, 0);
    raw = bctx.getImageData(0, 0, before.width, before.height);
    drawHisto(el.querySelector('.hb'), raw.data);
    render();
  };
  el.querySelectorAll('[data-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      mode = b.dataset.mode;
      el.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('on', x === b));
      render();
    }),
  );
  const split = { v: 50 };
  const setSplit = (v) => wrap.style.setProperty('--split', `${v}%`);
  const fromEvent = (e) => {
    const r = wrap.getBoundingClientRect();
    setSplit(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
  };
  let dragging = false;
  wrap.addEventListener('pointerdown', (e) => {
    dragging = true;
    wrap.setPointerCapture?.(e.pointerId);
    fromEvent(e);
  });
  wrap.addEventListener('pointermove', (e) => dragging && fromEvent(e));
  wrap.addEventListener('pointerup', () => (dragging = false));
  // a little sweep so people notice it can be dragged
  const sweep = gsap.fromTo(split, { v: 85 }, { v: 50, duration: 1.4, delay: 0.9, ease: 'expo.inOut', onUpdate: () => setSplit(split.v) });
  return { el, destroy: () => sweep.kill() };
}

/* ───────────────────────── Runner mini game ───────────────────────── */

export function runnerWidget() {
  const el = h(`
    <div class="widget">
      <div class="runner"><canvas width="160" height="70"></canvas></div>
      <div class="widget-bar"><span class="widget-note">Crusoe is running. <b>Space</b> or tap: jump, collect the hearts.</span></div>
    </div>`);
  const canvas = el.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const game = new RunnerGame({ w: 160, h: 70 });
  try {
    game.best = Number(localStorage.getItem('crusoe-best') || 0);
  } catch {
    /* storage unavailable */
  }
  const jump = () => {
    game.jump();
  };
  el.querySelector('.runner').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    jump();
  });
  const onKey = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
  };
  window.addEventListener('keydown', onKey);
  let raf = 0;
  let last = performance.now();
  const loop = (now) => {
    const dt = (now - last) / 1000;
    last = now;
    const events = game.step(dt);
    if (events.includes('dead')) {
      try {
        localStorage.setItem('crusoe-best', String(game.best));
      } catch {
        /* storage unavailable */
      }
    }
    game.draw(ctx);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return {
    el,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
    },
  };
}

/* ───────────────────────── Haneko health score ───────────────────────── */

// A port of Haneko's own HealthScoreCard (webapp/src/components/health-score-card.tsx, light theme):
// a 270° arc that fills to the score with a gradient in the band's colour and a ringed dot at its
// tip, an odometer number whose digits roll (a higher digit only turns at the very end of the lower
// one's turn, like a real counter), the band label, "Why not 100?" with the issues by severity, and
// the list that opens below. Labels are Haneko's English UI text; the score and issues are samples.
const HK = { success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
const ARC = [-135, 135];
const G = { size: 92, stroke: 8 };
G.r = (G.size - G.stroke) / 2 - 1;
const polar = (a) => {
  const rad = ((a - 90) * Math.PI) / 180;
  return { x: G.size / 2 + G.r * Math.cos(rad), y: G.size / 2 + G.r * Math.sin(rad) };
};
const arcD = (() => {
  const s = polar(ARC[0]);
  const e = polar(ARC[1]);
  return `M ${s.x} ${s.y} A ${G.r} ${G.r} 0 1 1 ${e.x} ${e.y}`;
})();
const HEALTH = {
  score: 72,
  issues: [
    ['yuksek', 'A tax filing is due in 3 days'],
    ['orta', 'Cash covers less than 3 months of expenses'],
    ['dusuk', 'Two invoices have been unpaid for over 30 days'],
  ],
};
const SEV = { kritik: ['Critical', 'error'], yuksek: ['High', 'error'], orta: ['Medium', 'warning'], dusuk: ['Low', 'success'] };
const DIGIT_H = 28;

export function healthWidget() {
  const score = HEALTH.score;
  const band = score >= 80 ? ['Good', HK.success] : score >= 50 ? ['Fair', HK.warning] : ['At risk', HK.error];
  const places = Array.from({ length: String(score).length }, (_, i) => 10 ** (String(score).length - 1 - i));
  const counts = Object.keys(SEV)
    .map((k) => [k, HEALTH.issues.filter(([s]) => s === k).length])
    .filter(([, n]) => n);
  const badge = (k) => `<span class="hk-badge" style="--tone:${HK[SEV[k][1]]}">${SEV[k][0]}</span>`;
  const el = h(`
    <div class="widget hk-wrap">
      <div class="hk-card" style="--band:${band[1]}">
        <div class="hk-row">
          <div class="hk-gauge">
            <svg width="${G.size}" height="${G.size}" viewBox="0 0 ${G.size} ${G.size}" aria-hidden="true">
              <defs><linearGradient id="hk-grad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stop-color="${band[1]}" stop-opacity="0.45" /><stop offset="100%" stop-color="${band[1]}" />
              </linearGradient></defs>
              <path d="${arcD}" fill="none" stroke="rgb(204 203 206 / 0.5)" stroke-width="${G.stroke}" stroke-linecap="round" />
              <path class="hk-fill" d="${arcD}" fill="none" stroke="url(#hk-grad)" stroke-width="${G.stroke}" stroke-linecap="round" />
              <circle class="hk-tip" r="4.5" fill="#fefeff" stroke="${band[1]}" stroke-width="3" />
            </svg>
            <div class="hk-num" role="img" aria-label="Health score ${score} out of 100">
              <span class="hk-digits">${places.map(() => `<span class="hk-digit"><span>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<i>${d}</i>`).join('')}</span></span>`).join('')}</span>
              <span class="hk-of">/ 100</span>
            </div>
          </div>
          <div class="hk-mid">
            <div class="hk-head">
              <h4>Health Score</h4>
              <span class="hk-band">${band[0]}</span>
            </div>
            <div class="hk-why">
              <button type="button" class="hk-btn" aria-expanded="false">Why not 100?
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>
              <div class="hk-counts">${counts.map(([k, n]) => `<span>${badge(k)}<b>${n}</b></span>`).join('')}</div>
            </div>
          </div>
        </div>
        <div class="hk-list"><ul>${HEALTH.issues.map(([k, t]) => `<li>${badge(k)}<span>${t}</span></li>`).join('')}</ul></div>
      </div>
      <div class="widget-bar"><span class="widget-note">Haneko’s health score card · sample data</span></div>
    </div>`);

  const fill = el.querySelector('.hk-fill');
  const tip = el.querySelector('.hk-tip');
  const strips = [...el.querySelectorAll('.hk-digit > span')];
  const len = fill.getTotalLength();
  fill.style.strokeDasharray = `${len} ${len + 1}`;
  const set = (v) => {
    fill.style.strokeDashoffset = `${len * (1 - v / 100)}`;
    const p = polar(ARC[0] + (ARC[1] - ARC[0]) * (v / 100));
    tip.setAttribute('cx', p.x);
    tip.setAttribute('cy', p.y);
    strips.forEach((s, i) => {
      const scaled = v / places[i];
      const whole = Math.floor(scaled);
      s.style.transform = `translateY(${-((whole % 10) + (scaled - whole) ** 10) * DIGIT_H}px)`;
    });
  };
  set(0);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = { v: 0 };
  const tl = gsap.timeline({ delay: 0.5 });
  tl.to(state, { v: score, duration: 1.4, ease: 'expo.out', onUpdate: () => set(state.v) });
  tl.add(() => el.querySelector('.hk-card').classList.add('in'), 0.55);
  if (still) tl.progress(1);

  const btn = el.querySelector('.hk-btn');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    el.querySelector('.hk-card').classList.toggle('open', open);
  });
  return { el, destroy: () => tl.kill() };
}

/* ───────────────────────── Logo draw ───────────────────────── */

export function logoWidget() {
  const el = h(`
    <div class="widget">
      <div class="logo-draw">
        <svg viewBox="13 5 38 53" aria-label="Kamer Can logo">
          <circle class="ld-ring" cx="32" cy="42" r="12.5" stroke-width="3.4" />
          <path class="ld-bars" d="M19.39 40.38 L32 9 L44.61 40.38" stroke-width="3.8" />
        </svg>
      </div>
    </div>`);
  return { el };
}

export const WIDGETS = {
  enhance: enhanceWidget,
  runner: runnerWidget,
  health: healthWidget,
  logo: logoWidget,
  cats: catsWidget,
  catHero: catHeroWidget,
  catWalk: catWalkWidget,
};
