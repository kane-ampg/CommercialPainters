import { describe, expect, it } from 'vitest';
import nextConfig from '@/next.config';
import { allLocalities } from '@/lib/locations';
import { MOVED_LOCALITY_PATHS } from '@/lib/locations/moved';

/**
 * Suburb pages moved by a council correction keep their old URL working.
 *
 * A redirect to a page that does not exist is a 404 one hop later, and a
 * redirect away from a page that still exists is a loop waiting to happen, so
 * both ends are checked against the live locality list.
 */
const hrefs = new Set(allLocalities().map((l) => l.href));

describe('moved suburb pages', () => {
  it('points every old URL at a live suburb page', () => {
    for (const [from, to] of Object.entries(MOVED_LOCALITY_PATHS)) {
      expect(hrefs.has(to), `${from} -> ${to}`).toBe(true);
    }
  });

  it('redirects only URLs that no longer exist', () => {
    for (const from of Object.keys(MOVED_LOCALITY_PATHS)) {
      expect(hrefs.has(from), from).toBe(false);
    }
  });

  it('serves each move as a permanent redirect', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    for (const [from, to] of Object.entries(MOVED_LOCALITY_PATHS)) {
      expect(redirects, from).toContainEqual({ source: from, destination: to, permanent: true });
    }
  });
});
