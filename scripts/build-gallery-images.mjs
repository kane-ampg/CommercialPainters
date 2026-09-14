#!/usr/bin/env node
/**
 * Site photography encoder.
 *
 * The shoot deliverables in `media/photography/` are 537 MB of full-resolution
 * JPEG — single frames run to 9169x13754 and 38 MB. Those are the
 * photographer's masters, not web assets: they live in `media/`, which is
 * gitignored, and they are never deployed. Everything the browser sees is
 * produced here.
 *
 * They were delivered inside `public/`, under a folder named for the previous
 * trading name. Both were wrong and for the same reason: anything under
 * `public/` is served and deployed, and the rebrand is asserted to be complete
 * down to file paths (tests/unit/brand.test.ts). Re-encoding a future shoot
 * means dropping it in `media/photography/` first.
 *
 * Three decisions are baked in:
 *
 * 1. Only commercial sites are encoded. `SITES` below is an allow-list, not a
 *    directory scan, and two of the nine shoots are deliberately absent: the
 *    Croydon house and the Carnegie courtyard are residential work, and this
 *    site is commercial-only (there is a `no-residential` test enforcing it,
 *    and scripts/encode-hero-video.mjs cuts the hero reel on the same line).
 *    A scan would quietly re-admit them the next time the folder changes.
 *
 * 2. Long edge 1800px, quality 78. The frames are shot at 3:2 and 2:3 and a
 *    good half of them are portrait, so nothing is cropped to a house ratio
 *    here — the real width and height go into the manifest and the layout
 *    adapts to the photograph rather than the other way round.
 *
 * 3. Individual frames can be held back by name. `exclude` is for a frame that
 *    is fine as photography and wrong as publication — the only one so far
 *    carries the previous trading name and its old domain across the side of a
 *    van, legibly, which is exactly what tests/unit/brand.test.ts exists to
 *    stop appearing anywhere else on the site. Excluding it here rather than
 *    dropping its alt text keeps one reason in one place.
 *
 * 4. Dimensions and a blur placeholder are recorded per image. `MediaRef`
 *    already carries all three, and `ContentImage` reserves the box and paints
 *    the blur when they are present, so a gallery of 55 photographs costs no
 *    layout shift.
 *
 * Output, all under public/images/gallery/<site>/:
 *
 *   <site>-01.webp … <site>-NN.webp   renumbered, source order preserved
 *   content/galleries.generated.json  dimensions + blur, keyed by src
 *
 * Alt text is NOT written here. It lives in content/galleries.ts, hand-authored
 * against what each frame actually shows — the same rule the rest of the
 * content files are held to. This script only ever produces geometry.
 *
 * Run it with:  npm run gallery:build
 *
 * Requires sharp, which Next already depends on for its own image optimiser.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCE_DIR = join(root, 'media', 'photography');
const OUT_DIR = join(root, 'public', 'images', 'gallery');
const MANIFEST = join(root, 'content', 'galleries.generated.json');

/** Longest edge, in px, of the encoded frame. */
const LONG_EDGE = 1800;
const QUALITY = 78;

/** The blur placeholder is a 16px thumbnail inlined as a data URI. */
const BLUR_EDGE = 16;

/**
 * The commercial shoots, and the slug each is published under.
 *
 * Keyed by the source folder name exactly as the photographer delivered it,
 * spaces and commas included, so a renamed folder fails loudly here rather
 * than silently dropping a site out of the gallery.
 */
const SITES = [
  {
    dir: 'Toyota Dealership Croydon',
    slug: 'toyota-croydon',
    // The van at the kerb, with the old wordmark and www.<former name>.com.au
    // across its flank at full legibility. A competitor's domain would not be
    // published here; a superseded one of the business's own should not be
    // either.
    exclude: ['Toyota Dealership 08042026-15.jpg'],
  },
  { dir: 'BYD 899 Mountain Highway Bayswater', slug: 'byd-bayswater' },
  {
    dir: '20 Christensen Street, Cheltenham, Victoria, 3192, Australia',
    slug: 'christensen-street-cheltenham',
  },
  { dir: 'Our Lady of the Pines Primary School', slug: 'our-lady-of-the-pines' },
  { dir: 'Saint Bar', slug: 'saint-bar' },
  { dir: '2-4 Heather Street, South Melbourne', slug: 'heather-street-south-melbourne' },
  { dir: '47 Kinkora Rd, Hawthorn', slug: 'kinkora-road-hawthorn' },
];

