/**
 * Canonical business facts.
 *
 * Every surface that states a business fact — footer, contact page, JSON-LD,
 * metadata, forms, the chat — imports from here, so the company is named one
 * way everywhere and a phone number or address changes in one place.
 *
 * The trading name, the founding year, the tagline and the accreditations are
 * fixed here. The contact facts — phone, email, address, ABN, coordinates,
 * hours, socials — are collected into `defaultSiteSettings` below, which the
 * root layout resolves once through `getSiteSettings()` and hands down to
 * every component that renders them. Read them through the settings, never
 * from `site.*` directly, so a later editable source can slot in without
 * touching the pages.
 *
 * Anything marked NEEDS-CLIENT-CONFIRMATION is not rendered publicly until the
 * client supplies it. Nothing here is invented.
 */

import type { ContactPageCopy, SiteSettings } from '@/lib/content/types';

export const CONTACT_UNVERIFIED = 'NEEDS-CLIENT-CONFIRMATION' as const;

export const site = {
  /** Trading name. Use this everywhere in prose and headings. */
  name: 'Commercial Painters',

  /**
   * Registered entity. NEEDS-CLIENT-CONFIRMATION: the registered company name
   * behind the trading name has not been supplied, so the trading name stands
   * in for it. Use only in the footer legal line and in Organization schema
   * `legalName`.
   */
  legalName: 'Commercial Painters',

  /** Not yet supplied. Required for complete LocalBusiness schema. */
  abn: null as string | null,

  founded: 2015,

  tagline: 'Commercial painters in Melbourne',

  phone: {
    display: '1300 97 97 40',
    href: 'tel:1300979740',
    /**
     * Country-coded form for structured data. Google's LocalBusiness guidance
     * asks for the number with its country code; prose and the header keep
     * the local display format above.
     */
    international: '+61 1300 979 740',
  },

  email: 'outreach@apmgmaintenance.com.au',

  /**
   * The office.
   *
   * 1 Turbo Drive, Bayswater North VIC 3153. The address is simply the
   * address: no move date and no "we are moving" qualifier. Every Victorian
   * locality's distance in content/locations.generated.json is measured from
   * the Bayswater North anchor in lib/geo/anchors.ts, so the suburb here and
   * the anchor there have to agree.
   */
  address: {
    street: '1 Turbo Drive',
    suburb: 'Bayswater North',
    state: 'VIC',
    postcode: '3153',
    country: 'AU',
  },

  /**
   * Service area as the business can actually evidence it. Every documented
   * case study is Victorian and the office is in Bayswater North. South East
   * Queensland is listed as an area served — see content/locations.overrides.ts
   * for the rule that keeps Queensland copy honest.
   */
  serviceArea: {
    primary: 'Melbourne, Victoria',
    radiusKm: 60,
  },

  /**
   * Geographic coordinates of the Bayswater North base.
   *
   * Null until confirmed. A service-area business is ranked partly on a
   * `GeoCircle` built from this point plus `serviceArea.radiusKm`, so this is
   * the single highest-value missing local signal — but a guessed latitude is
   * worse than none, because it moves the entity to a place the business does
   * not work from. Geocode the published street address and paste the result.
   * The suburb centroid (-37.845116, 145.270141) in lib/geo/anchors.ts is the
   * suburb, not 1 Turbo Drive, and this field is what a GeoCircle is built
   * from.
   */
  coords: null as { latitude: number; longitude: number } | null,

  /**
   * Trading hours, as `openingHoursSpecification` entries.
   *
   * Null until confirmed. Emitted into LocalBusiness schema only when
   * populated — inventing hours produces a rich result that tells people to
   * call when nobody is there.
   */
  openingHours: null as
    | readonly {
        days: readonly string[];
        opens: string;
        closes: string;
      }[]
    | null,

  social: {
    /** NEEDS-CLIENT-CONFIRMATION: no profile exists under this name yet. */
    instagram: null as string | null,
    /** NEEDS-CLIENT-CONFIRMATION: no profile exists under this name yet. */
    facebook: null as string | null,
    /**
     * Google Business Profile.
     *
     * Stored in `maps.google.com/?q=place_id:` form because that is the URL
     * Google itself documents for `sameAs`. For a local trade business this
     * is the largest single ranking asset there is, and `sameAs` is how the
     * site tells Google that this entity and that profile are the same
     * business. Nothing else in this file matters as much for map-pack
     * visibility.
     *
     * NEEDS-CLIENT-CONFIRMATION: the profile's registered name and address
     * must match the trading name and address published here before go-live,
     * or the site and the profile disagree on the facts the map pack weighs
     * most heavily.
     */
    google: 'https://www.google.com/maps/place/?q=place_id:ChIJnV9lqRIw1moRftY3Ankvfdw',
  },
} as const;

