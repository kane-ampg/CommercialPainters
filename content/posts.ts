import type { Post } from '@/lib/content/types';

/**
 * Blog posts.
 *
 * Empty until the first one is written. Add an entry here and it appears on
 * /blog/, gets its own page at /blog/{slug}/, lands in the sitemap with a real
 * `lastModified`, and is described to answer engines in /llms.txt — nothing
 * else needs touching.
 *
 * `body` is Markdown, rendered without raw HTML
 * (components/pages/post-article.tsx), so a pasted script tag is text, not
 * code. Keep `excerpt` under 300 characters and `metaDescription` under 160:
 * the first is the card and the OG description, the second is the SERP
 * snippet.
 *
 * Posts are published as the business, not under an invented personal byline
 * — see `blogPostingSchema` in lib/schema/index.ts.
 */
export const posts: readonly Post[] = [];
