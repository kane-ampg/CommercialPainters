import Link from 'next/link';
import type { ReactNode } from 'react';
import { galleries, type WorkGallery } from '@/content/galleries';
import { posts } from '@/content/posts';
import { projects } from '@/content/projects';
import { servicePath } from '@/content/services';
import type { Post, Project, Service } from '@/lib/content/types';
import { ANCHORS, type Coords } from '@/lib/geo/anchors';
import { distanceKm } from '@/lib/geo/haversine';
import {
  displayName,
  getLocalityByHref,
  getRegion,
  hrefForVicSlug,
  regionInSentence,
  type Locality,
} from '@/lib/locations';
import { site, verifiedAccreditations } from '@/lib/site';
import { ContentImage } from '@/components/media/content-image';
import { Card, mediaZoom, microLabel, SectionHeading } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * The shared, presentational pieces of a locality page.
 *
 * Everything here takes a `Locality` and renders it. Nothing fetches, and
 * nothing decides indexability — that is settled in lib/locations.
 *
 * Queensland copy discipline (spec §9): the business has no Queensland address, no
 * Queensland phone number and no completed Queensland project. Any sentence
 * that could imply a footprint branches on `locality.state`, and Queensland
 * copy describes the place and what the business services rather than a presence in it.
 */

/**
 * Distance bucketed into a drive band.
 *
 * A precise "23.4km" reads as false precision on a page nobody measured the
 * drive for, and it is the band a facilities manager actually cares about:
 * whether a crew can be on site within the hour.
 */
export function driveBand(distanceKm: number): string {
  if (distanceKm < 15) return 'under 20 minutes';
  if (distanceKm < 30) return '20 to 40 minutes';
  if (distanceKm < 45) return '40 to 60 minutes';
  return 'over an hour';
}

/**
 * The reference point a locality's `distanceKm` was measured from.
 *
 * The fallback is state-correct rather than convenient: every generated
 * locality carries an in-radius anchor key, but if a hand-edit ever broke that
 * a bare `?? 'Melbourne'` would print "…from Melbourne" on a Brisbane page,
 * which is a fabricated fact rather than a vague one.
 */
function anchorLabel(locality: Locality): string {
  const anchor = ANCHORS.find((a) => a.key === locality.anchorKey);
  if (anchor) return anchor.label;
  return locality.state === 'VIC' ? 'Melbourne' : 'Brisbane';
}

/** Whole kilometres above 10, one decimal below — 0.4km is a fact, 23.4km is noise. */
function km(value: number): string {
  return value < 10 ? `${value.toFixed(1)}km` : `${Math.round(value)}km`;
}

/** A suburb name as the dataset slugs it: "Noble Park" → "noble-park". */
function suburbSlug(suburb: string): string {
  return suburb
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Where a Victorian locality sits relative to the base, as a clause.
 *
 * The same two branches as the facts card's distance line, for the same
 * reason: on the Bayswater North page itself "2.2km from our Bayswater North
 * base" is a measurement of two centroids, not a fact.
 */
function fromBase(locality: Locality): string {
  const label = anchorLabel(locality);
  const name = displayName(locality.name);
  return locality.slug === locality.anchorKey
    ? `Our ${label} base is in ${name} itself`
    : `${name} is ${km(locality.distanceKm)} from our ${label} base`;
}

/**
 * Project positions, resolved through relatedLocationSlugs.
 *
 * content/projects.ts carries no coordinates — only a `location` string and
 * `relatedLocationSlugs`. Those slugs are un-prefixed and match the generated
 * locality slugs, so a project's position is its related locality's position.
 *
 * State-qualified to VIC: every documented project is Victorian, and
 * 'brighton' alone would resolve to Queensland's Brighton just as readily.
 * Two of the four projects carry an empty `relatedLocationSlugs`, so the
 * locality half of the `location` string ("Noble Park, Victoria") is tried as
 * a second key — transcribed, not guessed. A project that still resolves to
 * nothing (the NDIS programme, whose location is "Across metropolitan
 * Melbourne") has no position and is excluded rather than given a made-up one.
 */
export function projectPositions(): { project: Project; coords: Coords }[] {
  return projects.flatMap((project) => {
    const suburb = project.location.split(',')[0] ?? '';
    const candidates = [...project.relatedLocationSlugs, suburbSlug(suburb)];
    for (const slug of candidates) {
      const href = hrefForVicSlug(slug);
      const locality = href ? getLocalityByHref(href) : undefined;
      if (locality) return [{ project, coords: locality.coords }];
    }
    return [];
  });
}

const POSITIONS = projectPositions();

/** Nearest documented project to a locality, with the distance to it. */
export function nearestProject(locality: Locality): { project: Project; km: number } | undefined {
  let best: { project: Project; km: number } | undefined;
  for (const { project, coords } of POSITIONS) {
    const d = distanceKm(locality.coords, coords);
    if (!best || d < best.km) best = { project, km: d };
  }
  return best;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-label text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{children}</dd>
    </div>
  );
}

