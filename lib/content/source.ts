import type { ContactPageCopy, Post, Project, Service, SiteSettings } from './types';
import { posts as allPosts } from '@/content/posts';
import { projects as allProjects } from '@/content/projects';
import { services as allServices } from '@/content/services';
import { defaultContactPage, defaultSiteSettings } from '@/lib/site';

/**
 * The content adapter.
 *
 * Every page reads through here rather than importing `content/*.ts` directly.
 * Today the answers come straight from those typed files; the functions are
 * async and the pages await them, so a database or a CMS can be put behind
 * this one module later without a page changing. That is the whole reason the
 * seam exists — keep pages talking to it, not to the files.
 */

// --- Projects --------------------------------------------------------------

export async function getProjects(): Promise<Project[]> {
  return [...allProjects];
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return allProjects.find((p) => p.slug === slug);
}

export async function getFeaturedProjects(): Promise<Project[]> {
  return allProjects.filter((p) => p.isFeatured);
}

export async function getProjectsForSector(sectorSlug: string): Promise<Project[]> {
  return allProjects.filter((p) => p.sectorSlug === sectorSlug);
}

// --- Services --------------------------------------------------------------

export async function getServices(): Promise<Service[]> {
  return [...allServices];
}

export async function getService(slug: string): Promise<Service | undefined> {
  return allServices.find((s) => s.slug === slug);
}

// --- Posts -----------------------------------------------------------------

/** Newest first. */
export async function getPosts(): Promise<Post[]> {
  return [...allPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return allPosts.find((p) => p.slug === slug);
}

// --- Singletons ------------------------------------------------------------

/**
 * The business details every page renders.
 *
 * Always resolves. The root layout and the enquiry action both await this, and
 * the one thing it must never do is fail a page render or cost somebody their
 * enquiry — the business's phone number always has an answer.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return defaultSiteSettings;
}

/** The copy on a page that is otherwise code. Only the contact page so far. */
export async function getPage(slug: 'contact-us'): Promise<ContactPageCopy> {
  void slug;
  return defaultContactPage;
}
