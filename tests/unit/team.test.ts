import { existsSync, globSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import manifest from '@/content/team-photos.generated.json';
import { initials, team, teamPhoto } from '@/content/team';

/**
 * The team page's data.
 *
 * The portraits are written by scripts/build-team-images.mjs and the people by
 * hand in content/team.ts, so the two can drift. These hold them together: no
 * portrait without a person, no manifest entry without a file, no file
 * without a manifest entry.
 */
describe('team', () => {
  const slugs = team.map((member) => member.slug);

  it('gives every member a unique kebab-case slug', () => {
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('has no portrait for anyone not on the team', () => {
    expect(Object.keys(manifest).filter((slug) => !slugs.includes(slug))).toEqual([]);
  });

  it('has a file behind every portrait, and a portrait entry for every file', () => {
    for (const member of team) {
      const photo = teamPhoto(member.slug);
      if (photo) expect(existsSync(`public${photo.src}`)).toBe(true);
    }

    const files = globSync('public/images/team/*', { cwd: process.cwd() }).map((file) =>
      file.replaceAll('\\', '/'),
    );
    const expected = Object.keys(manifest).map((slug) => `public/images/team/${slug}.webp`);
    expect(files.sort()).toEqual(expected.sort());
  });

  it('links LinkedIn profiles only, never the feed', () => {
    for (const member of team.filter((m) => m.linkedin)) {
      expect(member.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\/[^/]+\/?$/);
    }
  });

  it('builds a two-letter monogram', () => {
    expect(initials('Jane Citizen')).toBe('JC');
    expect(initials('Jane van Citizen')).toBe('JC');
    expect(initials('Jane')).toBe('J');
  });
});
