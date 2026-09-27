/**
 * The sectors our active clients actually sit in, from the client records
 * (September 2026, see content/scale.ts).
 *
 * This is a different list from content/sectors.ts on purpose. That file is
 * the sector *guides*: long-form pages about how a type of building is
 * painted. This one is who the clients are. Where a guide covers the same
 * ground, `href` points at it; where none exists yet, the card is text only
 * rather than a link to a page that would have to be invented.
 *
 * Clients are described by sector only. Never name one here.
 */
export type ClientSector = {
  name: string;
  body: string;
  href?: string;
};

export const clientSectors: readonly ClientSector[] = [
  {
    name: 'Strata and body corporate',
    body: 'Common property painted on a planned maintenance cycle, with owners notified ahead of each stage and access kept open to every lot. Quotes are written so a committee can approve them at one meeting.',
    href: '/body-corporate-and-real-estate-painting-melbourne/',
  },
  {
    name: 'Childcare and early learning',
    body: 'Rooms repainted after hours or across closure days, with low-odour systems and zones handed back ready for the next session. Personnel hold Working with Children Checks.',
    href: '/education-and-childcare-painting-melbourne/',
  },
  {
    name: 'Real estate and property management',
    body: 'Repaints between tenancies, end-of-lease make-goods and ongoing maintenance, turned around to the vacancy window. One point of contact across a whole rent roll.',
    href: '/body-corporate-and-real-estate-painting-melbourne/',
  },
  {
    name: 'Commercial property',
    body: 'Offices, tenancies and building exteriors kept on a repaint cycle for owners and facilities managers. Work is staged around tenants so the building stays leased and trading.',
    href: '/office-painters/',
  },
  {
    name: 'Aged care',
    body: 'Painting inside homes where residents stay throughout: room-by-room handovers, low-odour coatings, clear walkways and personnel with current police checks.',
    href: '/aged-care-and-retirement-painting/',
  },
  {
    name: 'Community and not-for-profit',
    body: 'Halls, clubrooms and service centres painted around the bookings and programmes that run in them, with the scope itemised so it can be matched to a grant or a board-approved budget.',
  },
  {
    name: 'Retail',
    body: 'Shopfronts and tenancies painted before opening or after close, so trading days are not lost. Centre management rules, loading access and signage are coordinated in advance.',
    href: '/retail-painting/',
  },
];
