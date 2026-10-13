import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata, metaDescription } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { SiteAssessmentForm } from '@/components/forms/enquiry-forms';
import { FaqList, GoogleReviewWall, RelatedLinks } from '@/components/sections';
import {
  CouncilBlock,
  defaultDescription,
  defaultIntro,
  LocalityFacts,
  LocalServices,
  localityFaqs,
  NearbySuburbs,
  NearbyWork,
  NearestProjectBlock,
  WhyChooseUs,
} from '@/components/sections/locality';
import {
  ButtonLink,
  Container,
  Eyebrow,
  Lede,
  microLabel,
  Prose,
  Section,
  SectionHeading,
} from '@/components/ui';
import { sectors } from '@/content/sectors';
import { getServices, getSiteSettings } from '@/lib/content/source';
import { allLocalities, displayName, getLocality, getRegion, stateSlug } from '@/lib/locations';
import { phoneHref } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Suburb pages — 1,387 of them, one per locality in the merged dataset.
 *
 * Flat `{ state, region, suburb }` objects covering all three segments, which
 * is the documented shape for multiple dynamic segments; no parent chaining is
 * required. `dynamicParams = false` means anything outside this list is a real
 * 404 rather than a rendered page for a suburb we have no data for.
 *
 * Indexability comes from the data (`locality.indexable`), never from the
 * route: 19 of these are Tier 1. The other 1,368 are `noindex, follow` — they
 * must stay traversable, because the links out of them to the region hubs are
 * how the hubs earn their internal link equity.
 *
 * The page runs in two halves. The top describes the place — council,
 * postcode, distance, building stock — from data. The rest is what someone in
 * that place is shopping for: services, photographed work nearby, why us,
 * reviews, the questions before an enquiry, and the enquiry form itself with
 * the suburb already filled in. Commercial only, and the Queensland branches
 * claim no presence; see components/sections/locality.tsx.
 */
export function generateStaticParams() {
  return allLocalities().map((l) => ({
    state: stateSlug(l.state),
    region: l.regionSlug,
    suburb: l.slug,
  }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ state: string; region: string; suburb: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, region, suburb } = await params;
  const locality = getLocality(state, region, suburb);
  if (!locality) return {};

  const name = displayName(locality.name);
  const vic = locality.state === 'VIC';

  return buildMetadata({
    title: vic
      ? `Commercial Painters ${name} | Melbourne Commercial Painting`
      : `Commercial Painting ${name} | Commercial Painters`,
    description:
      // Sentence-boundary cut, not slice(0, 155): Vermont's snippet used to
      // end "…school stayed open. Vermo" in the SERP.
      (locality.intro ? metaDescription(locality.intro) : undefined) ??
      metaDescription(defaultDescription(locality)),
    path: locality.href,
    // Data-driven: Tier 3 pages are noindex until they earn otherwise.
    index: locality.indexable,
  });
}

/** The enquiry form's anchor. The hero's primary button jumps here. */
const ENQUIRE_ID = 'enquire';

export default async function SuburbPage({ params }: Props) {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  const { state, region, suburb } = await params;
  const locality = getLocality(state, region, suburb);
  if (!locality) notFound();

  const regionDef = getRegion(locality.regionSlug);
  const regionName = regionDef?.name ?? region;
  const name = displayName(locality.name);
  const vic = locality.state === 'VIC';
  const postcodes = locality.postcodes.join(', ');

  return (
    <>
      <Container width="wide">
        <Breadcrumbs
          crumbs={[
            { name: 'Service areas', path: '/areas/' },
            { name: vic ? 'Victoria' : 'Queensland', path: `/areas/${state}/` },
            { name: regionName, path: `/areas/${state}/${region}/` },
            { name, path: locality.href },
          ]}
        />
      </Container>

      <Section tone="sunken" className="py-10 sm:py-14" reveal={false}>
        <Container width="wide">
          <Eyebrow>{`${regionName} · ${postcodes}`}</Eyebrow>
          {/* One H1, and it names the suburb once. The live pages render
              "Painters Painters Armadale" and "Painting Brighton". */}
          <h1 className="font-display text-4xl sm:text-5xl">
            {`Commercial ${vic ? 'painters' : 'painting'} in ${name}`}
          </h1>
          <Lede className="mt-4">
            {/* There is no Queensland address, phone number or completed
                project, so Queensland copy says what is serviced, never where
                the business sits. */}
            {vic
              ? `Interior and exterior painting for offices, schools, clinics, shops, strata and industrial buildings in ${name}, staged so the site keeps running.`
              : `Commercial Painters services ${name} for interior and exterior commercial painting.`}
          </Lede>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={`#${ENQUIRE_ID}`}>
              {vic ? 'Get a free site assessment' : 'Ask about a site'}
            </ButtonLink>
            <ButtonLink href={phoneHref(settings.phone)} variant="outline">
              {`Call ${settings.phone}`}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Prose>
              <p>{locality.intro ?? defaultIntro(locality)}</p>
              {locality.localNotes?.map((note) => (
                <p key={note}>{note}</p>
              ))}
              {vic && (
                <p>
                  Every job starts with a visit to the building, so the scope, the condition of the
                  surfaces, access and your working hours are settled before a price is.
                </p>
              )}
            </Prose>

            <LocalityFacts locality={locality} />
          </div>
        </Container>
      </Section>

      <Section tone="sunken">
        <Container>
          <CouncilBlock locality={locality} />
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <LocalServices locality={locality} services={services} />
        </Container>
      </Section>

      {/* Victoria shows the nearest photographed sites above the nearest case
          study; Queensland has neither and says so in the project block. */}
      <Section tone="sunken">
        <Container>
          <div className="flex flex-col gap-12">
            <NearbyWork locality={locality} />
            <NearestProjectBlock locality={locality} />
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <WhyChooseUs locality={locality} />
        </Container>
      </Section>

      <GoogleReviewWall />

      <Section tone="paper">
        <Container>
          <SectionHeading className="mb-8">Before you enquire</SectionHeading>
          <FaqList items={localityFaqs(locality)} />
        </Container>
      </Section>

      <Section tone="sunken">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <NearbySuburbs locality={locality} />
            <RelatedLinks
              heading="Commercial sectors we work in"
              links={sectors.map((sector) => ({
                label: sector.shortTitle,
                href: sector.legacyPath,
              }))}
            />
          </div>
        </Container>
      </Section>

      <Section tone="paper" id={ENQUIRE_ID}>
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className={cn(microLabel, 'mb-2 text-brand-600')}>Free for organisations</p>
              <SectionHeading className="mb-3">
                {vic ? `Get a free site assessment in ${name}` : `Ask about a site in ${name}`}
              </SectionHeading>
              <p className="max-w-prose text-ink-soft">
                {vic
                  ? 'Tell us what kind of building it is and how to reach you. We call back, arrange a time to walk the site, and send a written, itemised quote.'
                  : 'Tell us what kind of building it is and how to reach you. We call back to talk through the scope and how the work would be quoted.'}
              </p>
              <p className="mt-6 text-ink-soft">
                Or call{' '}
                <a
                  href={phoneHref(settings.phone)}
                  className="font-semibold text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                >
                  {settings.phone}
                </a>{' '}
                — Monday to Friday.
              </p>
            </div>
            <div className="border border-paper-edge bg-white p-5 sm:p-8 lg:col-span-7">
              <SiteAssessmentForm defaultSuburb={name} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
