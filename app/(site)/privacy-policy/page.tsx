import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { Card, Container, Eyebrow, Lede, Prose, Section } from '@/components/ui';
import { formatAddress, gtmId, phoneHref, site } from '@/lib/site';
import { getSiteSettings } from '@/lib/content/source';

export const metadata: Metadata = buildMetadata({
  title: `Privacy Policy | ${site.name}`,
  description:
    'How Commercial Painters collects, uses, shares and protects personal information, and how to access or correct it or make a complaint.',
  path: '/privacy-policy/',
});

/**
 * Change this whenever the policy's substance changes. Typed rather than
 * generated: a date that moved on every deploy would claim changes that never
 * happened.
 */
const LAST_UPDATED = { iso: '2026-10-12', display: '12 October 2026' } as const;

/**
 * Privacy policy.
 *
 * Written against Australian Privacy Principle 1.4, which sets what a policy
 * must say: what is collected and how, why, how to access and correct it, how
 * to complain, and whether it goes overseas and to which countries.
 *
 * Every statement describes what the code and the services behind it actually
 * do. The enquiry pipeline (app/actions/enquiry.ts, lib/enquiry/transport.ts)
 * collects five fields and posts them to the n8n workflow, which emails the
 * group inbox through Gmail. The rate limiter keeps the visitor's IP in
 * memory only. Nothing on the site sets a cookie unless a GTM container is
 * configured. If any of that changes, this page changes with it.
 *
 * The analytics wording keys off `gtmId`, the same value that decides whether
 * the tag loads at all (components/analytics/analytics.tsx), so the policy
 * cannot say "no tracking" on a build that tracks. Turning GTM on still
 * deserves a new LAST_UPDATED date.
 */
