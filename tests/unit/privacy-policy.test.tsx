import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';
import { Footer } from '@/components/layout/footer';
import { defaultSiteSettings, siteUrl } from '@/lib/site';

/**
 * The privacy policy.
 *
 * Google and Meta both refuse ad accounts without one, and the Privacy Act
 * sets what it has to say. What is guarded here is that the page says those
 * things, that it is reachable from every page and from the sitemap, and that
 * its cookie wording follows the switch that actually loads the tag: a policy
 * that says "no tracking" on a build running GTM is worse than none.
 */

// The footer's nav columns mark the current page, which needs a router.
vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

/**
 * `gtmId` resolves once at module load, so each case stubs the environment
 * and re-imports the page that reads it.
 */
async function renderPolicy(gtm: string) {
  vi.resetModules();
  vi.stubEnv('GTM_ID', gtm);

  const { default: PrivacyPolicyPage } = await import('@/app/(site)/privacy-policy/page');
  return render(await PrivacyPolicyPage());
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('the privacy policy page', () => {
  it('covers each matter Australian Privacy Principle 1.4 requires', async () => {
    await renderPolicy('');

    for (const heading of [
      'What we collect',
      'How we collect it',
      'How we use it',
      'Who we share it with',
      'Information stored overseas',
      'Seeing and correcting your information',
      'Complaints',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    }

    // APP 1.4(g): the countries, where it is practicable to name them.
    expect(document.body.textContent).toMatch(/United States/);
    expect(document.body.textContent).toMatch(/Germany/);

    // APP 1.4(e): where a complaint goes if ours does not resolve it.
    expect(screen.getByRole('link', { name: 'oaic.gov.au' })).toHaveAttribute(
      'href',
      'https://www.oaic.gov.au/',
    );
  });

  it('gives the business contact details for requests and complaints', async () => {
    await renderPolicy('');

    const contact = document.getElementById('contact')!;
    expect(contact.textContent).toContain(defaultSiteSettings.email);
    expect(contact.textContent).toContain(defaultSiteSettings.phone);
    expect(contact.textContent).toContain(defaultSiteSettings.address.street);
  });

  it('says there is no tracking only when no GTM container is configured', async () => {
    await renderPolicy('');

    const cookies = document.getElementById('cookies')!;
    expect(cookies.textContent).toMatch(/does not set cookies/);
    expect(cookies.textContent).not.toMatch(/Google Analytics/);
  });

  it('names the analytics once a GTM container is configured', async () => {
    await renderPolicy('GTM-ABC1234');

    const cookies = document.getElementById('cookies')!;
    expect(cookies.textContent).toMatch(/Google Analytics/);
    expect(cookies.textContent).not.toMatch(/does not set cookies/);
    expect(document.getElementById('overseas')!.textContent).toMatch(/website analytics/);
  });
});

describe('reaching the privacy policy', () => {
  it('is linked from the footer on every page', () => {
    render(<Footer settings={defaultSiteSettings} />);
    // next/link adds the trailing slash from next.config's `trailingSlash`,
    // which only exists inside Next's runtime, so either form passes here.
    expect(screen.getByRole('link', { name: 'Privacy policy' }).getAttribute('href')).toMatch(
      /^\/privacy-policy\/?$/,
    );
  });

  it('is in the sitemap', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain(`${siteUrl}/privacy-policy/`);
  });
});
