import './site.css';
import { SECTIONS, LINKS } from './content.js';
import { block, emTitle, esc, driftGallery } from './blocks.js';
import { WIDGETS } from './widgets.js';
import HANG_SIZES from './hang-sizes.json';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ───────────────────────── Hanging pieces (Blender renders) ───────────────────────── */

// Real-looking beads, a glass drop, a brass bell and a yarn tassel, rendered as cut-outs by
// tools/blender/hangings.py. Every image's top edge is its hanging point.
const HANG = '/media/hang/';
const px = (name, div) => HANG_SIZES[name].map((v) => Math.round(v / div));

function pendant(id, thread) {
  const [w, h] = px(`orn-${id}`, 1.55);
  return `
    <div class="pendant" data-swing="${(0.85 + thread / 400).toFixed(2)}" style="--thread:${thread}px;--ow:${w}px;--oh:${h}px" aria-hidden="true">
      <span class="pendant-thread"></span>
      <img class="pendant-ornament" src="${HANG}orn-${id}.webp" width="${w}" height="${h}" alt="" loading="lazy" />
    </div>`;
}

/* ───────────────────────── Beaded fringe ───────────────────────── */

// A brass rail with bead strands laid out at their real size for the current width (so nothing gets
// stretched or cut off); each strand swings a little more or less than the rest.
const STRANDS = Object.keys(HANG_SIZES).filter((k) => k.startsWith('strand-'));
function layFringe(el) {
  const W = el.clientWidth;
  if (!W || Number(el.dataset.w) === W) return;
  el.dataset.w = W;
  const r = rng(Number(el.dataset.seed));
  const out = [];
  for (let x = 6 + r() * 10; x < W - 6; x += 17 + r() * 13) {
    const name = STRANDS[Math.floor(r() * STRANDS.length)];
    const [w, h] = px(name, 2);
    // scale each strand a little so neighbours never line up
    const k = 0.78 + r() * 0.34;
    out.push(
      `<img class="strand" src="${HANG}${name}.webp" alt="" loading="lazy" style="left:${(x - (w * k) / 2).toFixed(1)}px;width:${(w * k).toFixed(1)}px;height:${(h * k).toFixed(1)}px;--f:${(0.6 + r() * 0.9).toFixed(2)}" />`,
    );
  }
  el.querySelector('.strands').innerHTML = out.join('');
}
const fringe = (seed) => `
  <div class="fringe" data-swing="1" data-seed="${seed}" aria-hidden="true"><span class="rail"></span><div class="strands"></div></div>`;

/* ───────────────────────── Page ───────────────────────── */

const sectionsEl = $('#sections');
sectionsEl.innerHTML = SECTIONS.map((s, i) => {
  return `
    ${fringe(7 + i * 31)}
    <section class="sec" id="${s.id}" style="--accent:${s.accent}" aria-labelledby="t-${s.id}">
      <header class="sec-head">
        ${pendant(s.id, 60 + ((i * 37) % 60))}
        <h2 class="sec-title" id="t-${s.id}">${emTitle(s.title)}</h2>
        <p class="sec-lead">${esc(s.lead)}</p>
      </header>
      <div class="sec-body">${s.blocks.map(block).join('')}</div>
    </section>`;
}).join('');

// contact: tags hanging from a rail
const CONTACT = [
  ['GitHub', LINKS.github],
  ['LinkedIn', LINKS.linkedin],
  ['Instagram', LINKS.instagram],
  ['LeetCode', LINKS.leetcode],
  ['Email', LINKS.email],
];
$('#tags').innerHTML = CONTACT.map(
  ([label, href], i) => `
    <a class="tag" data-swing="${(1 + i * 0.12).toFixed(2)}" style="--thread:${30 + ((i * 29) % 46)}px" href="${href}"${
      href.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener"'
    }>
      <span class="tag-thread"></span><span class="tag-body"><img src="${HANG}tag.webp" alt="" width="${px('tag', 2)[0]}" height="${px('tag', 2)[1]}" /><b>${label}</b></span>
    </a>`,
).join('');

// hero: three ornaments hang into its empty space — on a wide screen from the top edge, between the
// greeting and the button; on a phone into the band between the button and the name.
// [section ornament, place across the gap between greeting and button (0–1), thread px wide,
//  left % phone, thread px phone]
const HERO_HANG = [
  ['about', 0.1, 24, 20, 40],
  ['design', 0.5, 110, 52, 230],
  ['guitar', 0.9, 46, 82, 110],
];
$('#hero-hang').innerHTML = HERO_HANG.map(([id, x, t, xm, tm]) => {
  const [w, h] = px(`orn-${id}`, 1.9);
  return `
    <div class="pendant hero-pendant" data-x="${x}" style="--x:${x * 100}%;--t:${t}px;--xm:${xm}%;--tm:${tm}px;--ow:${w}px;--oh:${h}px">
      <span class="pendant-thread"></span>
      <img class="pendant-ornament" src="${HANG}orn-${id}.webp" width="${w}" height="${h}" alt="" />
    </div>`;
}).join('');

