/**
 * Proof of scale, from the client's own records.
 *
 * The one place these figures live. The proof strip, the homepage and
 * /commercial/ metadata and /llms.txt all read from here, so an update is one
 * edit.
 *
 * Store the exact figures from the records and let `scaleFigures` round them.
 * Every published figure is rounded DOWN and carries a "+", so a figure on the
 * page can go stale by being too modest, never by overstating.
 *
 * The client list itself is not published and no client is named anywhere on
 * the site without written approval. Describe clients by sector only.
 */
export const scale = {
  /** When the records were read. Shown beside the figures. */
  asOf: 'September 2026',
  activeClients: 225,
  businessClients: 175,
  privateOwnerClients: 50,
  activeSites: 1358,
  multiSiteClients: 84,
  /** "About 365" in the records, so it is rounded down harder than the rest. */
  suburbs: 365,
  postcodes: 270,
  /** Share of work in Victoria. The rest is a little interstate work that is not promoted. */
  victoriaSharePercent: 97,
} as const;

/** Rounds down to `step` and formats with a trailing "+", e.g. 1358 → "1,350+". */
export function roundedDown(value: number, step: number): string {
  return `${(Math.floor(value / step) * step).toLocaleString('en-AU')}+`;
}

export type ScaleFigure = { figure: string; label: string; detail: string };

/** The figures the proof strip shows, in order. */
export const scaleFigures: readonly ScaleFigure[] = [
  {
    figure: roundedDown(scale.activeClients, 25),
    label: 'Active clients',
    detail: 'Businesses, organisations and private property owners on our books today.',
  },
  {
    figure: roundedDown(scale.activeSites, 50),
    label: 'Sites serviced',
    detail: 'Buildings we currently look after, from single shopfronts to multi-site portfolios.',
  },
  {
    figure: roundedDown(scale.suburbs, 50),
    label: 'Suburbs and towns',
    detail: 'Across metropolitan Melbourne and regional Victoria.',
  },
  {
    figure: roundedDown(scale.multiSiteClients, 10),
    label: 'Multi-site clients',
    detail: 'Clients who trust us with more than one of their sites.',
  },
];
