import { describe, expect, it } from 'vitest';
import { posts } from '@/content/posts';
import { projects } from '@/content/projects';
import { sectors } from '@/content/sectors';
import { morePosts, postLinksTo } from '@/lib/content/post-links';
import { getPosts } from '@/lib/content/source';
import type { Post } from '@/lib/content/types';

/**
 * Links back to the blog.
 *
 * A post nothing links to is found late and ranked late. Each post links out
 * to its sector, service and case-study pages, and each of those pages lists
 * the posts that link to it (lib/content/post-links.ts), so the posts are
 * reachable from pages Google already crawls instead of only from /blog/.
 */

function post(overrides: Partial<Post>): Post {
  return {
    slug: 'a-post',
    title: 'A post',
    excerpt: '',
    body: '',
    publishedAt: '2026-10-01',
    author: 'Commercial Painters',
    tags: [],
    relatedServiceSlugs: [],
    metaTitle: '',
    metaDescription: '',
    ...overrides,
  };
}

/** Every page outside the blog that renders a "From the blog" list. */
const LINK_BACK_PAGES = [
  ...sectors.map((sector) => sector.legacyPath),
  ...projects.map((project) => `/projects/${project.slug}/`),
  '/office-painters/',
  '/trade-services/',
];

describe('postLinksTo', () => {
  it('matches a Markdown link in the body, and only that exact path', () => {
    const p = post({ body: 'See the [case study](/projects/ndis-commercial-painting/).' });
    expect(postLinksTo(p, '/projects/ndis-commercial-painting/')).toBe(true);
    expect(postLinksTo(p, '/projects/')).toBe(false);
  });

  it('matches the page a related service resolves to', () => {
    const p = post({ relatedServiceSlugs: ['office-painting'] });
    expect(postLinksTo(p, '/office-painters/')).toBe(true);
    expect(postLinksTo(p, '/trade-services/')).toBe(false);
  });
});

describe('the "More notes" sidebar', () => {
  it('never links a post to itself', async () => {
    const newestFirst = await getPosts();
    for (const p of newestFirst) {
      expect(morePosts(p, newestFirst, 3).map((other) => other.slug)).not.toContain(p.slug);
    }
  });

  it('links every post from as many other sidebars as it shows', async () => {
    const newestFirst = await getPosts();
    const count = Math.min(3, newestFirst.length - 1);
    const inbound = new Map(newestFirst.map((p) => [p.slug, 0]));
    for (const p of newestFirst) {
      for (const other of morePosts(p, newestFirst, 3)) {
        inbound.set(other.slug, inbound.get(other.slug)! + 1);
      }
    }
    for (const [slug, n] of inbound) expect(n, slug).toBe(count);
  });
});

describe('posts linked from outside the blog', () => {
  it('has every post link to a sector, service or case-study page, which links back', () => {
    for (const p of posts) {
      expect(
        LINK_BACK_PAGES.some((path) => postLinksTo(p, path)),
        `${p.slug} links to no page that lists it back`,
      ).toBe(true);
    }
  });
});
