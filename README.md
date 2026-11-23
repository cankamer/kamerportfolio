# Kamer Can — portfolio

A single scrolling page about my work: software, Haneko, guitar, the underwater vehicle, games,
design and electronics. The look is bohemian and "pendulous": bead fringes between sections and
ornaments, tags and the hero button that hang on threads and swing when the scroll speed changes.

Plain HTML, CSS and JavaScript built with [Vite](https://vite.dev). No framework.

```bash
npm install
npm run dev      # http://localhost:5180
npm run build    # static site in dist/
```

## Where things are

| Path | What |
|---|---|
| `index.html` | Hero, header, contact footer, lightbox |
| `src/content.js` | All page content: sections and their blocks |
| `src/site.js` | Renders the sections, menu, lightbox and the pendulum physics |
| `src/blocks.js` | HTML for each content block (cards, galleries, links, project cards) |
| `src/widgets.js` | Interactive pieces: Haneko health score, underwater image enhancement, runner game, logo, Haneko pixel cats |
| `src/pixelcat/` | Haneko's pixel-cat engine, ported from the Haneko web app |
| `public/media/` | Photos and in-app screenshots (`projects/`), hanging pieces (`hang/`) |
| `tools/blender/` | `hangings.py` renders the beads, ornaments and tag in Blender; `hang-webp.mjs` turns them into WebP and writes `src/hang-sizes.json` |

Deployed on Vercel (`vercel.json`).
