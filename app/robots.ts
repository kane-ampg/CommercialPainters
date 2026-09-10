import type { MetadataRoute } from 'next';
import { noindexAll, siteUrl } from '@/lib/site';

/**
 * Robots.
 *
 * A locked-down preview build disallows everything, so a staging host can
 * never be crawled beside — or instead of — the live site. See `noindexAll`.
 */
export default function robots(): MetadataRoute.Robots {
  if (noindexAll) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        // Named explicitly so a later blanket rule cannot quietly lock the
        // answer engines out. A blocked crawler cannot cite the business, and for a
        // local trade business an AI answer is now a real referral source.
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-User',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'Bingbot',
        ],
        allow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