/**
 * The people who carry out site assessments. Named on the contact page as a
 * trust cue — the visitor meets one of these three, not a sales desk. The
 * booking form does not ask which; the team assigns internally.
 */
export const assessors = ['Farbod', 'Zac', 'Simon'] as const;

/**
 * Brand statements.
 *
 * The vision, mission and four core values are the business's own. The mission
 * is carried with only the two client types this site serves — commercial and
 * industrial — because this is the commercial business and nothing here may
 * imply domestic work. The one-line glosses on the values are written in the
 * site's own terms rather than invented as claims.
 */
export const brand = {
  /** The business's own words for where it is from and who owns it. */
  ownership: 'Melbourne-based, Australian-owned',
  vision:
    'To be the most trusted and versatile property maintenance partner, setting the benchmark for quality, reliability, and customer care across every trade we deliver.',
  mission:
    'At Commercial Painters, our mission is to provide professional, end-to-end trade solutions that simplify property maintenance for industrial and commercial clients. We are committed to delivering exceptional workmanship, clear communication, and dependable service through a team of highly trained specialists who genuinely care about the spaces we improve.',
  values: [
    {
      name: 'Expertise',
      body: 'Trained specialists, the right coating system for the substrate, and around 30 years of combined industry experience behind every scope.',
    },
    {
      name: 'Passion',
      body: 'Genuine care for the spaces we improve, on a single tenancy as much as on a multi-site programme.',
    },
    {
      name: 'Professionalism',
      body: 'Clear communication, tidy sites, and work sequenced around how the building actually runs.',
    },
    {
      name: 'Integrity',
      body: 'Transparent scope, honest pricing, and anything found on site reported and priced before it is done.',
    },
  ],
} as const;

/**
 * Accreditations.
 *
 * `verified` means the client has confirmed the credential and it may be
 * published. Unverified entries never render as a credential and never reach
 * structured data — an unverified claim is worse than a missing one.
 *
 * `evidence` records how each one was established, because "the client said
 * so" and "there is a current certificate on file" are different strengths of
 * claim and the difference should survive in the repo rather than in
 * somebody's memory.
 *
 * Two corrections worth holding onto: the body is Master Painters Australia,
 * spelled exactly that way, and the NDIS credential is a Worker Screening
 * Check, not an "NDIS Accreditation". Cm3 is a contractor OHS prequalification
 * that education, health and facilities clients screen on, so it is the most
 * commercially useful badge of the set.
 */
export type Accreditation = {
  id: string;
  /** Exact, correctly capitalised name. */
  label: string;
  detail: string;
  /** Publishable. Only true entries render or reach structured data. */
  verified: boolean;
  /** How the credential was established. Never rendered; provenance only. */
  evidence: string;
  /**
   * The body's mark, where one exists. Absent for the personnel screening
   * checks, which are held per-person and have no badge.
   */
  logo?: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
};

const CLIENT_CONFIRMED = 'Client confirmed 2026-08-24; badge supplied by the client' as const;

