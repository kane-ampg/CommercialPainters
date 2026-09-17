#!/usr/bin/env node
/**
 * App icon builder.
 *
 * Renders public/images/company/favicon.webp (the group logo lockup, white on
 * transparent) into the icon files Next.js picks up by convention from
 * `app/`. The lockup is 4:3 and white, so it is set on the brand's ink
 * ground and letterboxed to a square: white-on-transparent vanishes on a
 * light browser tab, and the file conventions want a square.
 *
 * Outputs:
 *   app/favicon.ico    16, 32 and 48px PNG frames in an ICO container
 *   app/icon.png       192px, the <link rel="icon"> browsers and Android use
 *   app/apple-icon.png 180px, the iOS home-screen icon
 *
 * Run with `npm run icons:build` after replacing the source webp.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'public/images/company/favicon.webp');
const OUT = path.join(ROOT, 'app');

// Same ink as lib/brand/og-fonts.ts OG_INK.
const INK = '#1C1C1C';

// Fraction of the canvas the lockup may fill. Smaller icons get a hair less
// margin so the letters keep as many pixels as possible.
const FILL = (size) => (size <= 48 ? 0.94 : 0.82);

async function renderIcon(size) {
  const inner = Math.round(size * FILL(size));
  const mark = await sharp(SOURCE)
    .resize({
      width: inner,
      height: inner,
      fit: 'inside',
      kernel: 'lanczos3',
    })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: INK },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Wrap PNG frames in an ICO directory. PNG-in-ICO is supported everywhere that matters (IE11+). */
function ico(frames) {
  const HEADER = 6;
  const ENTRY = 16;
  const header = Buffer.alloc(HEADER);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  let offset = HEADER + ENTRY * frames.length;
  const entries = frames.map(({ size, data }) => {
    const e = Buffer.alloc(ENTRY);
    e.writeUInt8(size === 256 ? 0 : size, 0);
    e.writeUInt8(size === 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...frames.map((f) => f.data)]);
}

await mkdir(OUT, { recursive: true });

const icoFrames = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await renderIcon(size) })),
);
await writeFile(path.join(OUT, 'favicon.ico'), ico(icoFrames));
await writeFile(path.join(OUT, 'icon.png'), await renderIcon(192));
await writeFile(path.join(OUT, 'apple-icon.png'), await renderIcon(180));

console.log('wrote app/favicon.ico, app/icon.png, app/apple-icon.png');
