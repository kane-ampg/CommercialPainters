import manifest from '@/content/galleries.generated.json';
import type { MediaRef } from '@/lib/content/types';

/**
 * Site photography.
 *
 * Seven commercial sites the business has photographed properly. This file is
 * the editorial half of that: what each site is, and what each frame shows.
 * The other half — dimensions and blur placeholders — is measured off the
 * files by scripts/build-gallery-images.mjs into galleries.generated.json, and
 * the two are joined by `galleries` at the bottom.
 *
 * ## What a gallery is allowed to claim
 *
 * Nothing that is not in the photograph. These sites have no project record
 * behind them — no scope, no preparation, no coating system, no duration, no
 * outcome — so they are NOT case studies and must never be presented as one.
 * `content/projects.ts` is where a documented project lives, and every field
 * in it is transcribed from the business's own records. A gallery says only
 * "here is this site, and here is what the photographs show happening on it".
 *
 * Alt text was written against each frame and then checked against it a second
 * time, adversarially, for claims the picture does not support. That is why
 * several read "an interior wall" where the set is plainly an office: the
 * office is visible across the set but not in that frame, and alt text
 * describes the frame it is attached to.
 *
 * ## Why two of the nine shoots are missing
 *
 * Two of the delivered shoots are of private dwellings, and this site is
 * commercial only. The unit test that holds that line scans this file for the
 * adjective it bans, which is why the paragraph talks around it. The shoots
 * are excluded by the allow-list in scripts/build-gallery-images.mjs, so their
 * frames are never encoded and do not exist under public/ at all.
 */

/**
 * Alt text, keyed by the photographer's own file name.
 *
 * NOT by the published file name, which is positional — the encoder renumbers
 * its output `<slug>-01.webp`, `<slug>-02.webp` and so on in source order. Key
 * on that and the mapping is only correct until the first time a frame is
 * added or held back: every frame after it shifts up a number, and each alt
 * text silently transfers to the neighbouring photograph. Nothing fails, no
 * test goes red, and fifty descriptions quietly become wrong. Holding the van
 * frame back nearly did exactly this and was saved only by it being last.
 *
 * The delivered name is the one stable identity a frame has, so it is the key.
 * `sourceFile` in the manifest is what joins the two.
 *
 * A file with no entry here is dropped by `galleries` rather than shipped with
 * empty alt, and tests/unit/galleries.test.ts fails when that happens.
 */