/**
 * Source order, as the photographer numbered it.
 *
 * The trailing number is the sort key, not the filename: a plain lexical sort
 * puts frame 10 between 1 and 2, and Saint Bar carries both `-1` and `-1-2`,
 * which have to stay adjacent and in that order.
 */
function frameOrder(name) {
  const digits = name
    .replace(/\.[^.]+$/, '')
    .match(/\d+/g)
    ?.slice(-2)
    .map(Number) ?? [0];
  return digits.length === 2 ? digits : [digits[0], 0];
}

function sortFrames(names) {
  return [...names].sort((a, b) => {
    const [aMajor, aMinor] = frameOrder(a);
    const [bMajor, bMinor] = frameOrder(b);
    return aMajor - bMajor || aMinor - bMinor;
  });
}

async function blurDataUri(input) {
  const buffer = await sharp(input)
    .rotate()
    .resize(BLUR_EDGE, BLUR_EDGE, { fit: 'inside' })
    .webp({ quality: 30 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

async function encodeSite({ dir, slug, exclude = [] }) {
  const sourceDir = join(SOURCE_DIR, dir);
  if (!existsSync(sourceDir)) {
    throw new Error(
      `Source folder missing: ${dir}\n` +
        'SITES is an allow-list keyed by the delivered folder name — update it if the shoot was renamed.',
    );
  }

  const held = new Set(exclude);
  const delivered = readdirSync(sourceDir).filter((f) => /\.jpe?g$/i.test(f));

  // A name in `exclude` that matches nothing is a silent no-op, and the next
  // person to read the list would believe a frame was being held back when it
  // was not.
  for (const name of held) {
    if (!delivered.includes(name)) {
      throw new Error(`${dir}: exclude lists "${name}", which was not delivered.`);
    }
  }

  const frames = sortFrames(delivered.filter((f) => !held.has(f)));
  if (frames.length === 0) throw new Error(`No JPEGs in ${dir}`);
  if (held.size > 0) {
    process.stdout.write(`  (${held.size} frame(s) held back by name)
`);
  }

  const siteOut = join(OUT_DIR, slug);
  // Rebuilt from scratch: renumbering after a frame is pulled would otherwise
  // leave the old tail behind, and a stale file under public/ still deploys.
  rmSync(siteOut, { recursive: true, force: true });
  mkdirSync(siteOut, { recursive: true });

  const images = [];
  for (const [index, frame] of frames.entries()) {
    const name = `${slug}-${String(index + 1).padStart(2, '0')}.webp`;
    const outPath = join(siteOut, name);
    const source = join(sourceDir, frame);

    const { width, height } = await sharp(source)
      .rotate()
      .resize(LONG_EDGE, LONG_EDGE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath);

    images.push({
      src: `/images/gallery/${slug}/${name}`,
      width,
      height,
      blurDataURL: await blurDataUri(source),
      /** Kept so a frame can be traced back to the delivered file. */
      sourceFile: frame,
    });

    process.stdout.write(
      `  ${name}  ${width}x${height}  ${(statSync(outPath).size / 1024).toFixed(0)} KB\n`,
    );
  }

  return { slug, sourceDir: dir, images };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(dirname(MANIFEST), { recursive: true });

  // Drop output directories the allow-list no longer names. Each site's own
  // directory is cleared as it is re-encoded, but a slug REMOVED from SITES
  // was never visited again — its webp files stayed under public/, committed
  // and deployed, reachable by direct URL and linked from nothing.
  const wanted = new Set(SITES.map((site) => site.slug));
  for (const entry of readdirSync(OUT_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && !wanted.has(entry.name)) {
      rmSync(join(OUT_DIR, entry.name), { recursive: true, force: true });
      process.stdout.write(`removed stale output: ${entry.name}
`);
    }
  }

  const sites = [];
  for (const site of SITES) {
    process.stdout.write(`\n${site.dir}  ->  ${site.slug}\n`);
    sites.push(await encodeSite(site));
  }

  writeFileSync(
    MANIFEST,
    `${JSON.stringify(
      {
        generatedFrom: 'media/photography',
        generatedBy: 'scripts/build-gallery-images.mjs',
        longEdge: LONG_EDGE,
        quality: QUALITY,
        sites,
      },
      null,
      2,
    )}\n`,
  );

  const count = sites.reduce((total, site) => total + site.images.length, 0);
  process.stdout.write(
    `\n${count} frames across ${sites.length} sites -> public/images/gallery/\n` +
      `manifest -> content/galleries.generated.json\n`,
  );
}

await main();
