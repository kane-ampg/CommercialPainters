import { describe, expect, it } from 'vitest';
import { indexableLocalities } from '@/lib/locations';

/**
 * Local government areas for every indexable suburb, verified by hand against
 * the suburb's own record (Wikipedia infobox / council locality lists,
 * checked 2026-08-27).
 *
 * The upstream dataset's `lgaregion` column is wrong for roughly 7% of
 * localities — scripts/build-locations.mts documents this — and five of those
 * errors landed on Tier 1 pages: Ringwood was shown in Manningham while being
 * the seat of Maroondah, Vermont in Maroondah while sitting in Whitehorse.
 * A suburb page that names the wrong council is worse than no suburb page,
 * because it proves the content is generated.
 *
 * Every suburb this site actually indexes gets its council pinned here, so a
 * regeneration of the dataset cannot silently reintroduce a wrong one. For
 * suburbs split across councils (Tullamarine, Port Melbourne) the pinned
 * value is the council covering the suburb's commercial core.
 *
 * 2026-10-12: the sixteen homepage service-area suburbs, checked against
 * Wikipedia and the councils' own records before promotion. Three were wrong
 * in the dataset and are corrected in scripts/build-locations.mts: Clyde
 * North (Cardinia, is Casey), South Yarra (Melbourne, but Chapel Street and
 * Toorak Road are Stonnington) and Cheltenham (Bayside, but Southland, the
 * Charman Road shops and the industrial streets are Kingston).
 */
const VERIFIED_COUNCILS: Record<string, string> = {
  'VIC|bayswater': 'Knox',
  'VIC|bayswater-north': 'Maroondah',
  'VIC|boronia': 'Knox',
  'VIC|box-hill': 'Whitehorse',
  'VIC|braeside': 'Kingston (Vic.)',
  'VIC|brighton': 'Bayside (Vic.)',
  'VIC|campbellfield': 'Hume',
  'VIC|caulfield-north': 'Glen Eira',
  'VIC|cheltenham': 'Kingston (Vic.)',
  'VIC|chirnside-park': 'Yarra Ranges',
  'VIC|clayton': 'Monash',
  'VIC|clyde-north': 'Casey',
  'VIC|croydon': 'Maroondah',
  'VIC|dandenong-south': 'Greater Dandenong',
  'VIC|donvale': 'Manningham',
  'VIC|forest-hill': 'Whitehorse',
  'VIC|frankston': 'Frankston',
  'VIC|laverton-north': 'Wyndham',
  'VIC|lilydale': 'Yarra Ranges',
  'VIC|melbourne': 'Melbourne',
  'VIC|mentone': 'Kingston (Vic.)',
  'VIC|mitcham': 'Whitehorse',
  'VIC|mooroolbark': 'Yarra Ranges',
  'VIC|noble-park': 'Greater Dandenong',
  'VIC|notting-hill': 'Monash',
  'VIC|point-cook': 'Wyndham',
  'VIC|port-melbourne': 'Port Phillip',
  'VIC|richmond': 'Yarra',
  'VIC|ringwood': 'Maroondah',
  'VIC|ringwood-east': 'Maroondah',
  'VIC|south-melbourne': 'Port Phillip',
  'VIC|south-yarra': 'Stonnington',
  'VIC|st-kilda': 'Port Phillip',
  'VIC|tullamarine': 'Brimbank',
  'VIC|vermont': 'Whitehorse',
};

describe('indexable suburb councils', () => {
  it('has a hand-verified council entry for every indexable suburb', () => {
    for (const l of indexableLocalities()) {
      expect(
        VERIFIED_COUNCILS[`${l.state}|${l.slug}`],
        `${l.state}|${l.slug} is indexable but has no verified council in this table — verify it before it ships as a fact`,
      ).toBeDefined();
    }
  });

  it('renders the verified council on every indexable page', () => {
    for (const l of indexableLocalities()) {
      const expected = VERIFIED_COUNCILS[`${l.state}|${l.slug}`];
      if (!expected) continue;
      expect(l.council.name, `${l.state}|${l.slug}`).toBe(expected);
    }
  });
});
