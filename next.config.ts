import type { NextConfig } from 'next';

/**
 * Whether this build is a locked-down preview. Read once at build time so the
 * header below costs the public site nothing at request time. The same value
 * drives `noindexAll` in lib/site.ts — see the note there.
 */
const noindex = process.env.NEXT_PUBLIC_NOINDEX === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    // The public site lives in the `(site)` route group so it can own its
    // root layout outright. That leaves no layout at `app/` for Next to
    // compose a root `not-found.tsx` into — the documented case for
    // `app/global-not-found.tsx`. Without this flag a URL that matches no
    // route at all falls back to Next's own unstyled 404.
    globalNotFound: true,
  },

  // Every URL ends in a slash, consistently — one shape for canonicals, the
  // sitemap and internal links to agree on.
  trailingSlash: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    // Every image the site serves is a committed file under public/, and a
    // committed file only changes with a deploy, so the optimised variants
    // can be cached for a year.
    minimumCacheTTL: 31536000,
  },

  /**
   * The header-level half of the staging lockdown.
   *
   * Only on a build with `NEXT_PUBLIC_NOINDEX="true"`, where it has to agree
   * with the other three layers (`noindexAll` in lib/site.ts): a header-level
   * noindex overrides everything, so all four switch together.
   */
  async headers() {
    if (!noindex) return [];

    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