const factLink =
  'rounded underline decoration-paper-edge underline-offset-4 hover:decoration-brand-600 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600';

/**
 * Region, council, postcode and — in Victoria only — the drive band.
 *
 * The fourth fact used to be a distance-and-drive-band on every page in both
 * states. In Victoria that is a real fact: the business works from Bayswater North,
 * every VIC locality's `distanceKm` is measured from it, and "a drive of 20 to
 * 40 minutes" is the thing a facilities manager is actually asking about.
 *
 * In Queensland it was neither true nor even coherent. The QLD anchor labels
 * are region names, so `/areas/queensland/brisbane-inner/brisbane-city/` read
 * "0.0km from Brisbane — a drive of under 20 minutes" and Southport read
 * "0.5km from Gold Coast": a tautology on 542 pages and a bare proximity claim
 * on the other 370. Worse, no base was named, so "a drive of under 20 minutes"
 * read as the business's mobilisation time to that suburb — the strongest presence
 * implication anywhere on the site, and false. The business has no Queensland address,
 * crew or phone number.
 *
 * So Queensland gets a different fourth fact, one that is true: how the business
 * services the suburb, and the absence a reader needs in order to read the rest
 * of the page correctly. No distance, no drive time, no anchor.
 * tests/unit/qld-copy.test.ts renders this card for every Queensland locality
 * and fails if any distance or drive-time phrasing reappears.
 */
export function LocalityFacts({ locality }: { locality: Locality }) {
  const label = anchorLabel(locality);
  const band = driveBand(locality.distanceKm);
  const state = locality.state === 'VIC' ? 'victoria' : 'queensland';
  const name = displayName(locality.name);
  const region = getRegion(locality.regionSlug)?.name ?? locality.regionSlug;

  return (
    <Card>
      <dl className="grid gap-5 sm:grid-cols-2">
        <Fact label="Region">
          <Link href={`/areas/${state}/${locality.regionSlug}/`} className={factLink}>
            {region}
          </Link>
        </Fact>
        <Fact label={locality.postcodes.length > 1 ? 'Postcodes' : 'Postcode'}>
          {locality.postcodes.join(', ')}
        </Fact>
        <Fact label="Local government area">{locality.council.name}</Fact>
        {locality.state === 'VIC' ? (
          <Fact label="Distance">
            {/* "a drive of under 20 minutes", not "roughly a under 20 minutes
                drive" — the band is a phrase, not an adjective.

                `slug === anchorKey` is the locality that IS the anchor:
                Bayswater North, which is both the business's own suburb and a Tier 1
                indexed page. Its dataset centroid sits 2.2km from the anchor
                centroid, so the general branch printed "2.2km from our
                Bayswater North base" on the Bayswater North page. */}
            {locality.slug === locality.anchorKey
              ? `Our ${label} base is in ${name} itself.`
              : `${km(locality.distanceKm)} from our ${label} base — a drive of ${band}.`}
          </Fact>
        ) : (
          <Fact label="How it is serviced">
            {`Quoted and programmed as part of ${region}. Commercial Painters works from Victoria and holds no Queensland address or crew, so access and travel are priced per site.`}
          </Fact>
        )}
      </dl>
    </Card>
  );
}