const fringes = $$('.fringe');
fringes.forEach(layFringe);
let resizeT = 0;
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => fringes.forEach((f) => (layFringe(f), bindFringe(f))), 150);
});

// header links
$('#nav').innerHTML = SECTIONS.map((s) => `<a href="#${s.id}" style="--accent:${s.accent}">${esc(s.kicker)}</a>`).join('');
$('#menu-list').innerHTML = SECTIONS.map(
  (s, i) => `<li><a href="#${s.id}" style="--accent:${s.accent}"><span>${pad(i + 1)}</span><b>${emTitle(s.title)}</b></a></li>`,
).join('');

/* ───────────────────────── Widgets, photo strips, lightbox ───────────────────────── */

// widgets start when they come near the screen and stop (their animation loops too) once far away again
const live = new Map();
const mount = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      const slot = e.target;
      const make = WIDGETS[slot.dataset.widget];
      if (!make) return;
      if (e.isIntersecting && !live.has(slot)) {
        const w = make();
        slot.replaceChildren(w.el);
        live.set(slot, w);
      } else if (!e.isIntersecting && live.has(slot) && live.get(slot).destroy) {
        live.get(slot).destroy();
        live.delete(slot);
        slot.style.minHeight = `${slot.offsetHeight}px`; // keep its place so the page doesn't jump
        slot.replaceChildren();
      }
    }),
  { rootMargin: '600px 0px' },
);
$$('[data-widget]').forEach((el) => mount.observe(el));
$$('.gallery').forEach(driftGallery);

const lb = $('#lightbox');
let lbFrom = null;
function zoom(z) {
  lbFrom = z;
  $('img', lb).src = z.dataset.zoom;
  $('img', lb).alt = z.dataset.caption || '';
  $('figcaption', lb).textContent = z.dataset.caption || '';
  lb.hidden = false;
  $('.lb-close', lb).focus();
}
function closeZoom() {
  if (lb.hidden) return;
  lb.hidden = true;
  lbFrom?.focus();
}
document.addEventListener('click', (e) => {
  const z = e.target.closest('[data-zoom]');
  if (z) zoom(z);
});
lb.addEventListener('click', closeZoom);
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeZoom();
    toggleMenu(false);
  }
  const z = e.target.closest?.('[data-zoom]');
  if (z && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    zoom(z);
  }
});

/* ───────────────────────── Header and menu ───────────────────────── */

const bar = $('#bar');
const menu = $('#menu');
function toggleMenu(show = menu.hidden) {
  menu.hidden = !show;
  $('#btn-menu').setAttribute('aria-expanded', String(show));
  document.body.classList.toggle('menu-open', show);
}
$('#btn-menu').addEventListener('click', () => toggleMenu());
menu.addEventListener('click', (e) => (e.target.closest('a') || e.target === menu) && toggleMenu(false));
$('.hero-enter').addEventListener('click', () => $('#about').scrollIntoView({ behavior: still ? 'auto' : 'smooth' }));

new IntersectionObserver(([e]) => bar.classList.toggle('show', !e.isIntersecting), { rootMargin: '-60% 0px 0px 0px' }).observe($('#hero'));
const navLinks = new Map($$('#nav a').map((a) => [a.hash.slice(1), a]));
const sectionSpy = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) navLinks.forEach((a, id) => a.classList.toggle('on', id === e.target.id));
    }),
  { rootMargin: '-45% 0px -50% 0px' },
);
$$('.sec').forEach((s) => sectionSpy.observe(s));

/* ───────────────────────── Reveal ───────────────────────── */

const reveal = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        reveal.unobserve(e.target);
      }
    }),
  { rootMargin: '0px 0px -12% 0px' },
);
$$('.sec-head, .sec-body > .blk, .foot-head').forEach((el) => reveal.observe(el));

/* ───────────────────────── Pendulums ───────────────────────── */

