import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import {
  ClientSectors,
  ContentBlock,
  CtaBand,
  FaqList,
  Hero,
  ProcessSteps,
  ProjectGrid,
  ProofStrip,
  SectorGrid,
  ServiceAreaGroups,
} from '@/components/sections';
import { Container, Prose, Section, SectionHeading } from '@/components/ui';
import { JsonLd } from '@/components/seo/json-ld';
import { faqSchema, serviceSchema } from '@/lib/schema';
import { sectors } from '@/content/sectors';
import { getFeaturedProjects, getSiteSettings } from '@/lib/content/source';
import { faqsFor } from '@/content/faqs';
import { clientSectors } from '@/content/client-sectors';
import { roundedDown, scale, scaleFigures } from '@/content/scale';
import { metroAreaGroups, regionalTowns } from '@/content/service-areas';

/**
 * Commercial hub — targets "commercial painting services Melbourne".
 *
 * Until 27 September 2026 this page owned "commercial painters Melbourne". The
 * homepage owns that phrase now (see app/(site)/page.tsx for why), so this
 * page takes the service query beside it and must not lead with the homepage's
 * phrase in its title or h1. Tests hold both sides of that split.
 *
 * It also carries none of the old site's national claim ("hundreds of ... all
 * throughout Australia"): every project the business can evidence is
 * Victorian.
 */
// The sites figure is read from content/scale.ts, so a new count updates the
// SERP snippet with the page. The client count moved to the homepage title
// with the primary keyword. The description must stay under 160 characters;
// a test holds that.
export const metadata: Metadata = buildMetadata({
  title: 'Commercial Painting Services Melbourne | Commercial Painters',
  description: `Commercial painting services in Melbourne for strata, childcare, aged care, retail and property managers. ${roundedDown(scale.activeSites, 50)} sites serviced, staged around your hours.`,
  path: '/commercial/',
});

const PROCESS = [
  {
    step: 'Site assessment',
    icon: 'site-visit',
    body: 'We attend site before quoting. Scope, substrate condition, access constraints and the hours we are allowed to work all get established there rather than assumed.',
  },
  {
    step: 'Documented scope and quotation',
    icon: 'quote',
    body: 'An itemised quotation broken down by area, system and schedule — written so a committee, a board or a procurement lead can approve it without a second round of questions.',
  },
  {
    step: 'Pre-start and paperwork',
    icon: 'documents',
    body: 'Safe Work Method Statements, insurance certificates and site-specific compliance documentation prepared in advance, with a pre-start meeting to confirm expectations.',
  },
  {
    step: 'Staged delivery',
    icon: 'delivery',
    body: 'Work sequenced zone by zone or after hours so the building keeps operating. Access planned per elevation — ladders, scaffolding, scissor lift or EWP as each area requires.',
  },
  {
    step: 'Handover',
    icon: 'handover',
    body: 'Areas cleaned down and handed back progressively rather than all at the end, so the site regains use of each space as it is finished.',
  },
] as const;

