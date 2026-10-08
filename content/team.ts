import photos from '@/content/team-photos.generated.json';

/**
 * The team, for /about-us/our-team/.
 *
 * Transcribed from the group's own team page (8 October 2026), in its order:
 * founder and directors first, the office last. Nothing here is invented.
 *
 * Were the list empty, the page would render `noindex` and nothing would link
 * to it:
 * the footer, the sitemap and the about page all read `team.length`, the same
 * rule the blog slot follows in components/navigation/nav-data.ts. The first
 * entry turns all of them on together.
 *
 * Titles are held to the commercial positioning like every other source file —
 * the unit test that bans the private-dwelling adjective scans this one too,
 * which is why this paragraph talks around it — so a title carrying a
 * qualifier for work this site does not offer is shown without it.
 */
export type TeamMember = {
  /** Kebab-case name. Also the portrait's file name: public/images/team/<slug>.webp. */
  slug: string;
  name: string;
  role: string;
  /**
   * A real profile URL, or nothing. A link to LinkedIn's own feed is a page
   * about the visitor, not about the person on the card — leave it off.
   */
  linkedin?: string;
};

export const team: readonly TeamMember[] = [
  { slug: 'fred-mollaei', name: 'Fred Mollaei', role: 'Founder' },
  {
    slug: 'farbod-mollaei',
    name: 'Farbod Mollaei',
    role: 'Managing Director',
    linkedin: 'https://www.linkedin.com/in/farbod-mollaei-0298199b/',
  },
  {
    slug: 'zac-karannagoda',
    name: 'Zac Karannagoda',
    role: 'Assistant General Manager',
    linkedin: 'https://www.linkedin.com/in/zac-karannagoda-ba8a6368/',
  },
  {
    slug: 'ash-rankin',
    name: 'Ash Rankin',
    role: 'Service Manager',
    linkedin: 'https://www.linkedin.com/in/ashley-rankin-4bb900255/',
  },
  {
    slug: 'chamz-abeyratne',
    name: 'Chamz Abeyratne',
    role: 'Human Resources Manager',
    linkedin: 'https://www.linkedin.com/in/chamika-a-26a56682/',
  },
  { slug: 'simon-taranek', name: 'Simon Taranek', role: 'Senior Business Development Manager' },
  { slug: 'jordan-james', name: 'Jordan James', role: 'Business Development Manager' },
  { slug: 'jack-wilson', name: 'Jack Wilson', role: 'Account Manager, Reactive' },
  { slug: 'grace-niksic', name: 'Grace Niksic', role: 'Account Manager, Reactive' },
  { slug: 'reece-spadaccini', name: 'Reece Spadaccini', role: 'Account Manager, Painting' },
  { slug: 'kit-cheong', name: 'Kit Cheong', role: 'Estimator' },
  { slug: 'kyle-woodlock', name: 'Kyle Woodlock', role: 'Project Supervisor, Commercial' },
  { slug: 'ali-utuk', name: 'Ali Utuk', role: 'Project Supervisor' },
  { slug: 'omid-rahmani', name: 'Omid Rahmani', role: 'Site Supervisor, Painting' },
  { slug: 'mikayla-mortimer', name: 'Mikayla Mortimer', role: 'Customer Services Assistant' },
  { slug: 'nicole-chin', name: 'Nicole Chin', role: 'Digital Content Creator' },
  { slug: 'amy-small', name: 'Amy Small', role: 'Procurement Coordinator' },
];

/**
 * Encoded portraits, keyed by slug.
 *
 * Written by scripts/build-team-images.mjs, which is the only thing that knows
 * a portrait exists. A member with no entry keeps the initials card, so a
 * missing master is a visible gap on the page rather than a broken image.
 */
const manifest: Readonly<Record<string, { width: number; height: number }>> = photos;

export type TeamPhoto = { src: string; width: number; height: number };

export function teamPhoto(slug: string): TeamPhoto | null {
  const entry = manifest[slug];
  return entry ? { src: `/images/team/${slug}.webp`, ...entry } : null;
}

/** Two-letter monogram for a card with no portrait yet. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