export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const analytics = gtmId !== null;
  const entity = settings.abn ? `${site.legalName} (ABN ${settings.abn})` : site.legalName;

  const sections = [
    { id: 'who-we-are', heading: 'Who we are' },
    { id: 'what-we-collect', heading: 'What we collect' },
    { id: 'how-we-collect', heading: 'How we collect it' },
    { id: 'how-we-use', heading: 'How we use it' },
    { id: 'sharing', heading: 'Who we share it with' },
    { id: 'overseas', heading: 'Information stored overseas' },
    { id: 'cookies', heading: 'Cookies and analytics' },
    { id: 'marketing', heading: 'Marketing' },
    { id: 'security', heading: 'Keeping it secure' },
    { id: 'retention', heading: 'How long we keep it' },
    { id: 'access', heading: 'Seeing and correcting your information' },
    { id: 'complaints', heading: 'Complaints' },
    { id: 'other-websites', heading: 'Other websites' },
    { id: 'changes', heading: 'Changes to this policy' },
    { id: 'contact', heading: 'Contact us' },
  ] as const;

  const heading = (id: (typeof sections)[number]['id']) =>
    sections.find((section) => section.id === id)!.heading;

  return (
    <>
      <Section tone="sunken" reveal={false} className="border-b border-paper-edge">
        <Container width="narrow">
          <Eyebrow>Privacy</Eyebrow>
          <h1 className="text-balance font-display text-4xl leading-[1.08] text-ink sm:text-5xl">
            Privacy policy
          </h1>
          <Lede className="mt-5">
            What personal information we collect, why we collect it, who we share it with, and how
            to see or correct what we hold about you.
          </Lede>
          <p className="mt-4 text-sm text-ink-muted">
            Last updated <time dateTime={LAST_UPDATED.iso}>{LAST_UPDATED.display}</time>
          </p>
        </Container>
      </Section>

      <Container width="narrow">
        <Breadcrumbs crumbs={[{ name: 'Privacy policy', path: '/privacy-policy/' }]} />
      </Container>

      <Section tone="paper" reveal={false} className="pt-4 sm:pt-6">
        <Container width="narrow">
          <Card as="div" className="mb-10 gap-3 border-t-4 border-t-brand-600">
            <h2 className="font-display text-xl text-ink">The short version</h2>
            <ul className="list-disc space-y-2 pl-5 text-ink-soft">
              <li>
                We collect what you give us, usually your name, phone number, email address, suburb
                and type of site when you ask for an assessment, and use it to respond to you and to
                do the work.
              </li>
              <li>
                We do not sell personal information.
                {analytics
                  ? ' This website uses analytics cookies, which you can block in your browser.'
                  : ' This website sets no cookies and runs no analytics or advertising tracking.'}
              </li>
              <li>
                Our hosting, form and email providers store data overseas, in the United States and
                Germany.
              </li>
              <li>
                You can ask to see or correct your information, or make a complaint, at any time by
                emailing <EmailLink email={settings.email} /> or calling{' '}
                <PhoneLink phone={settings.phone} />.
              </li>
            </ul>
          </Card>

          <nav aria-label="On this page" className="mb-12">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-label text-ink-muted">
              On this page
            </h2>
            {/* Columns, not a grid: the list reads down then across, in the
                order the sections run. */}
            <ol className="gap-x-8 text-sm sm:columns-2">
              {sections.map((section) => (
                <li key={section.id} className="mb-1.5 break-inside-avoid">
                  <a href={`#${section.id}`} className={linkClass}>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-12">
            <PolicySection id="who-we-are" heading={heading('who-we-are')}>
              <p>
                This policy is issued by {entity}, a commercial painting contractor based at{' '}
                {formatAddress(settings.address)}. We are the commercial painting division of the{' '}
                {site.group} group. In this policy, &ldquo;we&rdquo;, &ldquo;us&rdquo; and
                &ldquo;our&rdquo; mean {site.name}.
              </p>
              <p>
                We handle personal information in line with the Australian Privacy Principles in the{' '}
                <em>Privacy Act 1988</em> (Cth). This policy covers the personal information we
                collect through this website, by phone and email, and while we quote for and carry
                out work.
              </p>
            </PolicySection>

            <PolicySection id="what-we-collect" heading={heading('what-we-collect')}>
              <p>
                Personal information is information that identifies you, or could reasonably
                identify you. What we collect depends on how you deal with us.
              </p>
              <ul className={listClass}>
                <li>
                  <strong>When you ask for a site assessment</strong> through the form on our
                  contact page or the chat on this website: your name, phone number and email
                  address, the suburb or area of the site, and the type of property it is.
                </li>
                <li>
                  <strong>When you call or email us:</strong> your contact details and whatever you
                  choose to tell us about the job.
                </li>
                <li>
                  <strong>When we quote for or carry out work:</strong> contact details for you and
                  for other people at your organisation, such as site contacts and accounts staff;
                  the site address and how to get access; and records of the job, including
                  correspondence, quotes, invoices and photographs of the work.
                </li>
                <li>
                  <strong>When you visit this website:</strong> technical details such as your IP
                  address, browser type and the pages you request. See{' '}
                  <a href="#cookies" className={linkClass}>
                    cookies and analytics
                  </a>
                  .
                </li>
              </ul>
              <p>
                We do not ask for sensitive information, such as health information, through this
                website. Please leave it out of an enquiry.
              </p>
            </PolicySection>

            <PolicySection id="how-we-collect" heading={heading('how-we-collect')}>
              <p>
                Mostly directly from you: when you fill in the form, use the chat, call, email or
                meet us on site. Sometimes someone else gives us your details, for example a
                facilities or property manager who names you as the contact for a site. When that
                happens, we use your details only for the job they were given to us for.
              </p>
              <p>
                You can ask us general questions without telling us who you are. To arrange an
                assessment or a quote, though, we need a name and a way to contact you.
              </p>
            </PolicySection>

            <PolicySection id="how-we-use" heading={heading('how-we-use')}>
              <p>We use personal information to:</p>
              <ul className={listClass}>
                <li>respond to your enquiry and arrange a site assessment;</li>
                <li>
                  prepare quotes, plan and carry out the work, and manage site access, safety and
                  compliance;
                </li>
                <li>send invoices and keep the records the law requires;</li>
                <li>keep in touch about the work, including any warranty matters;</li>
                <li>
                  keep this website working and secure, including blocking spam and repeated
                  automated submissions;
                </li>
                <li>
                  tell you about our services, where the law allows (see{' '}
                  <a href="#marketing" className={linkClass}>
                    marketing
                  </a>
                  ).
                </li>
              </ul>
              <p>
                We use it for these purposes or for related purposes you would reasonably expect, or
                where the law requires or allows it.
              </p>
            </PolicySection>

            <PolicySection id="sharing" heading={heading('sharing')}>
              <ul className={listClass}>
                <li>
                  <strong>The {site.group} group.</strong> Enquiries arrive in a mailbox the group
                  operates, and the client portal linked from this website is run by the group, so
                  staff across the group may handle your information for the purposes in this
                  policy.
                </li>
                <li>
                  <strong>Service providers</strong> who run parts of our business for us: website
                  hosting, the service that delivers form enquiries to our inbox, and email. They
                  may use the information only to provide their service to us.
                </li>
                <li>
                  <strong>Subcontractors and suppliers</strong>, where they need it to carry out
                  part of the work, such as a site contact&rsquo;s details for access.
                </li>
                <li>
                  <strong>Professional advisers and insurers</strong>, such as our accountants,
                  lawyers and insurers, where they need it.
                </li>
                <li>
                  <strong>Others where the law requires or allows it</strong>, such as a government
                  agency or a court, or to lessen a serious threat to someone&rsquo;s safety.
                </li>
              </ul>
              <p>We do not sell or rent personal information.</p>
            </PolicySection>

            <PolicySection id="overseas" heading={heading('overseas')}>
              <p>Some of our service providers store or process information outside Australia:</p>
              <ul className={listClass}>
                <li>website hosting (Vercel), in the United States;</li>
                <li>delivery of form enquiries to our inbox (n8n), in Germany;</li>
                <li>
                  email (Google), in the United States and other countries where Google has data
                  centres;
                </li>
                {analytics && <li>website analytics (Google), in the United States.</li>}
              </ul>
              <p>We share with them only what they need to provide their service to us.</p>
            </PolicySection>

            <PolicySection id="cookies" heading={heading('cookies')}>
              {analytics ? (
                <>
                  <p>
                    We use Google Tag Manager to load Google Analytics, which sets cookies to help
                    us understand how visitors find and use this website. If we advertise with
                    Google or Meta, their tags may also set cookies to measure whether an ad led to
                    an enquiry, and may be used to show you our ads on other websites.
                  </p>
                  <p>
                    You can block or delete cookies in your browser settings, opt out of Google
                    Analytics with{' '}
                    <a
                      href="https://tools.google.com/dlpage/gaoptout"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      Google&rsquo;s opt-out add-on
                    </a>
                    , and manage ad personalisation in your Google and Meta account settings.
                  </p>
                </>
              ) : (
                <p>
                  This website does not set cookies, and it does not use analytics or advertising
                  tracking. Our fonts and images load from our own domain, so opening a page does
                  not send your details to a third-party font or image service. If we add analytics
                  or advertising tools, this section will say so.
                </p>
              )}
              <p>
                Our hosting provider records standard technical details of each visit, such as IP
                address, to deliver the website and protect it from attack. When you submit the
                enquiry form, your IP address is also used to limit repeated submissions. It is held
                only in the server&rsquo;s temporary memory and is not saved with your enquiry.
              </p>
            </PolicySection>

            <PolicySection id="marketing" heading={heading('marketing')}>
              <p>
                If we send you news about our services, every message will tell you how to opt out,
                and we will stop when you ask. You can also opt out at any time by contacting us.
              </p>
            </PolicySection>

            <PolicySection id="security" heading={heading('security')}>
              <p>
                We keep personal information in our email and business systems, where only people
                who need it for their work can see it. The enquiry form sends your details to us
                over an encrypted connection. No system is completely secure, but we take reasonable
                steps to protect personal information from misuse, interference and loss, and from
                unauthorised access, change or disclosure.
              </p>
              <p>
                If a data breach is likely to cause serious harm to anyone, we will tell the people
                affected and, where the law requires, the Office of the Australian Information
                Commissioner (OAIC).
              </p>
            </PolicySection>

            <PolicySection id="retention" heading={heading('retention')}>
              <p>
                We keep personal information only for as long as we need it for the purposes in this
                policy, or for as long as the law requires. Tax records, for example, must be kept
                for five years. When we no longer need information, we delete it or remove anything
                that identifies you.
              </p>
            </PolicySection>

            <PolicySection id="access" heading={heading('access')}>
              <p>
                You can ask to see the personal information we hold about you, and ask us to correct
                anything that is wrong, out of date or incomplete. Contact us using the details
                below. We may need to confirm who you are first.
              </p>
              <p>
                We will respond within 30 days. There is no charge to make a request. If we cannot
                do what you ask, we will tell you why in writing and how you can complain.
              </p>
            </PolicySection>

            <PolicySection id="complaints" heading={heading('complaints')}>
              <p>
                If you think we have mishandled your personal information, please contact us first
                and tell us what happened. We will look into it and reply in writing within 30 days.
              </p>
              <p>
                If you are not satisfied with our reply, you can complain to the Office of the
                Australian Information Commissioner at{' '}
                <a
                  href="https://www.oaic.gov.au/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  oaic.gov.au
                </a>{' '}
                or on 1300 363 992.
              </p>
            </PolicySection>

            <PolicySection id="other-websites" heading={heading('other-websites')}>
              <p>
                This website links to other websites, such as our Facebook page, Google Maps and the
                client portal. They have their own privacy policies, and this policy does not cover
                them.
              </p>
            </PolicySection>

            <PolicySection id="changes" heading={heading('changes')}>
              <p>
                We may update this policy from time to time. The current version is always on this
                page, with the date it last changed at the top.
              </p>
            </PolicySection>

            <PolicySection id="contact" heading={heading('contact')}>
              <p>For privacy questions, requests or complaints, contact us:</p>
              <ul className={listClass}>
                <li>
                  Email: <EmailLink email={settings.email} />
                </li>
                <li>
                  Phone: <PhoneLink phone={settings.phone} />
                </li>
                <li>
                  Post: Privacy, {site.legalName}, {formatAddress(settings.address)}
                </li>
              </ul>
            </PolicySection>
          </div>
        </Container>
      </Section>
    </>
  );
}

const linkClass =
  'font-semibold text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600';

const listClass = 'list-disc space-y-2 pl-5';

function PolicySection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    // The header is sticky; without the scroll margin an in-page link lands
    // the heading underneath it.
    <section id={id} className="scroll-mt-20 sm:scroll-mt-24">
      <h2 className="mb-4 font-display text-2xl leading-tight text-ink">{heading}</h2>
      <Prose>{children}</Prose>
    </section>
  );
}

function EmailLink({ email }: { email: string }) {
  return (
    <a href={`mailto:${email}`} className={linkClass}>
      {email}
    </a>
  );
}

function PhoneLink({ phone }: { phone: string }) {
  return (
    <a href={phoneHref(phone)} className={linkClass}>
      {phone}
    </a>
  );
}