const ALT: Record<string, string> = {
  /* Toyota dealership, Croydon */
  'Toyota Dealership 08042026-1.jpg':
    'Chrome Toyota emblem and red lettering on the fascia above the dealership showroom entry, gum leaves overhead',
  'Toyota Dealership 08042026-2.jpg':
    'A painter in company uniform kneeling to cut in the base of a showroom wall with a brush beside a paint pail',
  'Toyota Dealership 08042026-3.jpg':
    'A painter rolling a column in the showroom with an extension-pole roller, stepladder and plastic-sheeted desk behind',
  'Toyota Dealership 08042026-4.jpg':
    'A painter on a stepladder running an extension-pole roller across a bulkhead above the showroom floor',
  'Toyota Dealership 08042026-5.jpg':
    'A painter in company uniform rolling a wall beside the timber Toyota feature wall, furniture under plastic sheeting',
  'Toyota Dealership 08042026-6.jpg':
    "Chrome Toyota emblem on a timber feature wall above the reception counter, a painter's roller pole in the foreground",
  'Toyota Dealership 08042026-7.jpg':
    'A painter in company uniform steadying an extension-pole roller in the dealership foyer, reception counter behind',
  'Toyota Dealership 08042026-8.jpg':
    'A painter working an extension-pole roller up a showroom wall, glazing and a display vehicle behind',
  'Toyota Dealership 08042026-9.jpg':
    'A painter in company uniform reaching high with an extension-pole roller, masking tape and paper protecting the tiled floor',
  'Toyota Dealership 08042026-10.jpg':
    'A painter rolling a showroom wall with an extension pole, loaded roller tray on the floor beside a display vehicle',
  'Toyota Dealership 08042026-11.jpg':
    'A painter sanding an office wall with a vacuum-fed pole sander, masking tape at the wall base and floor protection down',
  'Toyota Dealership 08042026-12.jpg':
    'A painter working a hand roller across an office wall, glazing and the carpark beyond',
  'Toyota Dealership 08042026-13.jpg':
    'A painter in company uniform rolling out an interior wall with an extension-pole roller beside a window overlooking the carpark',
  'Toyota Dealership 08042026-14.jpg':
    'A painter in company uniform working an extension-pole roller across an interior wall, window and carpark behind',

  /* Christensen Street, Cheltenham */
  '20 Christensen Street, Cheltenham-1.jpg':
    'Painter in company uniform rolling a high wall above a timber stair with an extension-pole roller, standing on a protected landing',
  '20 Christensen Street, Cheltenham-2.jpg':
    'Painter in company uniform rolling a wall with an extension pole beside a kitchenette masked off with green tape',
  '20 Christensen Street, Cheltenham-3.jpg':
    'Painter in company uniform running an extension-pole roller down a taped wall, roller tray and stepladder on the covered floor',
  '20 Christensen Street, Cheltenham-4.jpg':
    'Painter in company uniform working an extension-pole roller across a high wall, green tape along the floor line and a roller tray below',
  '20 Christensen Street, Cheltenham-5.jpg':
    'Painter in company uniform rolling a wall edge beside full-height glazing, the window framing masked with green tape',
  '20 Christensen Street, Cheltenham-6.jpg':
    'Painter in a safety harness on an elevated work platform rolling a high bulkhead below exposed steel roof framing',
  '20 Christensen Street, Cheltenham-7.jpg':
    'Painter in a safety harness on an elevated work platform cutting in along a masked bulkhead edge with a small roller',
  '20 Christensen Street, Cheltenham-8.jpg':
    'Upper-level office suite with white walls, black-framed glazing to a balcony and a suspended grid ceiling above dark carpet',
  '20 Christensen Street, Cheltenham-9.jpg':
    'Empty office suite with painted white walls, grid ceiling and a black cable balustrade around the stair void',
  '20 Christensen Street, Cheltenham-10.jpg':
    'Office suite with white walls, a timber kitchenette with sink and tiled splashback, and black-framed glazing to the outside',
  '20 Christensen Street, Cheltenham-11.jpg':
    'Tiled external balcony with a glass balustrade, white panelled wall and black-framed glazing, looking over the carpark below',
  '20 Christensen Street, Cheltenham-12.jpg':
    'Empty office room with white painted walls, a run of ribbon windows, suspended grid ceiling and dark carpet',
  '20 Christensen Street, Cheltenham-13.jpg':
    'Office room with white painted walls, ribbon windows and an internal window through to the next space',
  '20 Christensen Street, Cheltenham-14.jpg':
    'Office room with white walls, a raked run of windows under a grid ceiling and dark carpet throughout',

  /* BYD dealership, Bayswater */
  'BYD 899 Mountain Highway Bayswater-1.jpg':
    'A painter in company uniform stepping past a chain-mesh gate onto plastic sheeting, BYD signage on the building behind',
  'BYD 899 Mountain Highway Bayswater-2.jpg':
    'Three of the crew opening a tin and loading render beside stacked Quikcote trowel texture pails and Taubmans buckets on white drop sheets',
  'BYD 899 Mountain Highway Bayswater-3.jpg':
    'A painter in company uniform holding a drill-mounted mixing paddle while lifting a lid off a pail, stacked buckets and a boxed spray station alongside',
  'BYD 899 Mountain Highway Bayswater-4.jpg':
    'A painter in company uniform pouring white paint from a tin in the warehouse bay, orange traffic bollards standing alongside',
  'BYD 899 Mountain Highway Bayswater-5.jpg':
    'White paint poured from a tin into containers below, pails and orange safety bollards lining the open warehouse bay',
  'BYD 899 Mountain Highway Bayswater-6.jpg':
    'A painter on a scissor lift working an airless spray gun with extension wand across the corrugated wall cladding',
  'BYD 899 Mountain Highway Bayswater-7.jpg':
    'Spraying the upper corrugated cladding from a scissor lift basket, the spray fan landing beside the downpipe',
  'BYD 899 Mountain Highway Bayswater-8.jpg':
    'Airless spray gun on an extension wand coating cladding near the eaves, worked from a raised scissor lift basket',
  'BYD 899 Mountain Highway Bayswater-9.jpg':
    'A painter on a raised scissor lift spraying a long run of wall cladding above louvred wall vents, black sheeting draped below',
  'BYD 899 Mountain Highway Bayswater-10.jpg':
    'A painter in company uniform floating render onto the wall beside a black roller shutter, filling knife in the other hand',
  'BYD 899 Mountain Highway Bayswater-11.jpg':
    'A painter in company uniform working render flat with a float beside the roller shutter, covered driveway open behind',

  /* Our Lady of the Pines Primary School */
  'Our Lady of the Pines Primary School-1.jpg':
    'Painter rolling above a masked classroom doorway with a mini roller, brush and paint pail held in the other hand, chairs stacked aside',
  'Our Lady of the Pines Primary School-2.jpg':
    'A painter reaching up to brush the top corner of a classroom door frame, mini roller and pail held in the other hand',
  'Our Lady of the Pines Primary School-3.jpg':
    'A painter in company uniform rolling white paint down a classroom door stile, another worker bent over the bench behind',
  'Our Lady of the Pines Primary School-4.jpg':
    'Painter in company uniform rolling a flat joinery panel on a classroom table, more white-coated panels alongside',
  'Our Lady of the Pines Primary School-5.jpg':
    'Two painters in a classroom, one in company uniform rolling beside a doorway, the other rolling a high wall line, timber pigeonhole unit pulled clear',

  /* Saint Bar */
  'Saint Bar-1.jpg':
    'Bar interior with exposed brick, white-painted timber ceiling beams and a black mural feature wall beside the stone-topped bar',
  'Saint Bar-1-2.jpg':
    'A painter in company uniform cutting in the ceiling line above exposed brick from a mobile scaffold, mural wall masked off behind plastic sheeting',
  'Saint Bar-2.jpg':
    'A painter spraying the timber-lined ceiling from a mobile scaffold, with the mural wall below masked in plastic sheeting and yellow tape',

  /* 2-4 Heather Street, South Melbourne */
  '2-4 Heather Street-1.jpg':
    'A painter in company uniform crouching on tiles, filling the base of a foyer wall with a filling knife, masking tape run along the floor line',
  '2-4 Heather Street-2.jpg':
    'A filling knife pressed to a patched wall beside a white doorframe, yellow tape run along the floor line and across the tiles at the jamb',
  '2-4 Heather Street-3.jpg':
    'Apartment foyer seen through glazed doors lettered 2-4 Heather St, a painter filling the wall beside drop sheets, pails and masking tape',
  '2-4 Heather Street-6.jpg':
    'Brick apartment building entry under a cantilevered concrete canopy, name plate on the brickwork and garden beds beside the paved forecourt',

  /* Kinkora Road, Hawthorn */
  '47 Kinkora Rd, Hawthorn-1.jpg':
    'Painter in company uniform running an extension-pole roller along a corridor wall, roller tray, paint tins and stepladder behind',
  '47 Kinkora Rd, Hawthorn-2.jpg':
    'Painter in company uniform with an extension-pole roller in a part-stripped corridor, tripod work light, timber bracing and stepladder behind',
  '47 Kinkora Rd, Hawthorn-3.jpg':
    'A painter on a stepladder applying sealant from a cartridge under the verandah gutter, beside cream-painted verandah lacework, scaffolding overhead',
};

