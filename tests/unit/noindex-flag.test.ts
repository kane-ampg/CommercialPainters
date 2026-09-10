import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The staging lockdown, tested in both states.
 *
 * `NEXT_PUBLIC_NOINDEX="true"` turns four layers on together: the meta robots
 * directive, robots.txt, llms.txt and the X-Robots-Tag header. A header-level
 * noindex overrides everything, so the header and the other three have to
 * agree — which is what this asserts. Unset, all four release, because a
 * production deployment that shipped any one of them would be invisible to
 * search with no error to say so.
 */
describe('noindex layers', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function layers(flag: string) {
    vi.stubEnv('NEXT_PUBLIC_NOINDEX', flag);
    vi.resetModules();

    const { noindexAll } = await import('@/lib/site');
    const { default: robots } = await import('@/app/robots');
    const { buildMetadata } = await import('@/lib/seo/metadata');
    const { default: nextConfig } = await import('../../next.config');

    const headers = (await nextConfig.headers?.()) ?? [];

    return {
      noindexAll,
      robotsRules: robots().rules,
      metaIndex: (
        buildMetadata({ title: 't', description: 'd', path: '/' }).robots as {
          index: boolean;
        }
      ).index,
      headerNames: headers.flatMap((entry) => entry.headers.map((h) => h.key)),
    };
  }

  it('locks all four layers down when the flag is set', async () => {
    const l = await layers('true');

    expect(l.noindexAll).toBe(true);
    expect(l.robotsRules).toEqual([{ userAgent: '*', disallow: '/' }]);
    expect(l.metaIndex).toBe(false);
    expect(l.headerNames).toContain('X-Robots-Tag');
  });

  it('releases all four when it is not', async () => {
    const l = await layers('');

    expect(l.noindexAll).toBe(false);
    expect(JSON.stringify(l.robotsRules)).toContain('"allow":"/"');
    expect(JSON.stringify(l.robotsRules)).not.toContain('"disallow":"/"');
    expect(l.metaIndex).toBe(true);
    expect(l.headerNames).not.toContain('X-Robots-Tag');
  });

  it('is off for any value other than the exact string "true"', async () => {
    // A typo in an environment variable must fail safe: the public site stays
    // public. Only the literal switch locks it.
    for (const value of ['1', 'yes', 'TRUE', 'false']) {
      const l = await layers(value);
      expect(l.noindexAll, value).toBe(false);
    }
  });

  it('withholds llms.txt while the flag is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_NOINDEX', 'true');
    vi.resetModules();
    const { GET } = await import('@/app/llms.txt/route');
    expect((await GET()).status).toBe(404);
  });
});
