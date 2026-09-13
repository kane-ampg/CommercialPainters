import { describe, expect, it } from 'vitest';
import { generateMetadata } from '@/app/(site)/blog/page';
import sitemap from '@/app/sitemap';
import { posts } from '@/content/posts';
import { mainNav, footerNav } from '@/components/navigation/nav-data';

/**
 * An empty section does not get advertised.
 *
 * `content/posts.ts` exports `[]` and has since launch, yet /blog/ shipped
 * `index, follow`, sat in the sitemap at priority 0.6, and held a slot in both
 * the header and the footer. That is an indexed page with a heading and no
 * content, linked sitewide — the definition of thin, at the top of a section,
 * on a domain whose whole purpose is organic traffic.
 *
 * The rule is computed from `posts.length` on all three surfaces, so writing
 * the first post restores the link, the sitemap entry and the index directive
 * together, and nobody has to remember three files.
 *
 * `/blog/{slug}/` needs no equivalent guard: with no posts there are no
 * routes to generate.
 */

type Robots = { index?: boolean; follow?: boolean };

const hasPosts = posts.length > 0;

function navHrefs(): string[] {
  return [
    ...mainNav.flatMap((item) => [item.href, ...(item.children ?? []).map((c) => c.href)]),
    ...Object.values(footerNav).flatMap((group) => group.map((link) => link.href)),
  ];
}

describe('blog indexation while the section is empty', () => {
  it('has no posts, which is the state this policy governs', () => {
    expect(hasPosts).toBe(false);
  });

  it('renders noindex, follow on the blog index', async () => {
    const meta = await generateMetadata();
    expect(meta.robots as Robots).toMatchObject({ index: false, follow: true });
  });

  it('keeps the blog index out of the sitemap', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith('/blog/'))).toBe(false);
  });

  it('links to the blog from neither the header nor the footer', () => {
    expect(navHrefs()).not.toContain('/blog/');
  });

  /**
   * All four surfaces read the same fact, so they cannot drift apart: the day
   * a post lands, the directive, the sitemap entry and both nav slots flip
   * together.
   */
  it('ties every surface to the same posts.length', async () => {
    const meta = await generateMetadata();
    const urls = (await sitemap()).map((entry) => entry.url);

    expect((meta.robots as Robots).index).toBe(hasPosts);
    expect(urls.some((url) => url.endsWith('/blog/'))).toBe(hasPosts);
    expect(navHrefs().includes('/blog/')).toBe(hasPosts);
  });
});