export const accreditations: readonly Accreditation[] = [
  {
    id: 'master-painters',
    label: 'Master Painters Australia',
    detail: 'Registered Master Painter',
    verified: true,
    evidence: CLIENT_CONFIRMED,
    logo: {
      src: '/images/accreditations/master-painters-australia.png',
      width: 444,
      height: 390,
      alt: 'Master Painters Australia',
    },
  },
  {
    id: 'dulux',
    label: 'Dulux Accredited Painter',
    detail: 'Supports the 5-year workmanship warranty',
    verified: true,
    evidence: CLIENT_CONFIRMED,
    logo: {
      src: '/images/accreditations/dulux-accredited-painter.png',
      width: 197,
      height: 98,
      alt: 'Dulux Accredited Painter',
    },
  },
  {
    id: 'workmanship-warranty',
    label: "Painter's workmanship warranty",
    detail: 'Five years, covering peeling, flaking and blistering',
    verified: true,
    /*
     * This mark arrives as one file with the Dulux badge beside it — two marks
     * set side by side with 14px of clear space between them, not a designed
     * lockup — so it is split back into its two halves here and each is
     * framed on its own.
     *
     * Kept whole, the pair had to render at a third the height of a single
     * mark to fit one frame, and the shield's own wording stopped being
     * readable. Split, both sit at the size the rest of the row does.
     */
    evidence:
      'Client confirmed 2026-08-24; mark split from the Dulux + warranty pair the client supplied',
    logo: {
      src: '/images/accreditations/painters-workmanship-warranty.png',
      width: 95,
      height: 107,
      alt: "Painter's workmanship warranty, five year",
    },
  },
  {
    id: 'cm3',
    label: 'Cm3 prequalified',
    detail: 'Contractor OHS prequalification, recognised across education, health and facilities',
    verified: true,
    evidence: CLIENT_CONFIRMED,
    logo: {
      src: '/images/accreditations/cm3.png',
      width: 182,
      height: 84,
      alt: 'Cm3 contractor OHS prequalification',
    },
  },
  {
    id: 'haymes',
    label: 'Haymes Paint',
    detail: 'Accredited applicator for the Australian-made Haymes range',
    verified: true,
    evidence: CLIENT_CONFIRMED,
    logo: {
      src: '/images/accreditations/haymes-paint.png',
      width: 178,
      height: 92,
      alt: 'Haymes Paint',
    },
  },
  {
    id: 'insured',
    label: 'Fully insured',
    detail: 'Public liability and workers compensation',
    verified: true,
    // No badge and no certificate on file — this one rests on the client's
    // word. Certificates of currency are the thing to collect: a facilities
    // manager will ask for them by name before a purchase order is raised.
    evidence: 'Client confirmed 2026-08-24; certificates of currency not yet supplied',
  },
  {
    id: 'wwcc',
    label: 'Working with Children Checks',
    detail: 'Held by personnel working on education and childcare sites',
    verified: true,
    evidence: 'Client confirmed 2026-08-24; held per person, no company-level certificate',
  },
  {
    id: 'police-check',
    label: 'Police checks',
    detail: 'Held by personnel working on healthcare and aged care sites',
    verified: true,
    evidence: 'Client confirmed 2026-08-24; held per person, no company-level certificate',
  },
  {
    id: 'ndis-screening',
    label: 'NDIS Worker Screening Check',
    detail: 'Held by personnel working on NDIS sites',
    verified: true,
    evidence: 'Client confirmed 2026-08-24; held per person, no company-level certificate',
  },
] as const;

export const verifiedAccreditations = accreditations.filter((a) => a.verified);

/**
 * The logo wall. The marks that carry a badge, in order.
 *
 * The screening checks are deliberately not here: they are held per person, so
 * a badge implying a company-level certification would overstate them. They are
 * stated in words on the about page instead.
 */
export const accreditationLogos = verifiedAccreditations.filter((a) => a.logo !== undefined);

