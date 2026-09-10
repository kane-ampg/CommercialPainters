import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { brand, site } from '@/lib/site';

/**
 * The brand.
 *
 * Two things are guarded here. The statements on /about-us/ are asserted to
 * be the business's own, carried inside the commercial positioning. And the
 * previous trading name is asserted to be absent from the entire repository —
 * source, content, docs, tests and file names — because a rebrand that
 * survives in a comment, an alt text or an image path is not finished.
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

describe('the previous trading name is gone', () => {
  // Assembled, so this file does not itself contain the string it forbids.
  const FORMER = new RegExp(['ap', 'mg'].join(''), 'i');

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

  it('appears in no source, content, doc, config or test file', () => {
    const hits = SOURCE_GLOB.flatMap((pattern) => globSync(pattern, { cwd: process.cwd() }))
      .filter((file) => !file.endsWith('package-lock.json'))
      .filter((file) => FORMER.test(readFileSync(file, 'utf8')));
    expect(hits).toEqual([]);
  });

  it('appears in no file name under public/', () => {
    const files = globSync('public/**/*', { cwd: process.cwd() });
    expect(files.filter((file) => FORMER.test(file))).toEqual([]);
  });
});
