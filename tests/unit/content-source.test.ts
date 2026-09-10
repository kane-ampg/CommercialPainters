import { describe, expect, it } from 'vitest';
import {
  getFeaturedProjects,
  getPage,
  getPost,
  getPosts,
  getProject,
  getProjects,
  getProjectsForSector,
  getService,
  getServices,
  getSiteSettings,
} from '@/lib/content/source';
import { posts } from '@/content/posts';
import { projects } from '@/content/projects';
import { services } from '@/content/services';
import { defaultContactPage, defaultSiteSettings } from '@/lib/site';

/**
 * The content adapter.
 *
 * Every page reads through lib/content/source.ts rather than importing the
 * content files directly, so that a database can sit behind it later without
 * a page changing. These assert that the adapter answers from the files and
 * that its shape — async, filtered, sorted — is the one the pages rely on.
 */
describe('content source', () => {
  it('answers from the TypeScript projects', async () => {
    expect(await getProjects()).toEqual(projects);
    expect((await getProject(projects[0]!.slug))?.title).toBe(projects[0]!.title);
    expect(await getProject('no-such-project')).toBeUndefined();
  });

  it('hands back a copy, never the module array itself', async () => {
    // A page that sorted or spliced the result in place would otherwise
    // reorder the content for every later render on the same server.
    expect(await getProjects()).not.toBe(projects);
    expect(await getServices()).not.toBe(services);
  });

  it('filters featured projects and projects by sector', async () => {
    expect(await getFeaturedProjects()).toEqual(projects.filter((p) => p.isFeatured));
    expect(await getProjectsForSector('industrial')).toEqual(
      projects.filter((p) => p.sectorSlug === 'industrial'),
    );
  });

  it('answers from the TypeScript services', async () => {
    expect(await getServices()).toEqual(services);
    expect((await getService('office-painting'))?.slug).toBe('office-painting');
  });

  it('returns posts newest first, and nothing when there are none', async () => {
    const result = await getPosts();
    expect(result).toHaveLength(posts.length);
    for (let i = 1; i < result.length; i += 1) {
      expect(result[i - 1]!.publishedAt >= result[i]!.publishedAt).toBe(true);
    }
    expect(await getPost('no-such-post')).toBeUndefined();
  });

  it('always resolves the business details and the contact copy', async () => {
    // The root layout and the enquiry action both await these; neither may
    // ever be left without a phone number to render.
    await expect(getSiteSettings()).resolves.toEqual(defaultSiteSettings);
    await expect(getPage('contact-us')).resolves.toEqual(defaultContactPage);
  });
});
