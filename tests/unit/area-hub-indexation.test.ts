import { describe, expect, it } from 'vitest';
import { generateMetadata as stateMetadata } from '@/app/(site)/areas/[state]/page';
import { generateMetadata as regionMetadata } from '@/app/(site)/areas/[state]/[region]/page';
import sitemap from '@/app/sitemap';
import { qldPresence } from '@/content/locations.overrides';
import { REGIONS, stateSlug } from '@/lib/locations';

/**
 * The area hubs obey `qldPresence`, the same as the suburbs beneath them.
 *
 * `qldPresence` already declared the rule — "while this is false: no second
 * LocalBusiness entity, no QLD locality is indexable, and no QLD copy may
 * claim local presence" — and `computeIndexable` in lib/locations already
 * enforced it at suburb level. It was never carried up to the hubs, so the
 * Queensland state hub and all thirteen Queensland region hubs shipped
 * `index, follow` and sat in the sitemap: fourteen URLs, a quarter of the
 * whole sitemap, for a state with no address, no phone number and no
 * completed project. They cannot win a local query against contractors who
 * are actually there, and they carry the site-wide quality signal down with
 * them.
 *
 * They stay `noindex, follow`, not `noindex, nofollow` — crawlable, still
 * passing equity to the Victorian pages they link, exactly like a Tier 3
 * suburb. Flipping `qldPresence` flips all three levels at once.
 */

type Robots = { index?: boolean; follow?: boolean };

const QLD_REGIONS = REGIONS.filter((r) => r.state === 'QLD');
const VIC_REGIONS = REGIONS.filter((r) => r.state === 'VIC');

async function stateRobots(state: string) {
  const meta = await stateMetadata({ params: Promise.resolve({ state }) });
  return meta.robots as Robots;
}

async function regionRobots(state: string, region: string) {
  const meta = await regionMetadata({ params: Promise.resolve({ state, region }) });
  return meta.robots as Robots;
}

describe('area hub indexation', () => {
  it('has the region split this policy was written for', () => {
    expect(qldPresence).toBe(false);
    expect(QLD_REGIONS).toHaveLength(13);
    expect(VIC_REGIONS).toHaveLength(9);
  });

  it('does not index the Queensland state hub while qldPresence is false', async () => {
    expect(await stateRobots('queensland')).toMatchObject({ index: false, follow: true });
  });

  it('does not index any Queensland region hub while qldPresence is false', async () => {
    for (const region of QLD_REGIONS) {
      expect(await regionRobots('queensland', region.slug), region.slug).toMatchObject({
        index: false,
        follow: true,
      });
    }
  });

  it('indexes the Victorian state hub and every Victorian region hub', async () => {
    expect(await stateRobots('victoria')).toMatchObject({ index: true, follow: true });
    for (const region of VIC_REGIONS) {
      expect(await regionRobots('victoria', region.slug), region.slug).toMatchObject({
        index: true,
        follow: true,
      });
    }
  });

  it('keeps every Queensland hub out of the sitemap', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith('/areas/queensland/'))).toBe(false);
    for (const region of QLD_REGIONS) {
      const path = `/areas/queensland/${region.slug}/`;
      expect(
        urls.some((url) => url.endsWith(path)),
        region.slug,
      ).toBe(false);
    }
  });

  it('keeps every Victorian hub in the sitemap', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith('/areas/victoria/'))).toBe(true);
    for (const region of VIC_REGIONS) {
      const path = `/areas/${stateSlug(region.state)}/${region.slug}/`;
      expect(
        urls.some((url) => url.endsWith(path)),
        region.slug,
      ).toBe(true);
    }
  });

  /**
   * The contradiction the sitemap must never send: a URL that renders
   * `noindex` while the sitemap asks Google to index it. Asserted across
   * every hub rather than for Queensland alone, so it holds after
   * `qldPresence` flips.
   */
  it('never lists a hub it renders noindex', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const region of REGIONS) {
      const slug = stateSlug(region.state);
      const path = `/areas/${slug}/${region.slug}/`;
      const { index } = await regionRobots(slug, region.slug);
      expect(
        urls.some((url) => url.endsWith(path)),
        path,
      ).toBe(index);
    }
  });
});
