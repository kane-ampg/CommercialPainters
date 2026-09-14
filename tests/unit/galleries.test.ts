import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from '@/content/galleries.generated.json';
import {
  altText,
  coverNames,
  galleries,
  galleryCovers,
  galleryFrameCount,
} from '@/content/galleries';
import { sectors } from '@/content/sectors';

const sectorSlugs = new Set(sectors.map((sector) => sector.slug));

describe('work galleries', () => {
  it('publishes every frame the encoder produced', () => {
    // The join in content/galleries.ts drops any frame with no alt text, which
    // is the right failure mode at runtime and the wrong one to discover in
    // production. A frame added to the shoot and encoded but never described
    // disappears silently; this is what says so.
    const encoded = manifest.sites.flatMap((site) => site.images.map((image) => image.src));
    const published = galleries.flatMap((gallery) => gallery.images.map((image) => image.src));

    expect(published.slice().sort()).toEqual(encoded.slice().sort());
    expect(galleryFrameCount).toBe(encoded.length);
  });

  it('has a gallery for every encoded site', () => {
    expect(galleries.map((g) => g.slug).sort()).toEqual(manifest.sites.map((s) => s.slug).sort());
  });

  it('ships no empty gallery', () => {
    for (const gallery of galleries) {
      expect(gallery.images.length, gallery.slug).toBeGreaterThan(0);
    }
  });

  it('points every src at a file that is actually on disk', () => {
    for (const gallery of galleries) {
      for (const image of gallery.images) {
        const onDisk = join(process.cwd(), 'public', image.src);
        expect(existsSync(onDisk), image.src).toBe(true);
      }
    }
  });

  it('carries dimensions and a blur placeholder on every frame', () => {
    // ContentImage only reserves the box and paints the blur when all three
    // are present. Without them a 55-frame gallery is 55 layout shifts.
    for (const gallery of galleries) {
      for (const image of gallery.images) {
        expect(image.width, image.src).toBeGreaterThan(0);
        expect(image.height, image.src).toBeGreaterThan(0);
        expect(image.blurDataURL, image.src).toMatch(/^data:image\/webp;base64,/);
      }
    }
  });

  it('leads each set with one cover, and covers the whole set', () => {
    expect(galleryCovers).toHaveLength(galleries.length);
    galleries.forEach((gallery, index) => {
      expect(galleryCovers[index]).toBe(gallery.images[0]);
    });
  });

  it('names a real frame as every gallery cover', () => {
    // `cover` used to be a numeric index, silently clamped to 0 when out of
    // range — saint-bar shipped `cover: 12` against a three-frame set and every
    // test stayed green, because the old assertion (galleryCovers[i] ===
    // images[0]) holds whichever frame leads. This checks the declaration
    // itself, which is the thing that can be wrong.
    for (const [slug, cover] of Object.entries(coverNames)) {
      const site = manifest.sites.find((entry) => entry.slug === slug);
      expect(site, slug).toBeDefined();
      expect(
        site!.images.map((image) => image.sourceFile),
        `${slug}: cover "${cover}" names no delivered frame`,
      ).toContain(cover);
    }
  });

  it('leads each gallery with the frame its cover names', () => {
    for (const gallery of galleries) {
      const cover = coverNames[gallery.slug]!;
      const site = manifest.sites.find((entry) => entry.slug === gallery.slug)!;
      const expected = site.images.find((image) => image.sourceFile === cover)!;
      expect(gallery.images[0]!.src, gallery.slug).toBe(expected.src);
    }
  });

  it('never repeats a frame within a gallery', () => {
    // The cover is moved to the front by re-ordering, not by prepending — a
    // regression there would show the lead frame twice.
    for (const gallery of galleries) {
      const seen = new Set(gallery.images.map((image) => image.src));
      expect(seen.size, gallery.slug).toBe(gallery.images.length);
    }
  });

  it('resolves every sector association to a real sector', () => {
    for (const gallery of galleries) {
      if (gallery.sectorSlug) expect(sectorSlugs.has(gallery.sectorSlug), gallery.slug).toBe(true);
    }
  });

  it('associates at most one gallery with a sector', () => {
    // `galleryForSector` returns the first match, so a second gallery on the
    // same sector would be silently unreachable from that page.
    const used = galleries.map((g) => g.sectorSlug).filter(Boolean);
    expect(new Set(used).size).toBe(used.length);
  });
});

describe('gallery alt text', () => {
  const allImages = galleries.flatMap((gallery) => gallery.images);

  it('describes every frame', () => {
    for (const image of allImages) {
      expect(image.alt.trim().length, image.src).toBeGreaterThan(20);
    }
  });

  it('stays inside a length a screen reader can use', () => {
    // Long enough to be specific, short enough not to be read as a paragraph.
    for (const image of allImages) {
      expect(image.alt.length, `${image.src}: ${image.alt}`).toBeLessThanOrEqual(200);
    }
  });

  it('never opens with a redundant "image of"', () => {
    for (const image of allImages) {
      expect(image.alt, image.src).not.toMatch(
        /^\s*(an?\s+)?(image|photo|picture|photograph)\s+(of|showing)\b/i,
      );
    }
  });

  it('carries no residential language', () => {
    // The same line tests/unit/no-residential.test.ts holds across source.
    // These strings are data rather than source, so they need their own check.
    for (const image of allImages) {
      expect(image.alt, image.src).not.toMatch(/\b(residential|homeowner|house painting)\b/i);
    }
    for (const gallery of galleries) {
      expect(gallery.caption, gallery.slug).not.toMatch(
        /\b(residential|homeowner|house painting)\b/i,
      );
      expect(gallery.buildingType, gallery.slug).not.toMatch(
        /\b(residential|homeowner|house painting)\b/i,
      );
    }
  });

  it('excludes the two residential shoots outright', () => {
    // Not merely undescribed — never encoded. The allow-list in
    // scripts/build-gallery-images.mjs is what enforces it; this is the
    // assertion that the enforcement is still in place.
    const slugs = galleries.map((gallery) => gallery.slug);
    expect(slugs).not.toContain('lindisfarne-avenue-croydon');
    expect(slugs).not.toContain('rigby-avenue-carnegie');
    expect(slugs).toHaveLength(7);
  });

  it('keys alt text on the delivered file name, not the published one', () => {
    // The published name is positional (<slug>-01.webp, -02, ...). If alt text
    // were keyed on it, holding one frame back would shift every later frame up
    // a number and silently move each description onto its neighbour. Keying on
    // the photographer's own file name is what makes that impossible, and this
    // is the assertion that the key has not drifted back.
    const published = manifest.sites.flatMap((site) =>
      site.images.map((image) => image.src.slice(image.src.lastIndexOf('/') + 1)),
    );
    const altKeys = Object.keys(altText);

    expect(altKeys.length).toBeGreaterThan(0);
    for (const key of altKeys) {
      expect(published, `"${key}" looks like a published name, not a delivered one`).not.toContain(
        key,
      );
      expect(key, key).toMatch(/\.jpe?g$/i);
    }
  });

  it('has an alt entry for every delivered frame the encoder kept', () => {
    const delivered = manifest.sites.flatMap((site) =>
      site.images.map((image) => image.sourceFile),
    );
    for (const file of delivered) {
      expect(Object.keys(altText), file).toContain(file);
    }
  });

  it('describes each frame distinctly', () => {
    // Two frames sharing alt text means one of them was never really looked at.
    const seen = new Set(allImages.map((image) => image.alt));
    expect(seen.size).toBe(allImages.length);
  });
});
