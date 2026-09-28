import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PostArticle } from '@/components/pages/post-article';
import { services } from '@/content/services';
import { defaultSiteSettings } from '@/lib/site';
import type { Post } from '@/lib/content/types';

/**
 * A post page is the end of a search visit, so it has to hand the reader on:
 * a trail back to /blog/, links into the service pages, and the same closing
 * call-to-action a project case study carries. The first version rendered the
 * article and stopped.
 *
 * Rendered against a fixture rather than content/posts.ts, which is empty
 * until the first post is written.
 */

function post(overrides: Partial<Post> = {}): Post {
  return {
    slug: 'sequencing-an-occupied-office',
    title: 'Sequencing a repaint in an occupied office',
    excerpt: 'How zones are handed back without stopping the floor.',
    body: '## Zones\n\nOne floor at a time.',
    publishedAt: '2026-09-01',
    author: 'Commercial Painters',
    tags: ['office'],
    relatedServiceSlugs: [],
    metaTitle: 'Sequencing an occupied office repaint | Commercial Painters',
    metaDescription: 'How zones are handed back without stopping the floor.',
    ...overrides,
  };
}

const bySlug = (slug: string) => services.find((s) => s.slug === slug)!;

/**
 * next/link drops a trailing slash when next.config's `trailingSlash: true`
 * is not loaded, which it is not under Vitest; the built site keeps it. The
 * expectations are written as the site's real paths and compared bare.
 */
const bare = (path: string) => path.replace(/(.)\/(?=$|#)/, '$1');
const hrefOf = (element: HTMLElement) => bare(element.getAttribute('href') ?? '');

describe('PostArticle', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders a breadcrumb trail back through the blog index', () => {
    render(<PostArticle post={post()} settings={defaultSiteSettings} />);
    const trail = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(hrefOf(within(trail).getByRole('link', { name: 'Home' }))).toBe(bare('/'));
    expect(hrefOf(within(trail).getByRole('link', { name: 'Blog' }))).toBe(bare('/blog/'));
    expect(within(trail).getByText(post().title)).toHaveAttribute('aria-current', 'page');
  });

  it('closes with the site-assessment call-to-action and the phone number', () => {
    render(<PostArticle post={post()} settings={defaultSiteSettings} />);
    expect(hrefOf(screen.getByRole('link', { name: 'Get a free site assessment' }))).toBe(
      bare('/contact-us/#assessment'),
    );
    expect(screen.getByRole('link', { name: defaultSiteSettings.phone })).toBeInTheDocument();
  });

  it('links each related service to its real page, once per page', () => {
    render(
      <PostArticle
        post={post()}
        // Interior and exterior both live on /commercial/ — one chip, not two.
        relatedServices={[
          bySlug('office-painting'),
          bySlug('interior-painting'),
          bySlug('exterior-painting'),
        ]}
        settings={defaultSiteSettings}
      />,
    );
    const related = screen.getByRole('heading', { name: 'Related services' }).parentElement!;
    const hrefs = within(related).getAllByRole('link').map(hrefOf);
    expect(hrefs).toEqual(['/office-painters/', '/commercial/'].map(bare));
  });

  it('links other posts, and leaves the sidebar out when there is nothing to link', () => {
    const other = post({ slug: 'choosing-a-coating-system', title: 'Choosing a coating system' });
    const { unmount } = render(
      <PostArticle post={post()} morePosts={[other]} settings={defaultSiteSettings} />,
    );
    expect(hrefOf(screen.getByRole('link', { name: other.title }))).toBe(
      bare('/blog/choosing-a-coating-system/'),
    );
    unmount();

    render(<PostArticle post={post()} settings={defaultSiteSettings} />);
    expect(screen.queryByRole('heading', { name: 'Related services' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'More notes' })).not.toBeInTheDocument();
  });

  /**
   * A date-only string is midnight UTC. Formatted in the machine's own zone it
   * printed the day before anywhere west of Greenwich — the dev machine this
   * was caught on runs America/New_York. The zone is pinned here so the test
   * still bites on a UTC build machine, where the bug would not show.
   */
  it('prints the calendar date that was written, whatever the server zone', () => {
    vi.stubEnv('TZ', 'America/New_York');
    render(
      <PostArticle post={post({ publishedAt: '2026-09-01' })} settings={defaultSiteSettings} />,
    );
    expect(screen.getByText('1 September 2026')).toHaveAttribute('dateTime', '2026-09-01');
  });

  it('renders FAQs as an accordion and as FAQPage JSON-LD from the same array', () => {
    const faqs = [{ question: 'Can the showroom stay open?', answer: 'Usually, yes.' }];
    const { container } = render(
      <PostArticle post={post({ faqs })} settings={defaultSiteSettings} />,
    );
    expect(screen.getByRole('heading', { name: 'Common questions' })).toBeInTheDocument();
    expect(screen.getByText('Can the showroom stay open?')).toBeInTheDocument();

    const blocks = [...container.querySelectorAll('script[type="application/ld+json"]')].map((el) =>
      JSON.parse(el.textContent ?? '{}'),
    );
    const faqPage = blocks.find((block) => block['@type'] === 'FAQPage');
    expect(faqPage?.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: 'Can the showroom stay open?',
        acceptedAnswer: { '@type': 'Answer', text: 'Usually, yes.' },
      },
    ]);
  });

  it('leaves the FAQ section and its JSON-LD out when a post has none', () => {
    const { container } = render(<PostArticle post={post()} settings={defaultSiteSettings} />);
    expect(screen.queryByRole('heading', { name: 'Common questions' })).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('FAQPage');
  });

  it('renders a gallery photograph from the Markdown with its caption, and drops anything else', () => {
    const gallerySrc = '/images/gallery/toyota-croydon/toyota-croydon-02.webp';
    const body = [
      `![Cutting in a wall](${gallerySrc} "Cutting in at the base of a wall.")`,
      '![A master](/images/Blogs/master.jpg)',
    ].join('\n\n');
    render(<PostArticle post={post({ body })} settings={defaultSiteSettings} />);

    expect(screen.getByRole('img', { name: 'Cutting in a wall' })).toBeInTheDocument();
    expect(screen.getByText('Cutting in at the base of a wall.')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'A master' })).not.toBeInTheDocument();
  });

  it('renders the Markdown body as markup', () => {
    render(<PostArticle post={post()} settings={defaultSiteSettings} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Zones' })).toBeInTheDocument();
  });
});
