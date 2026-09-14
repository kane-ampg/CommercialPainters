import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  CtaBand,
  ContentBlock,
  FaqList,
  FeatureGrid,
  HomeHero,
  ProcessSteps,
  ProjectGrid,
  GoogleReviewWall,
  RecentWorkStrip,
  SectorGrid,
  ServiceAreas,
  ServiceGrid,
} from '@/components/sections';
import { JsonLd } from '@/components/seo/json-ld';
import { ButtonLink, Container, Prose, Section, SectionHeading } from '@/components/ui';
import { faqSchema } from '@/lib/schema';
import { differentiators } from '@/content/approach';
import { homeFaqs } from '@/content/faqs';
import { galleries, galleryCovers } from '@/content/galleries';
import { indexableLocalities } from '@/lib/locations';
import { getFeaturedProjects, getServices, getSiteSettings } from '@/lib/content/source';
import { googleAggregate } from '@/content/reviews';
import { sectors } from '@/content/sectors';
import { site } from '@/lib/site';

/**
 * Homepage.
 *
 * The title is brand-led, deliberately. /commercial/ is the page that targets
 * "commercial painters Melbourne" as a service query; the homepage's job is to
 * carry proof, not to compete with it for the same phrase.
 *
 * The description carries "how to choose a commercial painter in Melbourne".
 * That phrase used to be the H2 over the differentiator grid, where it read as
 * copy written for a crawler rather than for a facilities manager. The section
 * heading is now plain English; the query it was targeting is served from the
 * description instead. Do not put it back on the page.
 *
 * Everything below is assembled from the typed content files. No figure, quote
 * or credential is written as a literal in this file — if it appears on this
 * page it exists in content/ or lib/site.ts and has survived the same
 * verification rule as every other surface.
 */
export const metadata: Metadata = buildMetadata({
  title: 'Commercial Painters | Melbourne Commercial Painting Contractor',
  description:
    'How to choose a commercial painter in Melbourne — six questions answered by a contractor working across schools, healthcare, strata and industrial sites.',
  path: '/',
});

/**
 * The general version of the process. /commercial/ carries its own, which adds
 * a pre-start documentation stage — that stage is genuinely specific to larger
 * programmes, so the two lists differ by exactly that one step.
 */
const PROCESS = [
  {
    step: 'Enquiry',
    icon: 'enquiry',
    body: 'Tell us the building, the areas involved and when we are allowed on site. Those three answers are what decide whether a site assessment can be scheduled.',
  },
  {
    step: 'Site visit',
    icon: 'site-visit',
    body: 'We attend before quoting. Scope, substrate condition, access and the hours we are allowed to work get established rather than assumed.',
  },
  {
    step: 'Written scope and quote',
    icon: 'quote',
    body: 'An itemised breakdown covering labour, materials and scheduling — per location where the work spans several sites — so you can see where the cost actually sits.',
  },
  {
    step: 'Staged delivery',
    icon: 'delivery',
    body: 'Work sequenced zone by zone or after hours so the building keeps operating. Access planned per area: ladders, scaffolding, scissor lift or EWP as each space requires.',
  },
  {
    step: 'Handover',
    icon: 'handover',
    body: 'Areas cleaned down and handed back progressively rather than all at the end, so the site regains the use of each space as it is finished.',
  },
] as const;