export type WorkGallery = {
  slug: string;
  /** How the site is named on the page. */
  label: string;
  /** What the building visibly is. Not a sector claim — see `sectorSlug`. */
  buildingType: string;
  /** Omitted where the source folder did not record one. Never guessed. */
  suburb?: string;
  /** One sentence on what the set collectively shows. Observational only. */
  caption: string;
  /**
   * The sector page this site belongs beside, where one fits.
   *
   * Display only. It deliberately does NOT feed `sectorHasDocumentedProject`
   * in content/projects.ts — photographs are not a written-up case study, and
   * a sector must not become "evidenced" because a gallery was pointed at it.
   */
  sectorSlug?: string;
  images: readonly MediaRef[];
};

/**
 * Site metadata, in the order the galleries are shown.
 *
 * Ordered by how well the set carries the commercial proposition, not by frame
 * count: the dealership showroom and the office fitout lead because they show
 * an occupied building and a staged handover, which is what the rest of the
 * site claims the business is for.
 *
 * `cover` names the frame that leads the set, by the photographer's delivered
 * file name — the same key `ALT` uses, and for the same reason. It was an index
 * into the manifest, which silently clamped to 0 when out of range: `saint-bar`
 * carried `cover: 12` against a three-frame set for exactly as long as it took
 * a reviewer to notice, with a green test suite throughout. A name cannot be
 * off by one, and tests/unit/galleries.test.ts fails on one that matches
 * nothing.
 *
 * Where two frames were equally good, the lead is the one where the crew's
 * uniform branding is least legible — see the note on photography at the top
 * of this file.
 */
