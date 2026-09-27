import { describe, expect, it } from 'vitest';
import { metadata as commercialMetadata } from '@/app/(site)/commercial/page';
import { clientSectors } from '@/content/client-sectors';
import { roundedDown, scale, scaleFigures } from '@/content/scale';
import { metroAreaGroups, regionalTowns } from '@/content/service-areas';
import { sectors } from '@/content/sectors';
import { hrefForVicSlug } from '@/lib/locations';

/**
 * The proof-of-scale figures, the client sectors and the service-area lists
 * (content/scale.ts, content/client-sectors.ts, content/service-areas.ts).
 */

describe('scale figures', () => {
  it('rounds down and marks the figure with a plus', () => {
    expect(roundedDown(1358, 50)).toBe('1,350+');
    expect(roundedDown(225, 25)).toBe('225+');
    expect(roundedDown(365, 50)).toBe('350+');
    expect(roundedDown(84, 10)).toBe('80+');
  });

  it('never publishes a figure above the recorded one', () => {
    const recorded = [
      scale.activeClients,
      scale.activeSites,
      scale.suburbs,
      scale.multiSiteClients,
    ];
    scaleFigures.forEach((item, i) => {
      const shown = Number(item.figure.replace(/[^\d]/g, ''));
      expect(shown, item.label).toBeLessThanOrEqual(recorded[i]!);
      expect(item.figure, item.label).toMatch(/\+$/);
    });
  });

  it('keeps the client split consistent with the total', () => {
    expect(scale.businessClients + scale.privateOwnerClients).toBe(scale.activeClients);
  });
});

describe('/commercial/ metadata', () => {
  const title = (commercialMetadata.title as { absolute: string }).absolute;
  const description = commercialMetadata.description!;

  it('leads with the service phrase and carries the proof numbers', () => {
    expect(title).toMatch(/^Commercial Painting Services Melbourne/);
    expect(description).toMatch(/^Commercial painting services in Melbourne/);
    expect(description).toContain(roundedDown(scale.activeSites, 50));
  });

  it('keeps the description under 160 characters', () => {
    expect(description.length).toBeLessThan(160);
  });
});

describe('service areas', () => {
  it('links every metro suburb to a real Victorian locality page', () => {
    for (const group of metroAreaGroups) {
      for (const suburb of group.suburbs) {
        expect(hrefForVicSlug(suburb.slug), suburb.name).toBeDefined();
      }
    }
  });

  it('lists each suburb and town once', () => {
    const names = [
      ...metroAreaGroups.flatMap((g) => g.suburbs.map((s) => s.name)),
      ...regionalTowns,
    ];
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('client sectors', () => {
  it('links only to sector guides and pages that exist', () => {
    const known = new Set([...sectors.map((s) => s.legacyPath), '/office-painters/']);
    for (const item of clientSectors) {
      if (item.href) expect(known.has(item.href), item.name).toBe(true);
    }
  });
});
