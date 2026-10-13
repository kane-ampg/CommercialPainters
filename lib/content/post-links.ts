import { servicePath } from '@/content/services';
import type { Post } from './types';

/**
 * Internal links between the blog and the rest of the site.
 *
 * Every post ends by linking out — to its sector page, its case study, the
 * service pages in its sidebar — but until 12 October 2026 nothing linked
 * back: a crawler could reach a post only through /blog/ and the "More notes"
 * sidebars of other posts. These make each of those links two-way. A page
 * lists the posts that link to it, worked out from the posts themselves, so a
 * new post is linked from the right pages without anyone keeping a mapping.
 */

/** Whether a post's page links to `path`, from its body or its "Related services" sidebar. */
export function postLinksTo(post: Post, path: string): boolean {
  return (
    post.body.includes(`](${path})`) ||
    post.relatedServiceSlugs.some((slug) => servicePath(slug) === path)
  );
}

/**
 * The posts a post's "More notes" sidebar links to: the `count` after it in
 * newest-first order, wrapping round to the newest.
 *
 * Taking the newest few instead pointed every sidebar at the same three
 * posts, so the older ones had no sidebar linking to them at all, and each
 * new post pushed another one out.
 */
export function morePosts(post: Post, newestFirst: readonly Post[], count: number): Post[] {
  const at = Math.max(
    0,
    newestFirst.findIndex((other) => other.slug === post.slug),
  );
  const others = newestFirst.filter((other) => other.slug !== post.slug);
  return [...others.slice(at), ...others.slice(0, at)].slice(0, count);
}

/** `RelatedLinks` entries for a list of posts. */
export function postLinks(posts: readonly Post[]): { label: string; href: string }[] {
  return posts.map((post) => ({ label: post.title, href: `/blog/${post.slug}/` }));
}
