import type { Metadata } from 'next';
import Image from 'next/image';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { CtaBand } from '@/components/sections';
import { TeamGrid } from '@/components/sections/team';
import {
  ButtonLink,
  Container,
  Eyebrow,
  Placeholder,
  Section,
  SectionHeading,
} from '@/components/ui';
import { team } from '@/content/team';
import { getSiteSettings } from '@/lib/content/source';
import { assessors } from '@/lib/site';

/*
 * `noindex` while the team list is empty, for the reason the blog index gives:
 * a page whose body is a placeholder is not one to ask Google to index. Nothing
 * links here until then either — see `team` in content/team.ts.
 */
export const metadata: Metadata = buildMetadata({
  title: 'Our Team | Commercial Painters Melbourne',
  description:
    'Meet the people behind Commercial Painters: the directors, estimators, account managers and supervisors who price, plan and run commercial painting in Melbourne.',
  path: '/about-us/our-team/',
  index: team.length > 0,
});

export default async function TeamPage() {
  const settings = await getSiteSettings();
  // "Farbod, Zac or Simon".
  const assessorNames = `${assessors.slice(0, -1).join(', ')} or ${assessors[assessors.length - 1]}`;

  return (
    <>
      {/*
       * Masthead.
       *
       * The crew photograph full-bleed behind the heading, under a heavy ink
       * scrim. The scrim is there for the white type and does a second job:
       * the hoodies carry the group's badge, and at this weight it is texture
       * rather than something readable — checked at 1920px, where the 1200px
       * source is enlarged most. Red rule at the base, as on the contact page:
       * the cut line the page is divided on.
       */}
      <section className="relative isolate overflow-hidden border-b-4 border-brand-600 bg-ink text-white">
        <Image
          src="/images/company/crew-onsite.webp"
          alt="Members of the painting crew standing together on a commercial interior job, a stepladder behind them"
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          className="-z-20 object-cover object-[50%_15%]"
        />
        {/* Even across the frame, not lighter on the right: the badges are
            spread along the whole row, and the lightest side is where one
            became readable at 1920px. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/[0.82] to-ink/80"
        />
        <Container width="wide">
          <div className="py-16 sm:py-24 lg:py-32">
            <Breadcrumbs
              crumbs={[
                { name: 'About', path: '/about-us/' },
                { name: 'Our team', path: '/about-us/our-team/' },
              ]}
              tone="ink"
            />
            <h1 className="mt-2 text-balance font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Meet our team
            </h1>
            <p className="mt-6 max-w-prose text-lg leading-relaxed text-white/80">
              The people who price the work, plan it around your site, supervise the crews and pick
              up the phone when you call.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="paper">
        <Container width="wide">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            <Eyebrow>The team</Eyebrow>
            <SectionHeading>The people behind the work</SectionHeading>
            <p className="mt-4 text-lg text-ink-soft">
              A family-run business that values quality work, real mateship and doing the right
              thing. Free site assessments are carried out by {assessorNames}.
            </p>
          </div>

          {team.length > 0 ? (
            <TeamGrid members={team} />
          ) : (
            <div className="mx-auto max-w-2xl">
              <Placeholder note="team names, titles and portraits — content/team.ts, then npm run team:build." />
            </div>
          )}
        </Container>
      </Section>

      <Section tone="sunken">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Join the team</Eyebrow>
            <SectionHeading>Great people. Real opportunities. Solid futures.</SectionHeading>
            <p className="mt-4 text-ink-soft">
              You will be part of a trusted, family-run team that values quality work, real mateship
              and doing the right thing. We support career growth, reward hard work and back each
              other every step of the way.
            </p>
            {/* Email, not the enquiry form: the form books site assessments
                and feeds the office's lead inbox, and a job application in
                that queue is a lead that is not one. */}
            <ButtonLink
              href={`mailto:${settings.email}?subject=${encodeURIComponent('Joining the team')}`}
              variant="outline"
              className="mt-8"
            >
              Email us about joining
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <CtaBand
        heading="Meet us on site"
        body={`Book a free site assessment and ${assessorNames} will walk the building with you before anything is priced.`}
        cta={{ label: 'Get a free site assessment', href: '/contact-us/' }}
        phone={settings.phone}
      />
    </>
  );
}