// Everything that hangs is its own little pendulum: long strands swing slowly, short ones quicker, and
// each one a bit differently. A change in scroll speed gives them a push (like a door opening on a
// bead curtain); after that they swing back and forth on their own and settle. A faint breeze keeps
// them from looking frozen when nothing moves. Hover gives a pendant or a tag a nudge.
const TAU = Math.PI * 2;
function bob(el, length, push = 1, max = 9, breeze = 1) {
  const period = 0.95 + 0.0055 * length; // seconds; ~1.3 s for a short strand, ~2 s for a long pendant
  return { el, w: TAU / period, z: 0.085, a: 0, v: 0, g: (0.75 + Math.random() * 0.5) * push, max, breeze, p1: Math.random() * TAU, p2: Math.random() * TAU };
}
const groups = new Map(); // observed element -> { items, on }
function setGroup(el, items) {
  const g = groups.get(el) || { items: [], on: false };
  g.items = items;
  groups.set(el, g);
  return g;
}
function bindFringe(f) {
  setGroup(f, $$('.strand', f).map((img) => bob(img, parseFloat(img.style.height) || 120)));
}
fringes.forEach(bindFringe);
// The hover nudge is small and comes only from a moving mouse, at most every 1.5 s: otherwise a tag
// swinging back under a resting cursor got pushed again and again and jittered (flicker).
let pointerMovedAt = 0;
addEventListener('pointermove', () => (pointerMovedAt = performance.now()), { passive: true });
$$('.pendant, .tag').forEach((el) => {
  const b = bob(el, el.offsetHeight || 160, 1.2);
  setGroup(el, [b]);
  let nudgedAt = -Infinity;
  el.addEventListener('pointerenter', (e) => {
    const now = performance.now();
    if (e.pointerType !== 'mouse' || now - pointerMovedAt > 100 || now - nudgedAt < 1500) return;
    nudgedAt = now;
    b.v += (Math.random() < 0.5 ? -1 : 1) * 14;
  });
});
// hero: the button hangs on a thread from the top of the page (wide screens only, where nothing sits
// above it). The name itself stays still.
const enter = $('.hero-enter');
const enterBob = bob(enter, 300, 0.55, 2.5, 0.6);
setGroup(enter, [enterBob]);
const wide = matchMedia('(min-width: 821px)');
const hangEnter = () => {
  enterBob.off = !wide.matches;
  if (enterBob.off) enter.style.transform = '';
  else enter.style.setProperty('--hang', `${Math.round(enter.getBoundingClientRect().top + scrollY)}px`);
  // wide screens: the ornaments share the free gap between the greeting and the button, whatever the
  // width (phones place them with CSS)
  // only as many as fit (three, two or just the bell) so they never crowd each other
  const hang = $('#hero-hang');
  const from = $('.ld-text').getBoundingClientRect().right + 40 - hang.getBoundingClientRect().left;
  const to = enter.getBoundingClientRect().left - 40 - hang.getBoundingClientRect().left;
  const fit = Math.max(1, Math.min(3, Math.floor((to - from) / 72)));
  const spots = { 3: [0.1, 0.5, 0.9], 2: [0.15, null, 0.85], 1: [null, 0.5, null] }[fit];
  $$('.hero-pendant', hang).forEach((p, i) => {
    const at = wide.matches ? spots[i] : Number(p.dataset.x);
    p.hidden = at === null;
    p.style.left = wide.matches && at !== null ? `${Math.round(from + at * (to - from) - p.offsetWidth / 2)}px` : '';
  });
};
hangEnter();
wide.addEventListener('change', hangEnter);
addEventListener('resize', hangEnter);
const seen = new IntersectionObserver((entries) => entries.forEach((e) => (groups.get(e.target).on = e.isIntersecting)), {
  rootMargin: '160px 0px',
});
groups.forEach((_, el) => seen.observe(el));

if (!still) {
  let lastY = scrollY;
  let lastT = performance.now();
  let vel = 0;
  let prevVel = 0;
  let t = 0;
  const loop = (now) => {
    const dt = Math.min(0.05, (now - lastT) / 1000) || 0.016;
    lastT = now;
    t += dt;
    const y = scrollY;
    vel += ((y - lastY) / dt - vel) * Math.min(1, dt * 18); // smoothed px/s
    lastY = y;
    const dv = Math.max(-4000, Math.min(4000, vel - prevVel)); // how much the scroll speed changed this frame
    prevVel = vel;
    const h = dt / 2;
    for (const g of groups.values()) {
      if (!g.on) continue;
      for (const b of g.items) {
        if (b.off) continue;
        b.v -= dv * 0.0105 * b.g;
        for (let i = 0; i < 2; i++) {
          b.v += (-b.w * b.w * b.a - 2 * b.z * b.w * b.v) * h;
          b.a += b.v * h;
        }
        if (b.a > b.max) (b.a = b.max), (b.v *= -0.3);
        else if (b.a < -b.max) (b.a = -b.max), (b.v *= -0.3);
        const breeze = (0.32 * Math.sin(t * b.w * 0.33 + b.p1) + 0.12 * Math.sin(t * 1.27 + b.p2)) * b.breeze;
        b.el.style.transform = `rotate(${(b.a + breeze).toFixed(2)}deg)`;
      }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
