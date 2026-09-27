import { describe, expect, it } from 'vitest';
import { metadata as homeMetadata } from '@/app/(site)/page';
import { metadata as commercialMetadata } from '@/app/(site)/commercial/page';
import { roundedDown, scale } from '@/content/scale';

/**
 * "Commercial painters in Melbourne" is the site's primary keyword, and the
 * homepage owns it (decided 27 September 2026). /commercial/ targets
 * "commercial painting services" beside it. Both sides are asserted, because
 * the failure mode is quiet: a later edit that puts the phrase back at the
 * front of /commercial/ has two pages competing for one query and nothing
 * visibly broken. The h1 half of the split is held by the e2e suite.
 */

const titleOf = (m: typeof homeMetadata) => (m.title as { absolute: string }).absolute;
const PRIMARY = /^Commercial Painters (in )?Melbourne/i;

describe('homepage owns the primary keyword', () => {
  const title = titleOf(homeMetadata);
  const description = homeMetadata.description!;

  it('leads the title with it and carries the proof numbers', () => {
    expect(title).toMatch(/^Commercial Painters in Melbourne \| /);
    expect(title).toContain(roundedDown(scale.activeClients, 25));
    expect(title).toContain(roundedDown(scale.activeSites, 50));
  });

  it('keeps the title short enough not to be truncated in results', () => {
    expect(title.length).toBeLessThanOrEqual(62);
  });

  it('leads the description with it, under 160 characters, ending at a sentence', () => {
    expect(description).toMatch(/^Commercial painters in Melbourne/);
    expect(description.length).toBeLessThan(160);
    expect(description).toMatch(/\.$/);
  });
});

describe('/commercial/ does not compete for it', () => {
  it('leads its title and description with the service phrase instead', () => {
    expect(titleOf(commercialMetadata)).not.toMatch(PRIMARY);
    expect(commercialMetadata.description).not.toMatch(PRIMARY);
  });
});