export default async function CommercialPage() {
  const [featuredProjects, settings] = await Promise.all([
    getFeaturedProjects(),
    getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: 'Commercial Painting',
          description:
            'Commercial painting across metropolitan Melbourne and regional Victoria for strata and body corporate, childcare, real estate and property management, commercial property, aged care, community and retail clients.',
          path: '/commercial/',
          settings,
        })}
      />
      {/* The page already carried the FAQ content; it emitted no FAQPage, so
          neither rich results nor AI answer engines could extract it. */}
      <JsonLd data={faqSchema(faqsFor('commercial'))} />

      <Container width="wide">
        <Breadcrumbs crumbs={[{ name: 'Commercial painting', path: '/commercial/' }]} />
      </Container>

      <Hero
        eyebrow="Melbourne and regional Victoria"
        heading="Commercial painting services"
        lede="Painting commercial buildings is mostly a coordination problem. The coating matters, but what decides whether a project works is how well it is staged around the people still using the building."
        primaryCta={{ label: 'Get a free site assessment', href: '/contact-us/#assessment' }}
        secondaryCta={{ label: 'See our projects', href: '/projects/' }}
        image={{
          src: '/images/work/ewp-tilt-panel-cutting-in.webp',
          alt: 'A painter working from a boom lift, harnessed, cutting the line between white and green tilt panels on a warehouse elevation',
        }}
      />

      <ProofStrip figures={scaleFigures} source={`From our client records, ${scale.asOf}.`} />

      <ContentBlock heading="What commercial work actually involves">
        <Prose>
          <p>
            We deliver interior and exterior painting for commercial and industrial sites across
            Melbourne — from tenancy repaints and{' '}
            <Link href="/office-painters/" className="font-semibold text-brand-700 hover:underline">
              office repaints and fit-outs
            </Link>{' '}
            through to large-format building exteriors. Projects range from a two-person, two-day
            job through to programmes requiring boom lifts, scissor lifts, scaffolding and roof
            rigging.
          </p>
          <p>
            The harder projects need surface knowledge more than they need labour. Older buildings
            need existing coatings identified and the substrate properly assessed before anything is
            specified. Preparation is matched to what we find — hot or cold power washing, steam
            cleaning, sandblasting, abrasion or chemical treatment where required.
          </p>
          <p>
            Most of the sites we work on stay open throughout. That is the constraint that shapes
            everything else: how zones are isolated, when work happens, and how each area is handed
            back.
          </p>
        </Prose>
      </ContentBlock>

      <Section tone="sunken">
        <Container>
          <SectionHeading className="mb-3">How a commercial project runs</SectionHeading>
          <p className="mb-8 max-w-prose text-ink-soft">
            Five stages, in order. The documentation exists before anyone picks up a brush.
          </p>
          <ProcessSteps steps={PROCESS} />
        </Container>
      </Section>

      <ContentBlock heading="Sectors we work in">
        <Prose className="mb-8">
          <p>
            Of our {scale.activeClients} active clients, {scale.businessClients} are businesses and
            organisations. These are the sectors they sit in, and what commercial painting has to
            work around in each.
          </p>
        </Prose>
        <ClientSectors items={clientSectors} />

        <h3 className="mb-3 mt-14 font-display text-2xl">Sector guides</h3>
        <p className="mb-8 max-w-prose text-ink-soft">
          Each guide sets out one sector&rsquo;s operating constraints in detail, rather than
          repeating the same paint copy with a different heading.
        </p>
        <SectorGrid sectors={sectors} />
      </ContentBlock>

      <ContentBlock tone="sunken" heading="Areas we service" id="areas">
        <Prose className="mb-8">
          <p>
            {scale.victoriaSharePercent}% of our work is in Victoria, across{' '}
            {roundedDown(scale.suburbs, 50)} suburbs and towns in metropolitan Melbourne and
            regional Victoria. {scale.multiSiteClients} of our clients have more than one site with
            us, so a programme often runs across several of the areas below at once.
          </p>
        </Prose>
        <ServiceAreaGroups groups={metroAreaGroups} regionalTowns={regionalTowns} />
      </ContentBlock>

      <Section tone="sunken">
        <Container>
          <SectionHeading className="mb-3">Commercial case studies</SectionHeading>
          <p className="mb-8 max-w-prose text-ink-soft">
            Documented projects, including the access methods used and the constraints worked
            around.
          </p>
          <ProjectGrid projects={featuredProjects} />
        </Container>
      </Section>

      <ContentBlock heading="Commercial painting questions">
        <FaqList items={faqsFor('commercial')} />
      </ContentBlock>

      <CtaBand
        heading="Request a site assessment"
        body="Tell us the sector, the location and the hours we are allowed on site. We will come and look before quoting."
        cta={{ label: 'Get a free site assessment', href: '/contact-us/#assessment' }}
        phone={settings.phone}
      />
    </>
  );
}