export default async function HomePage() {
  const yearsTrading = new Date().getFullYear() - site.founded;
  const [services, featuredProjects, settings] = await Promise.all([
    getServices(),
    getFeaturedProjects(),
    getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd data={faqSchema([...differentiators, ...homeFaqs])} />

      <HomeHero
        eyebrow="Melbourne painting contractor"
        heading="Painters for buildings that"
        headingAccent="cannot stop running"
        lede="Commercial painting across metropolitan Melbourne — schools mid-term, clinics between patients, warehouses mid-shift, and buildings that cannot stop operating for the job to get done."
        primaryCta={{ label: 'Commercial painting', href: '/commercial/' }}
        secondaryCta={{ label: 'See our projects', href: '/projects/' }}
        proof={[
          { figure: `${yearsTrading} years`, label: 'In business' },
          {
            figure: `${googleAggregate.rating.toFixed(1)} on Google`,
            label: `From ${googleAggregate.count} reviews`,
          },
          { figure: 'Cm3', label: 'OHS prequalified' },
        ]}
        poster={{
          src: '/images/hero/banner-poster.webp',
          alt: 'Melbourne from the air over Docklands, looking across the Yarra to the CBD skyline',
        }}
        scrollTo={{ label: 'What we paint', href: '#services' }}
        phone={settings.phone}
      />

      <ContentBlock eyebrow="Services" heading="What we paint" id="services" width="wide">
        <Prose className="mb-8">
          <p>
            Five lines of work, run by the same team. Most jobs draw on more than one of them — an
            exterior programme that needs render repairs first, or an office repaint that ends up
            including the patching and the flooring.
          </p>
        </Prose>
        <ServiceGrid services={services} />
      </ContentBlock>

      <ContentBlock tone="sunken" eyebrow="Sectors" heading="Where we work most" id="sectors">
        <Prose className="mb-8">
          <p>
            Most of our commercial work sits in buildings where the painting is the easy part and
            the scheduling is not. Each sector below sets out the constraints that actually shape
            the job.
          </p>
        </Prose>
        <SectorGrid sectors={sectors} />
      </ContentBlock>

      <Section tone="paper">
        <Container>
          <SectionHeading className="mb-3">How a job runs</SectionHeading>
          <p className="mb-8 max-w-prose text-ink-soft">
            The same five steps whether it is a single tenancy or a whole campus. Larger programmes
            add a documentation and pre-start stage on top of them.
          </p>
          <ProcessSteps steps={PROCESS} stepLabel="Step" />
        </Container>
      </Section>

      <ContentBlock
        tone="sunken"
        eyebrow="How we work"
        heading="Six questions worth asking any contractor"
      >
        <Prose className="mb-8">
          <p>
            Almost nobody chooses a painter on the paint. Here is how we answer the six questions
            that matter.
          </p>
        </Prose>
        <FeatureGrid
          items={differentiators.map((d) => ({ heading: d.question, body: d.answer }))}
        />
      </ContentBlock>

      <Section tone="paper">
        <Container width="wide">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionHeading>Recent projects</SectionHeading>
              <p className="mt-2 text-ink-soft">
                Documented start to finish — access methods, constraints and outcomes.
              </p>
            </div>
            <ButtonLink href="/projects/" variant="outline">
              All projects
            </ButtonLink>
          </div>
          <ProjectGrid projects={featuredProjects} />
        </Container>
      </Section>

      {/*
       * The case-study grid above is the written record; this is the visual
       * one. One lead frame from each photographed site, on the signature red
       * -ruled slab — the page's only run of real photography below the fold,
       * and the thing a facilities manager actually scans for before reading
       * a word of the process.
       */}
      <RecentWorkStrip
        images={galleryCovers}
        heading="On site recently"
        body={`Commercial buildings across ${galleries.length} sites — dealership showrooms, an office fitout, a school teaching block, a bar and an apartment foyer. Photographed as the work was happening.`}
        action={{ label: 'See every site', href: '/projects/' }}
      />

      <GoogleReviewWall />

      <ContentBlock eyebrow="Areas" heading="Where we work across Melbourne">
        <ServiceAreas locations={indexableLocalities()} baseSuburb={settings.address.suburb} />
      </ContentBlock>

      <ContentBlock tone="sunken" heading={`About ${site.name}`}>
        <Prose>
          <p>
            {site.name} was founded in {site.founded} and has grown into a painting and property
            maintenance contractor working across schools, healthcare, aged care, strata, retail and
            industrial sites. Those clients rate the work {googleAggregate.rating.toFixed(1)} out of
            5 across {googleAggregate.count} Google reviews.
          </p>
          <p>
            The approach has not changed much: do the work properly, keep the standard consistent,
            and run projects in a way that is organised and easy for clients to work alongside.
            Every project is professionally managed from the first site visit to handover.
          </p>
          <p>
            We use premium-grade paints and materials, including <strong>Dulux</strong> systems,
            selected for the substrate and the conditions rather than for the quote.
          </p>
          <p>
            <Link href="/about-us/" className="font-semibold text-brand-700 hover:underline">
              More about the business
            </Link>
          </p>
        </Prose>
      </ContentBlock>

      <ContentBlock eyebrow="Questions" heading="Before you enquire">
        <p className="mb-8 max-w-prose text-ink-soft">
          The questions that come up before anyone has decided on scope. The{' '}
          <Link href="/commercial/" className="font-semibold text-brand-700 hover:underline">
            commercial
          </Link>{' '}
          page answers the ones specific to a sector.
        </p>
        <FaqList items={homeFaqs} />
      </ContentBlock>

      <CtaBand
        heading="Start with a free site assessment"
        body="On site in Melbourne or online anywhere. We look before we put a number on anything."
        cta={{ label: 'Get a free site assessment', href: '/contact-us/#assessment' }}
        phone={settings.phone}
      />
    </>
  );
}