/** Council building stock and the operational note that follows from it. */
export function CouncilBlock({ locality }: { locality: Locality }) {
  return (
    <div>
      <SectionHeading className="mb-4">{locality.council.name} building stock</SectionHeading>
      <div className="max-w-prose space-y-4 text-ink-soft">
        <p>{locality.council.buildingStock}</p>
        <p>{locality.council.note}</p>
      </div>
    </div>
  );
}

/**
 * Nearest documented project.
 *
 * Victoria only. Every documented project is Victorian, so on a
 * Queensland page the nearest one is over a thousand kilometres away, and
 * printing that distance beside a Queensland suburb name would read as a claim
 * about work there. The block states the absence plainly instead.
 */
export function NearestProjectBlock({ locality }: { locality: Locality }) {
  const name = displayName(locality.name);
  const nearest = locality.state === 'VIC' ? nearestProject(locality) : undefined;

  return (
    <div>
      <SectionHeading className="mb-4">Nearest documented project</SectionHeading>
      <div className="max-w-prose space-y-4 text-ink-soft">
        {nearest ? (
          <p>
            The closest project written up on this site is{' '}
            <Link href={`/projects/${nearest.project.slug}/`} className={factLink}>
              {nearest.project.title}
            </Link>
            {/* A project resolved to this very locality is 0.0km away, and
                "about 0.0km from Vermont" is not a fact anyone can use. */}
            {nearest.km < 1 ? `, in ${name} itself.` : `, about ${km(nearest.km)} from ${name}.`}
          </p>
        ) : (
          <p>
            No Queensland project is documented on this site. The case studies here are Victorian,
            and are published as a record of that work rather than as a claim about {name}.{' '}
            <Link href="/projects/" className={factLink}>
              See the projects
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * The six nearest localities, as links. Traversable from noindex pages too.
 *
 * The 207 rural-fringe localities carry no neighbours at all — they are held
 * out of every neighbour list on purpose, because a farm township is not a
 * neighbouring suburb in any sense a facilities manager would use the word.
 * Returning null there left a hole in one of the six facts spec §8 requires on
 * every suburb page, so the slot now says what is true of those places instead
 * and points at the region hub, which is the genuinely useful nearby link.
 *
 * What it must not do is turn that data rule into a claim about the map. This
 * block used to read "{name} has no adjoining suburb — what surrounds it is
 * farmland and township", asserted on all 207 fringe pages, and it is simply
 * false: Powelltown adjoins Yarra Junction and Three Bridges, both of which
 * have pages on this site. An empty `neighbourHrefs` is a decision about which
 * localities are worth linking, not a fact about what physically borders the
 * place. The copy now says which of the two it is.
 */
export function NearbySuburbs({ locality }: { locality: Locality }) {
  const neighbours = locality.neighbourHrefs
    .map((href) => getLocalityByHref(href))
    .filter((l): l is Locality => l !== undefined);

  const name = displayName(locality.name);
  const region = getRegion(locality.regionSlug);
  const regionHref = `/areas/${locality.state === 'VIC' ? 'victoria' : 'queensland'}/${locality.regionSlug}/`;

  if (neighbours.length === 0) {
    return (
      <div>
        <SectionHeading className="mb-4">Nearby</SectionHeading>
        <div className="max-w-prose space-y-4 text-ink-soft">
          <p>
            The suburb-to-suburb links elsewhere on this site are built from the commercial
            localities only, and {name} is farmland and township — so the localities around it are
            listed on the region hub rather than linked from here.{' '}
            <Link href={regionHref} className={factLink}>
              {region?.name ?? locality.regionSlug}
            </Link>{' '}
            is the wider area {name} sits in, and lists every locality covered.
          </p>
          <p>
            Worth saying what that rural setting means for a job rather than for a link list: travel
            and mobilisation are a real share of the cost out here, and a rural site cannot be
            assumed to have hardstand for a lift or three-phase power.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeading className="mb-4">Nearby suburbs</SectionHeading>
      <ul className="flex flex-wrap gap-2">
        {neighbours.map((neighbour) => (
          <li key={neighbour.href}>
            <Link
              href={neighbour.href}
              className="inline-block rounded-md border border-paper-edge px-3 py-2 text-sm text-ink-soft hover:bg-paper-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {displayName(neighbour.name)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The selling half of a suburb page                                   */
/* ------------------------------------------------------------------ */

/*
 * Everything above this line describes the place. What follows is what a
 * facilities manager in that place is actually shopping for: what we paint,
 * what we have done nearby, why us, and the questions that come before an
 * enquiry. The group's older suburb pages carry the same blocks; these are
 * written from this business's own verified facts rather than lifted from
 * them, and they are commercial only. tests/unit/suburb-sections.test.ts
 * renders every block for every locality and fails on any word for the kind
 * of painting this site does not sell, and on any distance or presence claim
 * on a Queensland page. The adjective itself is banned from source, comments
 * included, which is why this paragraph talks around it.
 */

/**
 * The opening paragraph of a suburb page with no hand-written intro.
 *
 * Victoria leads with where the suburb sits relative to the base, because the
 * drive is the first thing a facilities manager wants to know. Queensland says
 * what is serviced and how, never where the business sits.
 */
export function defaultIntro(locality: Locality): string {
  const name = displayName(locality.name);
  const council = locality.council.name;

  if (locality.state !== 'VIC') {
    return `Commercial Painters services ${name}, in the ${council} local government area: schools, medical suites, retail tenancies, strata common areas and industrial units. The business works from Victoria, so each Queensland site is quoted on its own, with access and travel priced in.`;
  }

  return `${fromBase(locality)}, in the ${council} council area. We paint the commercial buildings in ${name} — offices, schools and childcare centres, medical suites, shops and showrooms, strata common areas, warehouses and factories — and stage the work around the hours each one is in use.`;
}

/**
 * The meta description for a suburb page with no hand-written intro. Leads
 * with what is painted and ends on the offer, so the snippet does the job a
 * hero would.
 */
export function defaultDescription(locality: Locality): string {
  const name = displayName(locality.name);

  if (locality.state !== 'VIC') {
    return `Commercial painting in ${name}, ${locality.council.name} council. Commercial Painters services ${name} — building stock, access and coating notes.`;
  }

  // Kept short enough that the offer survives metaDescription's 155-character
  // sentence cut for all but the longest suburb names.
  const where =
    locality.slug === locality.anchorKey
      ? `based in ${anchorLabel(locality)}`
      : `${km(locality.distanceKm)} from ${anchorLabel(locality)}`;
  return `Commercial painters in ${name} ${locality.postcodes[0] ?? ''}: offices, schools, clinics, shops, strata and industrial sites, ${where}. Free site assessment.`;
}

/* ------------------------------------------------------------------ */
/* Services                                                             */
/* ------------------------------------------------------------------ */

/**
 * The repairs card. Not a service in content/services.ts and not a page of
 * its own: it is the "who runs the trades either side of the paint" answer
 * from content/approach.ts, stated as something you can buy.
 */
const REPAIRS_CARD = {
  key: 'repairs',
  title: 'Repairs and making good',
  body: 'Patching, plastering, rendering, tiling and flooring run in the same programme as the painting, so one team answers for the whole job.',
  includes: ['Patching and plastering', 'Render repairs', 'Tiling and flooring'],
};

export function LocalServices({
  locality,
  services,
}: {
  locality: Locality;
  services: readonly Service[];
}) {
  const name = displayName(locality.name);
  const cards: {
    key: string;
    title: string;
    body: string;
    includes: readonly string[];
    href?: string;
  }[] = [
    ...services.map((service) => ({
      key: service.slug,
      title: service.title,
      body: service.summary,
      includes: service.includes.slice(0, 3),
      href: servicePath(service.slug),
    })),
    REPAIRS_CARD,
  ];

  return (
    <div>
      <SectionHeading className="mb-3">Commercial painting services in {name}</SectionHeading>
      <p className="mb-8 max-w-prose text-ink-soft">
        Interior and exterior, run by one team. Most jobs draw on more than one line of work: an
        exterior that needs its render repaired first, or an office repaint that ends up including
        the patching.
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card
            as="li"
            key={card.key}
            className={cn(
              'gap-3',
              card.href &&
                'transition-[border-color,box-shadow] duration-300 ease-out focus-within:border-brand-600 hover:border-brand-600 hover:shadow-lg hover:shadow-ink/10 motion-reduce:transition-none',
            )}
          >
            <h3 className="font-display text-lg">
              {card.href ? (
                <Link
                  href={card.href}
                  className="rounded after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  {card.title}
                </Link>
              ) : (
                card.title
              )}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-ink-soft">{card.body}</p>
            <ul className="flex flex-wrap gap-1.5">
              {card.includes.map((item) => (
                <li
                  key={item}
                  className="rounded bg-paper-sunken px-2 py-1 text-xs font-medium text-ink-soft"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Photographed work nearby                                             */
/* ------------------------------------------------------------------ */

/**
 * Gallery positions, resolved the same way project positions are: the
 * gallery's recorded suburb, slugged, looked up in Victoria only.
 *
 * A gallery with no recorded suburb has no position and never appears. That
 * is deliberate for the industrial unit, whose owner asked not to be named
 * and whose suburb is left off for the same reason, and correct for the
 * others: a position is never guessed.
 */
const GALLERY_POSITIONS: { gallery: WorkGallery; coords: Coords }[] = galleries.flatMap(
  (gallery) => {
    if (!gallery.suburb) return [];
    const href = hrefForVicSlug(suburbSlug(gallery.suburb));
    const locality = href ? getLocalityByHref(href) : undefined;
    return locality ? [{ gallery, coords: locality.coords }] : [];
  },
);

/** The first blog post that uses a gallery's photographs, cover first. */
function postForGallery(slug: string): Post | undefined {
  const folder = `/images/gallery/${slug}/`;
  return (
    posts.find((post) => post.cover?.src.startsWith(folder)) ??
    posts.find((post) => post.body.includes(folder))
  );
}

export type NearbySite = { gallery: WorkGallery; km: number; post?: Post };

/**
 * The photographed sites nearest a locality. Victoria only, for the same
 * reason the nearest-project block is: every site is Victorian, and a
 * distance from a Queensland suburb to one of them reads as a claim.
 */
export function nearbyWork(locality: Locality, limit = 3): NearbySite[] {
  if (locality.state !== 'VIC') return [];
  return GALLERY_POSITIONS.map(({ gallery, coords }) => ({
    gallery,
    km: distanceKm(locality.coords, coords),
    post: postForGallery(gallery.slug),
  }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

const cardLink =
  'rounded text-sm font-semibold text-brand-700 underline decoration-paper-edge underline-offset-4 hover:decoration-brand-600 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600';

/**
 * Up to three photographed sites, nearest first, each with its lead frame.
 *
 * Says only what the galleries say: the building, the suburb and how far it
 * is. Most of these sites have no project record, so a card links to the
 * photographs, to an article built on them where one exists, and to the case
 * study only for the two that have one.
 */
export function NearbyWork({ locality }: { locality: Locality }) {
  const sites = nearbyWork(locality);
  if (sites.length === 0) return null;

  const name = displayName(locality.name);
  const anyInSuburb = sites.some((s) => s.km < 1);

  return (
    <div>
      <SectionHeading className="mb-3">
        {anyInSuburb ? `Work photographed in and around ${name}` : `Work photographed near ${name}`}
      </SectionHeading>
      <p className="mb-8 max-w-prose text-ink-soft">
        The nearest of the {galleries.length} commercial sites we have photographed while the
        painting was under way.
      </p>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map(({ gallery, km: distance, post }) => {
          const cover = gallery.images[0];
          return (
            <li key={gallery.slug}>
              <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-paper-edge bg-white">
                {cover && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                    <ContentImage
                      image={cover}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className={`object-cover ${mediaZoom}`}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className={cn(microLabel, 'text-brand-600')}>
                    {distance < 1 ? `In ${name}` : `${gallery.suburb} · about ${km(distance)} away`}
                  </p>
                  <h3 className="font-display text-lg leading-snug">{gallery.label}</h3>
                  <p className="flex-1 text-sm text-ink-soft">{gallery.buildingType}</p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <Link href={`/projects/#${gallery.slug}`} className={cardLink}>
                      See the photographs
                    </Link>
                    {gallery.projectSlug ? (
                      <Link href={`/projects/${gallery.projectSlug}/`} className={cardLink}>
                        Read the case study
                      </Link>
                    ) : (
                      post && (
                        <Link href={`/blog/${post.slug}/`} className={cardLink}>
                          Read the article
                        </Link>
                      )
                    )}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Why choose us                                                        */
/* ------------------------------------------------------------------ */

type Reason = {
  heading: string;
  body: string;
  /** Accreditation ids the claim rests on. Dropped unless every one is verified. */
  requires?: readonly string[];
  /** A claim about attending site, which Queensland copy may not make. */
  vicOnly?: boolean;
};

/**
 * The checklist. Every line is a fact already published elsewhere on the site
 * — content/approach.ts, content/faqs.ts and the accreditations in
 * lib/site.ts — restated as a reason. A line resting on a credential is held
 * back automatically if that credential ever loses its verified flag.
 *
 * Left out on purpose, although the group's other sites say them: a price
 * claim, a years-of-experience figure older than this business, an award, and
 * a free colour consultation. None of them is verified for this business.
 */
function reasons(): Reason[] {
  const yearsTrading = new Date().getFullYear() - site.founded;
  return [
    {
      heading: 'A site visit before every price',
      body: 'Scope, surface condition, access and your working hours are checked on site, not guessed from photographs.',
      vicOnly: true,
    },
    {
      heading: 'Itemised written quotes',
      body: 'Labour, materials and scheduling set out line by line, and per site when the work covers several buildings.',
    },
    {
      heading: 'Work staged around your hours',
      body: 'After hours, at weekends, in school holidays or one zone at a time, so the building keeps operating.',
    },
    {
      heading: 'Access planned area by area',
      body: 'Ladders, scaffold, scissor lift or boom lift, chosen per elevation rather than one method for the whole site.',
    },
    {
      heading: 'Prequalified, screened crews',
      body: 'Cm3 contractor OHS prequalification, with Working with Children, police and NDIS Worker Screening Checks held by the people on site.',
      requires: ['cm3', 'wwcc', 'police-check', 'ndis-screening'],
    },
    {
      heading: 'Master Painters, Dulux and Haymes accredited',
      body: 'A Registered Master Painter with Master Painters Australia, a Dulux Accredited Painter and an accredited Haymes applicator.',
      requires: ['master-painters', 'dulux', 'haymes'],
    },
    {
      heading: 'Five-year workmanship warranty',
      body: 'Covering peeling, flaking and blistering, backed by the Dulux Accredited Painter programme.',
      requires: ['workmanship-warranty', 'dulux'],
    },
    {
      heading: 'Fully insured',
      body: 'Public liability and workers compensation, with certificates and Safe Work Method Statements supplied before the first day.',
      requires: ['insured'],
    },
    {
      heading: 'Low-VOC systems in occupied buildings',
      body: 'Standard wherever people keep working through the job, with coated areas ventilated before they come back.',
    },
    {
      heading: 'One team for the trades around the paint',
      body: 'Patching, plastering, rendering, tiling and flooring sit in the same programme, so a gap between trades is ours to manage.',
    },
    {
      heading: `Commercial painting since ${site.founded}`,
      body: `${yearsTrading} years of schools, clinics, offices, shops, strata and industrial sites.`,
    },
  ];
}

const VERIFIED_IDS = new Set(verifiedAccreditations.map((a) => a.id));

export function reasonsFor(locality: Locality): Reason[] {
  return reasons().filter(
    (reason) =>
      (!reason.vicOnly || locality.state === 'VIC') &&
      (reason.requires ?? []).every((id) => VERIFIED_IDS.has(id)),
  );
}

function CheckMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export function WhyChooseUs({ locality }: { locality: Locality }) {
  const name = displayName(locality.name);

  return (
    <div>
      <SectionHeading className="mb-3">Why choose {site.name}</SectionHeading>
      <p className="mb-8 max-w-prose text-ink-soft">
        {locality.state === 'VIC'
          ? `What holds on every job, whether the building is in ${name} or across town.`
          : `What holds on every job ${site.name} takes on.`}
      </p>
      <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {reasonsFor(locality).map((item) => (
          <li key={item.heading} className="flex gap-3">
            <CheckMark />
            <div>
              <p className="font-semibold text-ink">{item.heading}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Questions                                                            */
/* ------------------------------------------------------------------ */

/**
 * The questions asked before an enquiry, answered for this suburb.
 *
 * Only the first answer changes from page to page, and it changes on data:
 * postcode, council, region, distance and drive band. The rest are the
 * business's standing answers, so a suburb page never invents a local fact to
 * fill a slot. Queensland gets the presence-safe version of the first answer
 * and no site-visit question.
 */
export function localityFaqs(locality: Locality): { question: string; answer: string }[] {
  const name = displayName(locality.name);
  const council = locality.council.name;
  const vic = locality.state === 'VIC';
  const region = getRegion(locality.regionSlug);
  const warranty = ['workmanship-warranty', 'dulux'].every((id) => VERIFIED_IDS.has(id));

  const where = vic
    ? {
        question: `Do you work in ${name}?`,
        answer:
          locality.slug === locality.anchorKey
            ? `Yes. ${fromBase(locality)}, in the ${council} council area, so ${name} is the shortest trip we make.`
            : `Yes. ${fromBase(locality)}, a drive of ${driveBand(locality.distanceKm)}. It sits in the ${council} council area, part of ${region ? regionInSentence(region) : 'metropolitan Melbourne'}, and the postcode is ${locality.postcodes.join(' or ')}.`,
      }
    : {
        question: `Do you work in ${name}?`,
        answer: `${site.name} works from Victoria and holds no Queensland address or crew. Work in ${name} is quoted and programmed as part of ${region ? regionInSentence(region) : 'the region'}, with access and travel priced per site.`,
      };

  return [
    where,
    {
      question: 'Can the building stay open while it is painted?',
      answer:
        'Usually, yes. Work is staged after hours, at weekends, in school holidays or one zone at a time, and each area is cleaned down and handed back as it is finished. Low-VOC systems are standard in occupied workplaces.',
    },
    {
      question: 'How is a commercial painting job priced?',
      answer: vic
        ? 'After a site visit, as an itemised written quote covering labour, materials and scheduling, per site where the work spans several buildings. Repairs are priced on separate lines from the painting, so you can see what is remediation and what is finish.'
        : 'As an itemised written quote covering labour, materials and scheduling, with repairs on separate lines from the painting. Access and travel to a Queensland site are priced into it.',
    },
    ...(vic
      ? [
          {
            question: 'What happens at the free site assessment?',
            answer:
              'We visit the building to check the areas involved, the condition of the surfaces, access and the hours contractors are allowed on site. It costs nothing and comes before any price, because preparation is the largest variable in a painting job and cannot be judged from a photograph.',
          },
        ]
      : []),
    ...(warranty
      ? [
          {
            question: 'What warranty do you give?',
            answer:
              'Five years on workmanship, backed by our standing as a Dulux Accredited Painter. It covers peeling, flaking and blistering, which is why preparation and application are settled on site rather than assumed.',
          },
        ]
      : []),
  ];
}
