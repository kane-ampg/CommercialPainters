import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * What the image renderers share.
 *
 * `next/og` cannot see the fonts next/font self-hosts for the pages, and has
 * no system fonts at all, so the OG card, the two icons and the generated logo
 * all read their type from disk. Both cuts are Open Font Licence, checked in
 * under public/fonts/og. One module so four renderers cannot drift onto four
 * sources — or four slightly different reds.
 */
export function ogFont(file: 'oswald-500.ttf' | 'roboto-400.ttf'): Promise<Buffer> {
  return readFile(join(process.cwd(), 'public', 'fonts', 'og', file));
}

/**
 * The palette, as hex literals. The renderers run outside Tailwind, so these
 * mirror `ink.DEFAULT`, `brand.600` and `brand.400` in tailwind.config.ts by
 * hand. Change one, change both.
 */
export const OG_INK = '#1C1C1C';
export const OG_RED = '#C8102E';
export const OG_RED_LIGHT = '#E24356';

/** "CP" — the initials of the trading name, for the two icons. */
export function monogram(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();
}
