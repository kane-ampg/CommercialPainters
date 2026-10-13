/**
 * Suburb pages whose URL changed, old path to new.
 *
 * A suburb's URL carries its region, and its region comes from its council,
 * so correcting a council can move the page. These are the moves made by the
 * council corrections in scripts/build-locations.mts. Each one is a permanent
 * redirect in next.config.ts, so a link or crawl of the old URL lands on the
 * page rather than a 404.
 *
 * No imports: next.config.ts reads this file and does not resolve the `@/`
 * alias. tests/unit/moved-localities.test.ts checks every destination is a
 * live suburb page and every source is not.
 */
export const MOVED_LOCALITY_PATHS: Readonly<Record<string, string>> = {
  // 12 October 2026: Clyde and Clyde North are City of Casey. The dataset had
  // them in Cardinia, which filed them as rural fringe in the hinterland hub.
  '/areas/victoria/yarra-valley-and-hinterland/clyde/': '/areas/victoria/south-east/clyde/',
  '/areas/victoria/yarra-valley-and-hinterland/clyde-north/':
    '/areas/victoria/south-east/clyde-north/',
  // 12 October 2026: South Yarra's commercial core, Chapel Street and Toorak
  // Road, is in Stonnington. The dataset had the City of Melbourne, which holds
  // only the part west of Punt Road.
  '/areas/victoria/inner-melbourne/south-yarra/': '/areas/victoria/inner-east/south-yarra/',
};
