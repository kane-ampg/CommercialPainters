import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { CtaBand, ProjectGrid, WorkGalleries } from '@/components/sections';
import { Container, Prose, Section, SectionHeading } from '@/components/ui';
import { getFeaturedProjects, getSiteSettings } from '@/lib/content/source';
import { galleries, galleryFrameCount } from '@/content/galleries';

export const metadata: Metadata = buildMetadata({
  title: 'Painting Projects & Case Studies | Commercial Painters',
  description:
    'Documented commercial painting projects across Melbourne — schools, factories, clinics and offices — including access methods, site constraints and outcomes.',
  path: '/projects/',
});

export default async function ProjectsPage() {
  const [featuredProjects, settings] = await Promise.all([
    getFeaturedProjects(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Section tone="sunken" className="py-10">
        <Container width="wide">
          <Breadcrumbs crumbs={[{ name: 'Projects', path: '/projects/' }]} />
          <h1 className="font-display text-4xl sm:text-5xl">Projects</h1>
          <p className="mt-4 max-w-prose text-lg text-ink-soft">
            Completed work, written up properly — what the site was, what constrained the job, how
            access was managed, and what was delivered.
          </p>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <SectionHeading className="mb-6">Documented case studies</SectionHeading>
          <ProjectGrid projects={featuredProjects} />
        </Container>
      </Section>

      {/*
       * There is no "Further projects" section any more.
       *
       * It existed to list projects whose records are too thin to write up —
       * in practice one clinic fit-out — under an "awaiting content" banner.
       * That made sense when it was the only other thing on the page. Now the
       * galleries below carry the photographic evidence properly, and a lone
       * card advertising what is missing reads as an apology in the middle of
       * the strongest work on the site.
       *
       * Nothing is orphaned: the project keeps its page, and /healthcare-
       * painters/ still links to it through the sector's `projectSlugs`
       * (content/sectors.ts). Set `isFeatured: true` on it once the record
       * arrives and it joins the documented grid above on its own.
       */}

      {galleries.length > 0 && (
        <>
          <Section tone="paper" className="pb-0">
            <Container width="wide">
              <SectionHeading className="mb-3">Sites we have photographed</SectionHeading>
              <Prose>
                <p>
                  {galleryFrameCount} photographs across {galleries.length} commercial sites. These
                  are not case studies — there is no written record of scope, preparation or
                  programme behind them, so nothing is claimed here beyond what the photographs
                  show. They are the work itself: the access, the masking, the preparation and the
                  finish, as each site actually looked while the crew was on it.
                </p>
              </Prose>
            </Container>
          </Section>

          <WorkGalleries galleries={galleries} />
        </>
      )}

      <CtaBand
        heading="Want something similar?"
        body="Tell us about the site and we will tell you how we would approach it."
        cta={{ label: 'Get in touch', href: '/contact-us/' }}
        phone={settings.phone}
      />
    </>
  );
}
