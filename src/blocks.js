// Content blocks (from content.js) rendered as HTML, plus the drifting photo strips.

const ICONS = {
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4h4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4V5Z"/>',
  book: '<path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4V4Zm0 12a4 4 0 0 1 4-4h10"/>',
  chart: '<path d="M4 20V4m0 16h16M8 16l4-5 3 3 5-7"/>',
};
const ARROW = '<svg class="arrow" viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg>';
// buttons show where they go: brand marks for the sites, simple line icons for the rest
const FILLED = {
  github:
    'M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3',
  linkedin:
    'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z',
  play: 'M7 4.5v15l12.5-7.5z',
};
const LINED = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r=".6" fill="currentColor"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.8 5.7 3.8 9s-1.2 6.3-3.8 9c-2.6-2.7-3.8-5.7-3.8-9S9.4 5.7 12 3Z"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
  arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
};
function linkIcon(href, label) {
  const kind = href.startsWith('mailto:')
    ? 'mail'
    : /github\.com/.test(href)
      ? 'github'
      : /linkedin\.com/.test(href)
        ? 'linkedin'
        : /instagram\.com/.test(href)
          ? 'instagram'
          : /leetcode\.com/.test(href)
            ? 'code'
            : /^play/i.test(label) || /scratch\.mit\.edu/.test(href)
              ? 'play'
              : /haneko\.co/.test(href)
                ? 'globe'
                : 'arrow';
  return FILLED[kind]
    ? `<svg class="ico fill" viewBox="0 0 24 24" aria-hidden="true"><path d="${FILLED[kind]}"/></svg>`
    : `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${LINED[kind]}</svg>`;
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
/** "*word*" in a title becomes the italic, accent-coloured part. */
export const emTitle = (t) => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');

function linkAttrs(href) {
  return href.startsWith('mailto:') ? `href="${href}"` : `href="${href}" target="_blank" rel="noopener"`;
}

// A project that opens on click: screenshots from the real app, the stack, and the link if it's public.
function projectCard(c) {
  const shots = c.shots
    ? `<div class="gallery proj-shots">${c.shots
        .map(([src, cap]) => `<figure class="hung" tabindex="0" role="button" data-zoom="${src}" data-caption="${esc(cap)}"><img src="${src}" alt="${esc(cap)}" loading="lazy" /><figcaption>${esc(cap)}</figcaption></figure>`)
        .join('')}</div>`
    : '';
  const tags = c.tags ? `<ul class="tags">${c.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
  const link = c.href ? `<div class="links"><a class="btn" ${linkAttrs(c.href)}>${linkIcon(c.href, '')}${/github\.com/.test(c.href) ? 'See it on GitHub' : 'Open'}</a></div>` : '';
  return `<details class="card proj">
    <summary>
      <div class="card-top"><h4>${esc(c.title)}</h4>${c.meta ? `<span class="meta">${esc(c.meta)}</span>` : ''}</div>
      <p>${esc(c.text)}</p>
      <span class="proj-toggle" aria-hidden="true"><svg viewBox="0 0 24 24"><path class="h" d="M7.5 12h9" /><path class="v" d="M12 7.5v9" /></svg></span>
    </summary>
    <div class="proj-body">${shots}${tags}${link}</div>
  </details>`;
}

export function block(b) {
  switch (b.type) {
    case 'p':
      return `<p class="blk blk-p">${b.text}</p>`;
    case 'h':
      return `<h3 class="blk blk-h"${b.lang ? ` lang="${b.lang}"` : ''}>${esc(b.text)}</h3>`;
    case 'facts':
      return `<div class="blk facts">${b.items.map(([k, v]) => `<div class="fact"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
    case 'stats':
      return `<div class="blk stats">${b.items.map(([v, k]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join('')}</div>`;
    case 'sub':
      return `<h4 class="blk blk-sub">${esc(b.text)}</h4>`;
    case 'titles':
      return `<ul class="blk titles">${b.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    case 'tags':
      return `<ul class="blk tags">${b.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    case 'timeline':
      return `<ol class="blk timeline">${b.items.map(([d, t, s]) => `<li><time>${esc(d)}</time><b>${esc(t)}</b><span>${esc(s)}</span></li>`).join('')}</ol>`;
    case 'links':
      return `<div class="blk links">${b.items
        .map((l) => `<a class="btn${l.primary ? ' primary' : ''}" ${linkAttrs(l.href)}>${linkIcon(l.href, l.label)}${esc(l.label)}</a>`)
        .join('')}</div>`;
    case 'cards':
      if (b.expand) return `<div class="blk cards">${b.items.map(projectCard).join('')}</div>`;
      return `<div class="blk cards">${b.items
        .map((c) => {
          const inner = `<div class="card-top"><h4>${esc(c.title)}</h4>${c.meta ? `<span class="meta">${esc(c.meta)}</span>` : ''}</div><p>${esc(c.text)}</p>${
            c.tags ? `<ul class="tags">${c.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''
          }`;
          const cls = `card${b.mini ? ' mini' : ''}`;
          return c.href ? `<a class="${cls}" ${linkAttrs(c.href)}>${inner}${ARROW}</a>` : `<div class="${cls}">${inner}</div>`;
        })
        .join('')}</div>`;
    case 'features':
      return `<div class="blk cards grid2">${b.items
        .map(([icon, t, s]) => `<div class="card mini"><div class="card-ico"><svg viewBox="0 0 24 24">${ICONS[icon]}</svg></div><h4>${esc(t)}</h4><p>${esc(s)}</p></div>`)
        .join('')}</div>`;
    case 'stack':
      return `<div class="blk stack">${b.items.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>`;
    case 'img':
      return `<figure class="blk figure hung" tabindex="0" role="button" data-zoom="${b.src}" data-caption="${esc(b.caption || '')}"><img src="${b.src}" alt="${esc(b.alt)}" loading="lazy" />${
        b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''
      }</figure>`;
    case 'gallery':
      return `<div class="blk gallery${b.tall ? ' tall' : ''}">${b.items
        .map(([src, cap]) => `<figure class="hung" tabindex="0" role="button" data-zoom="${src}" data-caption="${esc(cap)}"><img src="${src}" alt="${esc(cap)}" loading="lazy" /><figcaption>${esc(cap)}</figcaption></figure>`)
        .join('')}</div>`;
    case 'quote':
      return `<blockquote class="blk quote">${esc(b.text)}<cite>${esc(b.cite)}</cite></blockquote>`;
    case 'code':
      return `<pre class="blk code">${b.html}</pre>`;
    case 'profile':
      return `<div class="blk profile"><figure class="hung"><img src="${b.img}" alt="Kamer Can" /></figure><p>${esc(b.text)}</p></div>`;
    case 'widget':
      return `<div class="blk" data-widget="${b.name}"></div>`;
    default:
      return '';
  }
}

/** Photo strips drift sideways on their own, pause while hovered or touched, and can be dragged with the mouse. */
export function driftGallery(el) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pos = 0;
  let dir = 1;
  let hold = false;
  let drag = null;
  let moved = false;
  let resume = 0;
  let last = performance.now();
  let raf = 0;
  const tick = (now) => {
    const dt = Math.min(48, now - last);
    last = now;
    const max = el.scrollWidth - el.clientWidth;
    if (!still && !hold && !drag && max > 4) {
      pos += dir * dt * 0.035;
      if (pos >= max) dir = -1;
      else if (pos <= 0) dir = 1;
      pos = Math.max(0, Math.min(max, pos));
      el.scrollLeft = pos;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  const pause = (ms = 0) => {
    hold = true;
    clearTimeout(resume);
    if (ms) resume = setTimeout(() => (hold = false), ms);
  };
  el.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && pause());
  el.addEventListener('pointerleave', (e) => e.pointerType === 'mouse' && !drag && (hold = false));
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return pause(3500);
    drag = { x: e.clientX, left: el.scrollLeft };
    moved = false;
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    // only a real drag takes the pointer; a plain click must still reach the photo (it opens it large)
    if (!moved && Math.abs(dx) > 5) {
      moved = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
    }
    if (!moved) return;
    el.scrollLeft = drag.left - dx;
    pos = el.scrollLeft;
  });
  const end = () => {
    drag = null;
    el.classList.remove('dragging');
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        pos = el.scrollLeft;
        pause(3500);
      }
    },
    { passive: true },
  );
  // a drag must not count as a click on a photo (that opens the lightbox)
  el.addEventListener(
    'click',
    (e) => {
      if (moved) {
        e.stopPropagation();
        moved = false;
      }
    },
    true,
  );
  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(resume);
  };
}
