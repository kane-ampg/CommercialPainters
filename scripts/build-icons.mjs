#!/usr/bin/env node
/**
 * App icon builder.
 *
 * Renders public/images/company/apmg-badge.png (the group's circular badge —
 * red ring, ink ground, white pediment over APMG) into the icon files Next.js
 * picks up by convention from `app/`.
 *
 * The source is a 1169x896 canvas with the badge sitting on a flat grey
 * backdrop, a stray sparkle glyph in the bottom-right corner and the ring
 * clipped by the top and bottom edges. So the badge is cut out of it, padded
 * back to a true square and masked to its own circle — which drops the
 * backdrop and the sparkle with it.
 *
 * Outputs:
 *   app/favicon.ico    16, 32 and 48px PNG frames in an ICO container
 *   app/icon.png       192px, the <link rel="icon"> browsers and Android use
 *   app/apple-icon.png 180px, the iOS home-screen icon
 *
 * Run with `npm run icons:build` after replacing the source png. A different
 * source almost certainly needs new BADGE numbers — re-derive them by finding
 * the bounding box of the ring's red pixels.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = path.join(ROOT, 'public/images/company/apmg-badge.png');
const OUT = path.join(ROOT, 'app');

// Same ink as lib/brand/og-fonts.ts OG_INK.
const INK = '#1C1C1C';
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/**
 * The badge's bounding box in the source, measured from the red ring. The
 * circle is 922px across but the canvas is only 896 tall, so the ring is
 * clipped by 13px at the top and the same at the bottom — PAD puts those rows
 * back by replicating the edge, which is a hair wider than a true circle cap
 * over 1.4% of the diameter and invisible at every size below.
 */
const BADGE = { left: 122, top: 0, width: 922, height: 896 };
const DIAMETER = BADGE.width;
const PAD = (DIAMETER - BADGE.height) / 2;

/** The badge alone: square canvas, circular mark, transparent outside the ring. */
async function cutBadge() {
  const squared = await sharp(SOURCE)
    .extract(BADGE)
    .extend({ top: PAD, bottom: PAD, extendWith: 'copy' })
    .png()
    .toBuffer();

  const circle = Buffer.from(
    `<svg width="${DIAMETER}" height="${DIAMETER}">` +
      `<circle cx="${DIAMETER / 2}" cy="${DIAMETER / 2}" r="${DIAMETER / 2}" fill="#fff"/>` +
      `</svg>`,
  );

  return sharp(squared).composite([{ input: circle, blend: 'dest-in' }]).png().toBuffer();
}

/**
 * One icon file.
 *
 * The defaults are what every icon but one wants: the badge edge to edge on
 * transparency, so it reads as a circle rather than a square with a circle
 * printed on it, and so it sits on a light search result and a dark browser
 * tab equally well. `apple-icon` is the exception and overrides both — iOS
 * renders transparent pixels black and masks the icon to its own squircle, so
 * it keeps the brand's ink behind it and a little margin inside the mask.
 */
async function renderIcon(badge, size, { fill = 1, ground = TRANSPARENT } = {}) {
  const inner = Math.round(size * fill);
  const mark = await sharp(badge)
    .resize({ width: inner, height: inner, fit: 'inside', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: ground },
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
    e.writeUInt16LE(32, 6); // bpp — 32 so the transparent corners survive
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...frames.map((f) => f.data)]);
}

await mkdir(OUT, { recursive: true });

const badge = await cutBadge();

const icoFrames = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await renderIcon(badge, size) })),
);
await writeFile(path.join(OUT, 'favicon.ico'), ico(icoFrames));
await writeFile(path.join(OUT, 'icon.png'), await renderIcon(badge, 192));
await writeFile(path.join(OUT, 'apple-icon.png'), await renderIcon(badge, 180, { fill: 0.92, ground: INK }));

console.log('wrote app/favicon.ico, app/icon.png, app/apple-icon.png');
