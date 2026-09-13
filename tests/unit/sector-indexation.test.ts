import { describe, expect, it } from 'vitest';
import { sectors } from '@/content/sectors';
import { projects } from '@/content/projects';
import { generateMetadata } from '@/app/(site)/[sector]/page';
import sitemap from '@/app/sitemap';

/**
 * Sector indexation is not gated on evidence. Evidence gates the claim.
 *
 * These eight pages were previously indexable only when the sector documented
 * a completed project, which kept five of them — aged care, strata, retail,
 * hospitality, leisure — out of Google entirely. That rule was borrowed from
 * the suburb tiers, where it is right, and it does not transfer: a Tier 3
 * suburb page is generated boilerplate, whereas every sector page carries
 * hand-written sector copy (`considerations`, `body`, `faqs`) that exists for
 * no other URL on the site. Withholding them cost the highest commercial
 * intent inventory the business has — "strata painting Melbourne" and its
 * siblings — to avoid a thinness that was never there.
 *
 * What evidence still controls is the Evidence section itself: with no
 * documented project it renders a Placeholder that states the sector makes no
 * experience claim, rather than a project grid. That is the honest disclosure,
 * and it is what makes the page safe to index. The two ideas are now
 * separate — indexation is unconditional, the claim is earned.
 */

function paramsFor(legacyPath: string) {
  return { params: Promise.resolve({ sector: legacyPath.replace(/\//g, '') }) };
}

// Derived here independently of the production helper, so the test cannot be
// satisfied by the helper agreeing with itself. Evidence lives in two lists
// that can drift — the sector's curated projectSlugs and each project's own
// sectorSlug — and either one counts.
function hasEvidence(sector: (typeof sectors)[number]): boolean {
  return sector.projectSlugs.length > 0 || projects.some((p) => p.sectorSlug === sector.slug);
}

type Robots = { index?: boolean; follow?: boolean };

describe('sector indexation', () => {
  it('has the eight sectors this policy was written for', () => {
    expect(sectors).toHaveLength(8);
  });

  it('indexes every sector page, documented project or not', async () => {
    for (const sector of sectors) {
      const meta = await generateMetadata(paramsFor(sector.legacyPath));
      expect((meta.robots as Robots).index, sector.slug).toBe(true);
      expect((meta.robots as Robots).follow, sector.slug).toBe(true);
    }
  });

  it('lists every sector page in the sitemap', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const sector of sectors) {
      expect(
        urls.some((url) => url.endsWith(sector.legacyPath)),
        sector.slug,
      ).toBe(true);
    }
  });

  /**
   * The regression this replaces. Five sectors have no documented project, and
   * the old rule is the reason they were invisible — if a future edit reaches
   * for `sectorHasDocumentedProject` to decide indexation again, this fails.
   */
  it('still indexes the sectors that document no project', async () => {
    const undocumented = sectors.filter((s) => !hasEvidence(s));
    expect(undocumented.length).toBeGreaterThan(0);

    const urls = (await sitemap()).map((entry) => entry.url);
    for (const sector of undocumented) {
      const meta = await generateMetadata(paramsFor(sector.legacyPath));
      expect((meta.robots as Robots).index, sector.slug).toBe(true);
      expect(
        urls.some((url) => url.endsWith(sector.legacyPath)),
        sector.slug,
      ).toBe(true);
    }
  });
});