/**
 * The business details every page renders.
 *
 * Resolved once by the root layout through `getSiteSettings()` and handed down
 * to the header, footer, forms and chat, so all of them state the same phone
 * number. Values are drawn from `site` above so nothing is retyped and the two
 * cannot drift.
 */
export const defaultSiteSettings: SiteSettings = {
  phone: site.phone.display,
  email: site.email,
  address: {
    street: site.address.street,
    suburb: site.address.suburb,
    state: site.address.state,
    postcode: site.address.postcode,
    country: site.address.country,
    // No transition to describe. The field stays so a move date can be set
    // here later, at which point the footer's note appears on its own.
    effectiveFrom: null,
  },
  abn: site.abn,
  coords: site.coords,
  openingHours: site.openingHours,
  serviceAreaPrimary: site.serviceArea.primary,
  social: {
    instagram: site.social.instagram,
    facebook: site.social.facebook,
    google: site.social.google,
  },
};

/**
 * Directions to the office, as Google's documented `dir` deep link.
 *
 * Built from the street address rather than from `site.social.google`, so a
 * profile registered to an older address can never route a visitor to the
 * wrong premises. A plain address query is resolved by Maps itself and cannot
 * go stale behind us.
 */
export function directionsUrl(address: SiteSettings['address']): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${formatAddress(address)}, Australia`,
  )}`;
}

/** The copy on /contact-us/. The form itself is code. */
export const defaultContactPage: ContactPageCopy = {
  slug: 'contact-us',
  title: 'Contact us',
  lede: 'Book a free site assessment, on site in Melbourne or online anywhere — or just call.',
  formHeading: 'Get a free site assessment',
  formIntro:
    'For schools, clinics, aged care, strata, retail, hospitality, offices and industrial sites. Tell us where the site is and when suits, and we confirm a time by email. No scope document needed — that is what the assessment is for.',
  metaTitle: 'Free Site Assessment | Commercial Painters Melbourne',
  metaDescription:
    'Book a free commercial painting site assessment with Commercial Painters — on site in Melbourne or online anywhere. Or call 1300 97 97 40.',
};

/**
 * The tel: link, derived from the display number rather than stored beside
 * it — two fields that have to agree are two fields that eventually do not.
 * Pure, so client components may import it; this module has no `server-only`.
 */
export function phoneHref(display: string): string {
  return `tel:${display.replace(/\D/g, '')}`;
}

/**
 * The display number in country-coded form, for structured data.
 *
 * Google's LocalBusiness guidance asks for the number with its country code
 * while prose and the header keep the local display format. Derived rather
 * than stored beside the display number for the same reason `phoneHref` is.
 */
export function internationalPhone(display: string): string {
  const digits = display.replace(/\D/g, '');

  /*
   * Strip whichever prefix the number was typed with before grouping the rest.
   *
   * Both are prefixes to the same national number and neither is part of it:
   * the trunk `0` on landlines and mobiles, and the `61` on a number already
   * written in international form. Missing the `61` case regrouped
   * "+61 3 9123 4567" as "+61 6 1391 234567" — a number that dials nowhere.
   */
  const national = digits.startsWith('61')
    ? digits.slice(2)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits;

  /*
   * Grouped by number type, longest-specific first. Anything that matches no
   * shape is passed through as one group rather than sliced on a guess: a
   * run-together number is ugly, an incorrectly split one is wrong.
   */
  const grouped = /^13\d{4}$/.test(national)
    ? // Six-digit 13 numbers, in twos: 13 26 84.
      [national.slice(0, 2), national.slice(2, 4), national.slice(4)]
    : /^1[38]00\d{6}$/.test(national)
      ? // 1300/1800 service numbers, 4-3-3.
        [national.slice(0, 4), national.slice(4, 7), national.slice(7)]
      : /^4\d{8}$/.test(national)
        ? // Mobiles, 3-3-3.
          [national.slice(0, 3), national.slice(3, 6), national.slice(6)]
        : /^[2378]\d{8}$/.test(national)
          ? // Landlines: one-digit area code, then 4-4.
            [national.slice(0, 1), national.slice(1, 5), national.slice(5)]
          : [national];

  return `+61 ${grouped.filter(Boolean).join(' ')}`;
}

