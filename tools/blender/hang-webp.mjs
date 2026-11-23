// Turns the Blender cut-outs (tools/blender/hangings.py) into WebP with alpha and writes their sizes
// for the site: node tools/blender/hang-webp.mjs
import sharp from 'sharp';
import fs from 'node:fs';

const dir = 'public/media/hang';
const sizes = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.png'))) {
  const name = f.replace('.png', '');
  const img = sharp(`${dir}/${f}`);
  const { width, height } = await img.metadata();
  await img.webp({ quality: 86, alphaQuality: 90 }).toFile(`${dir}/${name}.webp`);
  fs.unlinkSync(`${dir}/${f}`);
  sizes[name] = [width, height];
}
fs.writeFileSync('src/hang-sizes.json', JSON.stringify(sizes, null, 0) + '\n');
console.log(Object.keys(sizes).length, 'images', fs.readdirSync(dir).reduce((n, f) => n + fs.statSync(`${dir}/${f}`).size, 0) >> 10, 'KB');
