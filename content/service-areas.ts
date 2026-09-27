/**
 * Where the work is, from the client records (September 2026, see
 * content/scale.ts).
 *
 * The metro groups are the suburbs with the most active sites, not a list of
 * every suburb with a page — /areas/ is that. They are grouped the way a
 * facilities manager describes Melbourne rather than by the nine region hubs
 * in lib/locations/regions.ts, so a group here is not a region slug.
 *
 * `slug` is the Victorian locality slug in content/locations.generated.json.
 * Every metro suburb here has a page, and a test holds that. The regional
 * towns sit outside the generated dataset (it stops at about 50 km from
 * Bayswater North), so they carry no page and render as plain text.
 *
 * Interstate work exists but is a few percent of the book and is not promoted
 * as a service area. Do not add it here.
 */
export type AreaSuburb = { name: string; slug: string };
export type AreaGroup = { name: string; suburbs: readonly AreaSuburb[] };

export const metroAreaGroups: readonly AreaGroup[] = [
  {
    name: 'Eastern suburbs',
    suburbs: [
      { name: 'Lilydale', slug: 'lilydale' },
      { name: 'Croydon', slug: 'croydon' },
      { name: 'Ringwood', slug: 'ringwood' },
      { name: 'Boronia', slug: 'boronia' },
      { name: 'Mitcham', slug: 'mitcham' },
      { name: 'Bayswater', slug: 'bayswater' },
      { name: 'Mooroolbark', slug: 'mooroolbark' },
      { name: 'Ringwood East', slug: 'ringwood-east' },
      { name: 'Box Hill', slug: 'box-hill' },
      { name: 'Forest Hill', slug: 'forest-hill' },
    ],
  },
  {
    name: 'Inner Melbourne',
    suburbs: [
      { name: 'Melbourne CBD', slug: 'melbourne' },
      { name: 'South Yarra', slug: 'south-yarra' },
      { name: 'St Kilda', slug: 'st-kilda' },
    ],
  },
  {
    name: 'South-east',
    suburbs: [
      { name: 'Cheltenham', slug: 'cheltenham' },
      { name: 'Caulfield North', slug: 'caulfield-north' },
      { name: 'Mentone', slug: 'mentone' },
      { name: 'Noble Park', slug: 'noble-park' },
      { name: 'Clyde North', slug: 'clyde-north' },
      { name: 'Frankston', slug: 'frankston' },
    ],
  },
  {
    name: 'West and North',
    suburbs: [{ name: 'Point Cook', slug: 'point-cook' }],
  },
];

/**
 * Regional Victoria. Also emitted as `areaServed` in lib/schema, so the towns
 * the page names and the towns the structured data declares are one list.
 */
export const regionalTowns: readonly string[] = [
  'Geelong',
  'Ballarat',
  'Bendigo',
  'Shepparton',
  'Warrnambool',
  'Traralgon',
  'Wodonga',
  'Mildura',
  'Echuca',
  'Torquay',
  'Warragul',
  'Wangaratta',
];