/** Formatted one-line address for the footer and contact page. */
export function formatAddress(address: SiteSettings['address']): string {
  return [address.street, `${address.suburb} ${address.state} ${address.postcode}`].join(', ');
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/**
 * "October 2026", or null once the move date has passed.
 *
 * The only surface for a future address: the footer runs it under the address
 * line. Formatted by hand rather than through `toLocaleDateString`, because
 * month names from ICU differ between the build container and a developer's
 * machine and this string is baked into static HTML. `now` is injectable so
 * the expiry is testable without touching the clock.
 */
export function addressEffectiveMonth(
  settings: SiteSettings,
  now: Date = new Date(),
): string | null {
  if (!settings.address.effectiveFrom) return null;

  const effective = new Date(`${settings.address.effectiveFrom}T00:00:00Z`);
  if (Number.isNaN(effective.getTime()) || now >= effective) return null;

  return `${MONTHS[effective.getUTCMonth()]} ${effective.getUTCFullYear()}`;
}

/**
 * Canonical origin, resolved in priority order.
 *
 * Vercel injects a declared-but-unset variable as an empty string, so a `??`
 * fallback is not enough here: an empty value has to be treated as absent, or
 * `new URL('')` throws during the metadata collection pass and fails the build.
 */
function normaliseOrigin(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  // Vercel's system host vars arrive bare (`commercial-painters.vercel.app`),
  // and a hand-entered domain usually does too. Assume https rather than
  // reject it.
  const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).href.replace(/\/$/, '');
  } catch {
    return undefined;
  }
}

const resolvedOrigin =
  normaliseOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
  // No explicit origin on Vercel: use the stable production domain in
  // production and the per-deployment host everywhere else, so preview builds
  // never advertise production URLs in their sitemap, canonicals or JSON-LD.
  normaliseOrigin(
    process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL,
  );

// The localhost fallback exists for development. A production build that
// reached it would ship localhost canonicals, a localhost sitemap reference
// and localhost JSON-LD on every one of ~1,400 URLs — silently. Fail the build
// instead: a mis-deployed environment is a one-line fix, a localhost sitemap
// in Search Console is not.
//
// Server-only, deliberately. Next inlines NODE_ENV and NEXT_PUBLIC_* into
// browser bundles but never the VERCEL_* system vars, so on a Vercel deploy
// without NEXT_PUBLIC_SITE_URL the server resolves an origin while the
// browser cannot — and this file is in the every-page client graph via the
// header's mobile menu. A module-scope throw here would pass the build, then
// crash hydration on every page. Client code only consumes `site`, so the
// browser's silent localhost fallback is unused anyway.
if (!resolvedOrigin && typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  throw new Error(
    'No site origin configured. Set NEXT_PUBLIC_SITE_URL (or deploy on Vercel, ' +
      'whose system env vars provide one) — a production build must never fall ' +
      'back to http://localhost:3000.',
  );
}

export const siteUrl = resolvedOrigin ?? 'http://localhost:3000';

/**
 * Every noindex layer, switched together.
 *
 * `NEXT_PUBLIC_NOINDEX="true"` is the staging guard: it turns on the meta
 * robots directive, the `X-Robots-Tag` header (next.config.ts), a `Disallow: /`
 * robots.txt and a 404 on /llms.txt, so a preview deployment on a temporary
 * host can never be indexed beside — or instead of — the live site. A
 * header-level noindex overrides everything, so all four have to agree, which
 * is why they key off this one value. Leave it unset in production.
 */
export const noindexAll = process.env.NEXT_PUBLIC_NOINDEX === 'true';
