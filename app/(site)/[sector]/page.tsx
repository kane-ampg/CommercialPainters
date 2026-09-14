import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import {
  ContentBlock,
  CtaBand,
  FaqList,
  Hero,
  ProjectGrid,
  RelatedLinks,
  WorkGalleryBlock,
} from '@/components/sections';
import {
  Card,
  Container,
  microLabel,
  Placeholder,
  Prose,
  Section,
  SectionHeading,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { JsonLd } from '@/components/seo/json-ld';
import { faqSchema, serviceSchema } from '@/lib/schema';
import { galleryForSector } from '@/content/galleries';
import { sectors } from '@/content/sectors';
import { getProject, getSiteSettings } from '@/lib/content/source';

/**
 * Sector pages.
 *
 * These live at the root (/healthcare-painters/, /retail-painting/ and so on),
 * one dynamic segment serving all of them — static routes such as /about-us/
 * and /commercial/ still take precedence, and anything unmatched falls through
 * to notFound(), which is a real 404.
 */

const bySlug = new Map(sectors.map((s) => [s.legacyPath.replace(/\//g, ''), s]));

export function generateStaticParams() {
  return sectors.map((sector) => ({ sector: sector.legacyPath.replace(/\//g, '') }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ sector: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector: slug } = await params;
  const sector = bySlug.get(slug);
  if (!sector) return {};

  return buildMetadata({
    title: sector.metaTitle,
    description: sector.metaDescription,
    path: sector.legacyPath,
    /*
     * Indexable unconditionally — evidence gates the claim, not the URL.
     *
     * This was gated on a documented project, a rule borrowed from the suburb
     * tiers, and it kept five of the eight sectors — aged care, strata,
     * retail, hospitality, leisure — out of Google entirely. The rule does
     * not transfer. A Tier 3 suburb page is generated boilerplate; every
     * sector page carries hand-written `considerations`, `body` and `faqs`
     * that exist for no other URL on this site, and they are the highest
     * commercial intent the business has ("strata painting Melbourne" and its
     * siblings). Withholding them avoided a thinness that was never there.
     *
     * What stays evidence-gated is the Evidence section below, which renders
     * a Placeholder stating the sector makes no experience claim rather than
     * a project grid. That disclosure is what makes the page honest to index.
     */
    index: true,
  });
}

export default async function SectorPage({ params }: Props) {
  const { sector: slug } = await params;
  const sector = bySlug.get(slug);
  if (!sector) notFound();

  const [projects, settings] = await Promise.all([
    Promise.all(sector.projectSlugs.map((projectSlug) => getProject(projectSlug))).then((all) =>
      all.filter((project) => project !== undefined),
    ),
    getSiteSettings(),
  ]);

  /** Photographs from a site of this kind, where one has been shot. */
  const gallery = galleryForSector(sector.slug);

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: sector.title,
          description: sector.metaDescription,
          path: sector.legacyPath,
          settings,
        })}
      />
      <JsonLd data={faqSchema(sector.faqs)} />

      <Container width="wide">
        <Breadcrumbs
          crumbs={[
            { name: 'Commercial painting', path: '/commercial/' },
            { name: sector.shortTitle, path: sector.legacyPath },
          ]}
        />
      </Container>

      <Hero
        eyebrow="Commercial painting"
        heading={sector.title}
        lede={sector.intro}
        primaryCta={{ label: 'Get a free site assessment', href: '/contact-us/#assessment' }}
        secondaryCta={{ label: 'All commercial work', href: '/commercial/' }}
      />

      <Section tone="paper">
        <Container>
          <SectionHeading className="mb-3">What shapes work in this sector</SectionHeading>
          <p className="mb-8 max-w-prose text-ink-soft">
            The operational constraints that decide how the programme is built.
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {sector.considerations.map((item) => (
              <Card as="li" key={item.heading} className="gap-2">
                <h3 className="font-display text-lg">{item.heading}</h3>
                <p className="text-sm text-ink-soft">{item.body}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      <ContentBlock tone="sunken" heading="What the work involves">
        <Prose>
          {sector.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </Prose>
      </ContentBlock>

      <Section tone="paper">
        <Container>
          <SectionHeading className="mb-6">Evidence</SectionHeading>
          {projects.length > 0 ? (
            <ProjectGrid projects={projects} />
          ) : (
            <Placeholder
              note={
                gallery
                  ? `no completed ${sector.shortTitle.toLowerCase()} project is written up yet, so this page makes no sector experience claim. Photographs from one such site are below — they show the work, not a documented scope. Written case studies from other sectors are on the projects page.`
                  : `no completed ${sector.shortTitle.toLowerCase()} project is documented yet, so this page makes no sector experience claim. Documented case studies from other sectors are on the projects page.`
              }
            />
          )}
        </Container>
      </Section>

      {/*
       * Photographs, kept out of the Evidence section above rather than folded
       * into it.
       *
       * That section is the page's one claim about what the business has
       * actually delivered in this sector, and it is gated on a written record.
       * A gallery is a weaker thing — it proves the crew was on a site of this
       * kind and shows how they worked, and nothing about scope or outcome. It
       * gets its own slab and its own heading so the distinction survives a
       * skim, and the placeholder above says so in as many words.
       */}
      {gallery && (
        <Section tone="ink">
          <Container width="wide">
            <p className={cn(microLabel, 'mb-3 text-brand-500')}>Photographed on site</p>
            {/*
             * The disclosure rides with the gallery rather than with the
             * Placeholder above it.
             *
             * It used to be a clause in that Placeholder, which only renders
             * when the sector has NO documented project — so on the two
             * sectors that have both a case study and a gallery (education,
             * industrial) the photographs appeared directly beneath a grid of
             * written case studies with nothing saying they were a different
             * kind of thing. Attached here it cannot come apart from what it
             * describes.
             */}
            <p className="mb-8 max-w-prose text-sm leading-relaxed text-white/60">
              Photographs from a {sector.shortTitle.toLowerCase()} site we have worked on. They show
              the work as it happened — they are not a written case study, and no scope, programme
              or outcome is claimed from them.
            </p>
            <WorkGalleryBlock gallery={gallery} headingLevel="h2" tone="ink" />
          </Container>
        </Section>
      )}

      <ContentBlock tone="sunken" heading={`${sector.shortTitle} painting questions`}>
        <FaqList items={sector.faqs} />
      </ContentBlock>

      <ContentBlock heading="Related">
        <Prose className="mb-6">
          <p>
            Commercial work rarely sits in one sector. These are the closest neighbours to{' '}
            {sector.shortTitle.toLowerCase()}.
          </p>
        </Prose>
        <RelatedLinks
          heading="Other sectors"
          links={sectors
            .filter((other) => other.slug !== sector.slug)
            // Sectors with a documented project first: a plain slice(0, 6) of
            // the content order dropped Industrial & warehouse — last in the
            // file, one of only three sectors with a case study — from every
            // other sector page on the site. Stable sort, so content order
            // still decides within each group.
            .sort((a, b) => Number(b.projectSlugs.length > 0) - Number(a.projectSlugs.length > 0))
            .slice(0, 6)
            .map((other) => ({ label: other.shortTitle, href: other.legacyPath }))}
        />
      </ContentBlock>

      <CtaBand
        heading={`Talk to us about ${sector.shortTitle.toLowerCase()} work`}
        body="Tell us the site, the constraints and when we are allowed on it."
        cta={{ label: 'Get a free site assessment', href: '/contact-us/#assessment' }}
        phone={settings.phone}
      />
    </>
  );
}
