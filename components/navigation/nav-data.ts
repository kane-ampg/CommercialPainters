import { sectors } from '@/content/sectors';
import { posts } from '@/content/posts';

export type NavChild = { label: string; href: string; description?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

/**
 * The blog slot, present only while there is something to read.
 *
 * `content/posts.ts` is empty, so both nav bars were pointing at a page whose
 * entire body is "Nothing published yet." — sitewide links into a dead end,
 * and the strongest internal signal the site can send about a section with no
 * content in it. app/(site)/blog/page.tsx and app/sitemap.ts derive the same
 * thing from the same count, so the first published post restores all four
 * surfaces together.
 *
 * Read from `content/posts.ts` rather than through `getPosts()` because the
 * nav is a synchronous module rendered inside client components; the adapter
 * is async. It is the same array either way.
 */
const blogNav: readonly NavChild[] = posts.length > 0 ? [{ label: 'Blog', href: '/blog/' }] : [];

/**
 * Main navigation.
 *
 * Commercial leads, and its dropdown surfaces the eight sector pages. Projects
 * sits in the main bar because it is the strongest evidence the business has.
 *
 * Sector hrefs come from each sector's `legacyPath`, the root-level URL its
 * page lives at.
 */
export const mainNav: readonly NavItem[] = [
  {
    label: 'Commercial',
    href: '/commercial/',
    children: [
      { label: 'Commercial painting', href: '/commercial/', description: 'Overview' },
      { label: 'Office painting', href: '/office-painters/' },
      ...sectors
        .filter((s) => s.legacyPath !== '/commercial/')
        .map((s) => ({ label: s.shortTitle, href: s.legacyPath })),
    ],
  },
  {
    label: 'Service Areas',
    href: '/areas/',
    children: [
      { label: 'Service areas', href: '/areas/', description: 'Overview' },
      { label: 'Victoria', href: '/areas/victoria/' },
      { label: 'Queensland', href: '/areas/queensland/' },
    ],
  },
  { label: 'Projects', href: '/projects/' },
  ...blogNav,
  { label: 'Trade services', href: '/trade-services/' },
  { label: 'About', href: '/about-us/' },
  { label: 'Contact', href: '/contact-us/' },
] as const;

export const footerNav = {
  commercial: [
    { label: 'Commercial painting', href: '/commercial/' },
    { label: 'Office painting', href: '/office-painters/' },
    ...sectors.map((s) => ({ label: s.shortTitle, href: s.legacyPath })),
  ],
  company: [
    { label: 'About us', href: '/about-us/' },
    { label: 'Projects', href: '/projects/' },
    ...blogNav,
    { label: 'Contact us', href: '/contact-us/' },
  ],
  areas: [
    { label: 'Service areas', href: '/areas/' },
    { label: 'Victoria', href: '/areas/victoria/' },
    { label: 'Queensland', href: '/areas/queensland/' },
  ],
} as const;
