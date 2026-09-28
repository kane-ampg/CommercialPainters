import { describe, expect, it } from 'vitest';
import { generateMetadata as projectMetadata } from '@/app/(site)/projects/[slug]/page';
import { generateMetadata as postMetadata } from '@/app/(site)/blog/[slug]/page';
import { generateMetadata as suburbMetadata } from '@/app/(site)/areas/[state]/[region]/[suburb]/page';
import { galleries } from '@/content/galleries';
import { posts } from '@/content/posts';
import { projects } from '@/content/projects';
import { services } from '@/content/services';
import { site } from '@/lib/site';

/**
 * Metadata that is generated rather than hand-written — project and suburb
 * pages — has to hold the same line the hand-written pages do: branded
 * titles, and descriptions that end at a sentence rather than mid-word.
 *
 * buildMetadata uses `title: { absolute }` on the assumption that every
 * caller-supplied title already ends in the brand. Project pages passed the
 * bare project title, so all four shipped unbranded. The suffix is asserted
 * here rather than trusted.
 */

type OgImage = { url: string | URL; alt?: string };

describe('project page metadata', () => {
  it('brands every project title', async () => {
    for (const project of projects) {
      const meta = await projectMetadata({ params: Promise.resolve({ slug: project.slug }) });
      const title = (meta.title as { absolute: string }).absolute;
      expect(title, project.slug).toMatch(new RegExp(`\\| ${site.name}$`));
    }
  });

  it('ends every description at a sentence or a marked ellipsis', async () => {
    for (const project of projects) {
      const meta = await projectMetadata({ params: Promise.resolve({ slug: project.slug }) });
      expect(meta.description, project.slug).toMatch(/([.!?…])$/);
      expect(meta.description!.length, project.slug).toBeLessThanOrEqual(160);
    }
  });

  it('describes the og:image with the cover photo’s own alt text, not the site name', async () => {
    for (const project of projects.filter((p) => p.images.length > 0)) {
      const meta = await projectMetadata({ params: Promise.resolve({ slug: project.slug }) });
      const images = meta.openGraph?.images as OgImage[];
      expect(images?.[0]?.alt, project.slug).toBe(project.images[0]?.alt);
    }
  });
});

describe('suburb page metadata', () => {
  it('ends a hand-written intro description at a sentence, not mid-word', async () => {
    const meta = await suburbMetadata({
      params: Promise.resolve({ state: 'victoria', region: 'eastern', suburb: 'vermont' }),
    });
    expect(meta.description).toMatch(/([.!?…])$/);
    expect(meta.description!.length).toBeLessThanOrEqual(160);
  });
});

/**
 * Post metadata is hand-written in content/posts.ts, so nothing stops a post
 * shipping an unbranded title or a description Google will truncate. These
 * loop over whatever is published: vacuous while the blog is empty, and the
 * first post is checked the moment it lands.
 */
describe('blog post metadata', () => {
  it('brands every post title', async () => {
    for (const post of posts) {
      const meta = await postMetadata({ params: Promise.resolve({ slug: post.slug }) });
      const title = (meta.title as { absolute: string }).absolute;
      expect(title, post.slug).toMatch(new RegExp(`\\| ${site.name}$`));
    }
  });

  it('keeps the meta description under 160 and the excerpt under 300 characters', () => {
    for (const post of posts) {
      expect(post.metaDescription.length, post.slug).toBeLessThanOrEqual(160);
      expect(post.excerpt.length, post.slug).toBeLessThanOrEqual(300);
    }
  });

  it('describes the og:image with the cover photo’s own alt text', async () => {
    for (const post of posts.filter((p) => p.cover)) {
      const meta = await postMetadata({ params: Promise.resolve({ slug: post.slug }) });
      const images = meta.openGraph?.images as OgImage[];
      expect(images?.[0]?.alt, post.slug).toBe(post.cover?.alt);
    }
  });

  /**
   * PostArticle renders a Markdown image only when it is a gallery frame and
   * silently drops anything else, so this is where a stray path gets caught —
   * including a photographer's master dropped under public/ and linked direct.
   */
  it('embeds only gallery photographs, and every one it names exists', () => {
    const published = new Set(galleries.flatMap((gallery) => gallery.images.map((i) => i.src)));
    for (const post of posts) {
      const embedded = [...post.body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1]!);
      for (const src of embedded) {
        expect(published.has(src), `${post.slug} → ${src}`).toBe(true);
      }
    }
  });

  it('names only services that exist, so no related link is silently dropped', () => {
    const known = new Set(services.map((service) => service.slug));
    for (const post of posts) {
      for (const slug of post.relatedServiceSlugs) {
        expect(known.has(slug), `${post.slug} → ${slug}`).toBe(true);
      }
    }
  });
});
