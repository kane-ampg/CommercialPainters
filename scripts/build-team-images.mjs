#!/usr/bin/env node
/**
 * Team portrait encoder.
 *
 * The portraits are a studio set: everyone photographed against the same
 * office glass, at the same framing, roughly 1000x1134 and 1.5 MB a frame.
 * Like the shoot masters they are sources, not web assets. They live in
 * `media/team/`, which is gitignored, and only what this script writes is
 * deployed.
 *
 * Every shirt in the set carries the group's badge embroidered on the left
 * chest, legibly, about a hand's width under the chin. The site trades as
 * Commercial Painters and keeps the group name off its pages
 * (tests/unit/brand.test.ts holds the source; this holds the pixels), so each
 * portrait is cropped to head and collar, ending above the embroidery — the
 * call the chat avatar already made for its photograph.
 *
 * The crop is measured per frame, not guessed. `media/team/crops.json` gives
 * two numbers per master, in source pixels:
 *
 *   { "<slug>": { "faceX": 510, "top": 88 } }
 *
 * `faceX` is the centre of the face and `top` the crop's top edge. The box is
 * a fixed 480x432 (10:9) centred on the face, so every face is the same size.
 * `top` is set as low as the badge allows — the box's bottom edge, `top + 432`,
 * at least 20px above the badge — while keeping 20-50px over the head. There
 * is only about 60px between chin and badge in this set, so a box anchored to
 * the head instead cuts at the chin on anyone with tall hair. A new frame
 * needs checking against the badge before it ships. A master with no
 * measurements is skipped, not cropped on a default: a guessed box is how the
 * badge gets onto the page.
 *
 * Masters are `media/team/<slug>.{png,jpg,jpeg,webp}`, the slug being the one
 * the member has in content/team.ts.
 *
 * Output:
 *
 *   public/images/team/<slug>.webp        480x432
 *   content/team-photos.generated.json    slug -> { width, height }
 *
 * The output folder is rebuilt from scratch on every run, so the files and
 * the manifest cannot disagree.
 *
 * Run it with:  npm run team:build
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'media', 'team');
const CROPS = join(SOURCE, 'crops.json');
const OUTPUT = join(ROOT, 'public', 'images', 'team');
const MANIFEST = join(ROOT, 'content', 'team-photos.generated.json');

const WIDTH = 480;
const HEIGHT = 432;
const QUALITY = 82;

const MASTER_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

if (!existsSync(SOURCE)) {
  console.error(`No masters: ${SOURCE} does not exist.`);
  process.exit(1);
}

const crops = existsSync(CROPS) ? JSON.parse(readFileSync(CROPS, 'utf8')) : {};
const masters = readdirSync(SOURCE)
  .filter((file) => MASTER_EXTENSIONS.has(extname(file).toLowerCase()))
  .sort();

rmSync(OUTPUT, { recursive: true, force: true });
mkdirSync(OUTPUT, { recursive: true });

const manifest = {};
const skipped = [];

for (const file of masters) {
  const slug = file.slice(0, -extname(file).length);
  const crop = crops[slug];

  if (!crop) {
    skipped.push(slug);
    continue;
  }

  const input = join(SOURCE, file);
  const { width: sourceWidth, height: sourceHeight } = await sharp(input).metadata();

  // Clamped to the frame. A face near the edge shifts the box rather than
  // shrinking it, so every portrait comes out the same size.
  const left = Math.min(Math.max(Math.round(crop.faceX - WIDTH / 2), 0), sourceWidth - WIDTH);
  const top = Math.min(Math.max(Math.round(crop.top), 0), sourceHeight - HEIGHT);

  await sharp(input)
    // A transparent master would otherwise encode its transparency as black.
    .flatten({ background: '#ffffff' })
    .extract({ left, top, width: WIDTH, height: HEIGHT })
    .webp({ quality: QUALITY })
    .toFile(join(OUTPUT, `${slug}.webp`));

  manifest[slug] = { width: WIDTH, height: HEIGHT };
  console.log(`  ${slug}  box ${left},${top}  (bottom edge at ${top + HEIGHT}px)`);
}

writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`\n${Object.keys(manifest).length} portrait(s) written to public/images/team/.`);
if (skipped.length > 0) {
  console.warn(
    `Skipped, no measurements in media/team/crops.json: ${skipped.join(', ')}.\n` +
      'Those members keep the initials card until a crop is added.',
  );
}
