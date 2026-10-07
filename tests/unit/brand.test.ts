import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { brand, site } from '@/lib/site';

/**
 * The brand.
 *
 * Two things are guarded here. The statements on /about-us/ are asserted to
 * be the business's own, carried inside the commercial positioning. And the
 * group name is kept out of the repository, except in the few files where it
 * is the group's outside identity, because the trading name is Commercial
 * Painters and a group name that survives in a comment, an alt text or an
 * image path turns into the site's name by accident.
 */
describe('brand statements', () => {
  it('names the business one way', () => {
    expect(site.name).toBe('Commercial Painters');
    expect(brand.mission).toMatch(new RegExp(`^At ${site.name}`));
  });

  it('names the four core values, in order', () => {
    expect(brand.values.map((v) => v.name)).toEqual([
      'Expertise',
      'Passion',
      'Professionalism',
      'Integrity',
    ]);
  });

  it('keeps the mission inside the commercial positioning', () => {
    expect(brand.mission).toMatch(/simplify property maintenance/);
    expect(brand.mission).not.toMatch(/residential|homeowner/i);
  });
});

describe('the group name stays out of the trading name', () => {
  // Assembled, so this file does not itself contain the string it forbids.
  const GROUP = ['ap', 'mg'].join('');
  const FORMER = new RegExp(GROUP, 'i');

  /**
   * Where the group name is allowed, and why. The 10 September rebrand removed
   * it everywhere, but the group kept it for the things the site has to link to
   * as they are. Adding a file to this list takes one of those reasons.
   */
  const ALLOWED = new Set([
    // Group inbox, Facebook page and customer portal, whose addresses spell it,
    // and `site.group`, the one-line footer descriptor (client, 2026-10-01).
    'lib/site.ts',
    // The Facebook URL, asserted as supplied.
    'tests/unit/schema.test.ts',
    // The reviews figure, attributed to the Google profile it is read from.
    'content/reviews.ts',
    // The favicon artwork is the group badge.
    'scripts/build-icons.mjs',
    `public/images/company/${GROUP}-badge.png`,
    // The knowledge base transcribes the email, and the rebrand spec records
    // the name it removed.
    'docs/chat-knowledge-base.md',
    'docs/superpowers/specs/2026-09-10-commercial-painters-derivation-design.md',
  ]);
  const allowed = (file: string) => ALLOWED.has(file.replaceAll('\\', '/'));

  const SOURCE_GLOB = [
    'app/**/*.{ts,tsx,css}',
    'components/**/*.{ts,tsx}',
    'content/**/*.ts',
    'lib/**/*.ts',
    'scripts/**/*.{mjs,mts}',
    'tests/**/*.{ts,tsx}',
    'docs/**/*.md',
    '*.{ts,mjs,json,md}',
    '.env.example',
  ];

  it('appears in no source, content, doc, config or test file outside the allowed ones', () => {
    const hits = SOURCE_GLOB.flatMap((pattern) => globSync(pattern, { cwd: process.cwd() }))
      .filter((file) => !file.endsWith('package-lock.json'))
      .filter((file) => !allowed(file))
      .filter((file) => FORMER.test(readFileSync(file, 'utf8')));
    expect(hits).toEqual([]);
  });

  it('appears in no file name under public/ outside the allowed ones', () => {
    const files = globSync('public/**/*', { cwd: process.cwd() });
    expect(files.filter((file) => !allowed(file) && FORMER.test(file))).toEqual([]);
  });

  it('never becomes the trading name', () => {
    expect(site.name).not.toMatch(FORMER);
    expect(site.legalName).not.toMatch(FORMER);
    expect(brand.mission).not.toMatch(FORMER);
  });
});