const SITES: readonly (Omit<WorkGallery, 'images'> & { cover: string })[] = [
  {
    slug: 'toyota-croydon',
    label: 'Toyota dealership, Croydon',
    buildingType: 'Car dealership showroom and offices',
    suburb: 'Croydon',
    caption:
      'Rolling and cutting in walls, columns and ceiling bulkheads across a dealership showroom, reception and offices, with displays sheeted and floors masked.',
    sectorSlug: 'retail',
    cover: 'Toyota Dealership 08042026-3.jpg',
  },
  {
    slug: 'christensen-street-cheltenham',
    label: 'Christensen Street, Cheltenham',
    buildingType: 'Office suites in a commercial unit development',
    suburb: 'Cheltenham',
    caption:
      'Walls and ceilings rolled out across office suites under fitout — off extension poles at floor level and off an elevated platform at the bulkheads — and the finished rooms with the coats on and the floors clear.',
    cover: '20 Christensen Street, Cheltenham-6.jpg',
  },
  {
    slug: 'byd-bayswater',
    label: 'BYD dealership, Bayswater',
    buildingType: 'Dealership and workshop',
    suburb: 'Bayswater',
    caption:
      'Coatings decanted and mixed in the workshop bay, wall cladding sprayed from a scissor lift, and render trowelled out beside the roller shutters.',
    sectorSlug: 'industrial',
    cover: 'BYD 899 Mountain Highway Bayswater-6.jpg',
  },
  {
    slug: 'our-lady-of-the-pines',
    label: 'Our Lady of the Pines Primary School',
    buildingType: 'Primary school teaching block',
    caption:
      'A primary school teaching block mid-repaint: doorways masked and cut in by brush and roller, detached cupboard doors rolled flat on the tables, joinery pulled clear of the walls.',
    sectorSlug: 'education-and-childcare',
    cover: 'Our Lady of the Pines Primary School-2.jpg',
  },
  {
    slug: 'saint-bar',
    label: 'Saint Bar',
    buildingType: 'Bar and tavern interior',
    caption:
      'Cutting in above exposed brick and spraying the timber-lined ceiling from mobile scaffold, with the mural wall sheeted off — and the finished room with the sheeting gone.',
    sectorSlug: 'hospitality',
    cover: 'Saint Bar-2.jpg',
  },
  {
    slug: 'heather-street-south-melbourne',
    label: '2-4 Heather Street, South Melbourne',
    buildingType: 'Apartment building common areas',
    suburb: 'South Melbourne',
    caption:
      'Masking and filling through the ground-floor entry foyer of a brick apartment building, with the street entrance immediately outside.',
    sectorSlug: 'body-corporate-and-strata',
    cover: '2-4 Heather Street-2.jpg',
  },
  {
    slug: 'kinkora-road-hawthorn',
    label: 'Kinkora Road, Hawthorn',
    buildingType: 'Victorian-era building under refurbishment',
    suburb: 'Hawthorn',
    caption:
      'A stripped internal corridor rolled out off an extension pole, and the fascia sealed beneath a scaffolded cast-iron verandah.',
    cover: '47 Kinkora Rd, Hawthorn-1.jpg',
  },
] as const;

/**
 * The galleries, joined and ordered.
 *
 * A frame with no alt text is dropped rather than shipped describing nothing —
 * an empty `alt` on a content image is a worse failure than a missing image,
 * because it is invisible to everyone who is not using a screen reader. Adding
 * a photograph therefore means adding its line to `ALT`, and forgetting to is
 * caught by tests/unit/galleries.test.ts rather than by a visitor.
 *
 * The cover frame leads its set. The rest keep the photographer's order, which
 * is broadly the order the work happened in.
 */
export const galleries: readonly WorkGallery[] = SITES.map(({ cover, ...site }) => {
  const generated = manifest.sites.find((entry) => entry.slug === site.slug);
  const frames = (generated?.images ?? []).filter((image) => ALT[image.sourceFile]);

  // A `cover` naming no frame falls back to the first rather than throwing —
  // the site must still render — but tests/unit/galleries.test.ts fails on it,
  // so it cannot ship unnoticed.
  const named = frames.findIndex((image) => image.sourceFile === cover);
  const leadIndex = named === -1 ? 0 : named;
  const ordered = frames.length
    ? [frames[leadIndex]!, ...frames.filter((_, index) => index !== leadIndex)]
    : [];

  return {
    ...site,
    images: ordered.map((image) => ({
      src: image.src,
      alt: ALT[image.sourceFile]!,
      width: image.width,
      height: image.height,
      blurDataURL: image.blurDataURL,
    })),
  };
}).filter((gallery) => gallery.images.length > 0);

/** Exposed for tests/unit/galleries.test.ts, which guards how it is keyed. */
export const altText: Readonly<Record<string, string>> = ALT;

/** Likewise: the declared lead frame per site, before it is resolved. */
export const coverNames: Readonly<Record<string, string>> = Object.fromEntries(
  SITES.map((site) => [site.slug, site.cover]),
);

export function getGallery(slug: string): WorkGallery | undefined {
  return galleries.find((gallery) => gallery.slug === slug);
}

/** The gallery shown beside a sector page, if that sector has one. */
export function galleryForSector(sectorSlug: string): WorkGallery | undefined {
  return galleries.find((gallery) => gallery.sectorSlug === sectorSlug);
}

/**
 * The cover frame of each gallery, for a mixed strip that stands for all of
 * them — the homepage's "recent work" rather than any one site.
 */
export const galleryCovers: readonly MediaRef[] = galleries.map((gallery) => gallery.images[0]!);

/** Total frames published, for the copy that counts them. */
export const galleryFrameCount = galleries.reduce(
  (total, gallery) => total + gallery.images.length,
  0,
);
