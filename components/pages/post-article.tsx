import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { ContentImage } from '@/components/media/content-image';
import { JsonLd } from '@/components/seo/json-ld';
import { CtaBand, FaqList, RelatedLinks } from '@/components/sections';
import { Container, Section, SectionHeading } from '@/components/ui';
import { galleries } from '@/content/galleries';
import { serviceLinks } from '@/content/services';
import { faqSchema } from '@/lib/schema';
import type { MediaRef, Post, Service, SiteSettings } from '@/lib/content/types';

/**
 * "1 September 2026" from a date-only ISO string.
 *
 * `new Date('2026-09-01')` is midnight UTC, so formatting it in the server's
 * own zone printed 31 August on any machine west of Greenwich. Formatting in
 * UTC gives back exactly the calendar date that was written, wherever the
 * page is built. Shared with the /blog/ index so the two cannot disagree.
 */
export function formatPostDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Every gallery photograph, by its published path.
 *
 * A post can only embed these. They are already encoded for the web, measured
 * and alt-texted (content/galleries.ts), so an inline image costs no layout
 * shift and carries a description checked against the frame. A Markdown image
 * pointing anywhere else — a photographer's 38 MB master under public/, a
 * typo — renders nothing, and tests/unit/page-metadata.test.ts fails on it.
 */
const galleryImages: ReadonlyMap<string, MediaRef> = new Map(
  galleries.flatMap((gallery) => gallery.images).map((image) => [image.src, image]),
);

/**
 * `![alt](/images/gallery/… "Caption")`. The caption is the Markdown title,
 * shown under the photograph. Spans rather than figure/figcaption because
 * react-markdown puts an image inside a paragraph, and a figure there is
 * invalid HTML.
 */
const markdownComponents: Components = {
  img({ src, alt, title }) {
    const image = typeof src === 'string' ? galleryImages.get(src) : undefined;
    if (!image) return null;
    const portrait = (image.height ?? 0) > (image.width ?? 0);
    return (
      <span className={portrait ? 'not-prose mx-auto my-8 block max-w-sm' : 'not-prose my-8 block'}>
        <ContentImage
          image={{ ...image, alt: alt || image.alt }}
          sizes={portrait ? '24rem' : '(min-width: 768px) 42rem, 100vw'}
          className="h-auto w-full rounded"
        />
        {title && <span className="mt-2 block text-sm text-ink-soft">{title}</span>}
      </span>
    );
  },
};

type Props = {
  post: Post;
  /**
   * Resolved from `post.relatedServiceSlugs` by the caller — the source lookup
   * is async, so this component stays a plain sync render.
   */
  relatedServices?: readonly Service[];
  /** Other posts to link from the sidebar, newest first. Never includes `post`. */
  morePosts?: readonly Post[];
  /** Business details, for the closing call-to-action's phone number. */
  settings: SiteSettings;
};

/**
 * Markdown is rendered without raw HTML (react-markdown's default), so a
 * pasted script tag is text, not code. GFM gives tables and lists.
 *
 * The frame around the body matches a project case study: a breadcrumb trail
 * back to /blog/, a sidebar into the service pages, and the same closing
 * call-to-action. Without them a reader who finished a post had nowhere to go
 * but the back button — on a site whose posts exist to bring in enquiries.
 */
export function PostArticle({ post, relatedServices = [], morePosts = [], settings }: Props) {
  const published = formatPostDate(post.publishedAt);
  return (
    <>
      <article>
        <Section tone="sunken" className="py-10">
          <Container>
            <Breadcrumbs
              crumbs={[
                { name: 'Blog', path: '/blog/' },
                { name: post.title, path: `/blog/${post.slug}/` },
              ]}
            />
            <p className="mb-3 text-xs font-semibold uppercase tracking-label text-brand-600">
              <time dateTime={post.publishedAt}>{published}</time>
            </p>
            <h1 className="max-w-4xl font-display text-4xl leading-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 max-w-prose text-lg text-ink-soft">{post.excerpt}</p>
          </Container>
        </Section>
        {post.cover && (
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-sunken sm:aspect-[21/9]">
            <ContentImage image={post.cover} fill priority sizes="100vw" className="object-cover" />
          </div>
        )}
        <Section tone="paper">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1fr_17rem]">
              <div className="prose prose-lg max-w-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {post.body}
                </ReactMarkdown>
              </div>
              <aside className="flex flex-col gap-8">
                <RelatedLinks heading="Related services" links={serviceLinks(relatedServices)} />
                <RelatedLinks
                  heading="More notes"
                  links={morePosts.map((other) => ({
                    label: other.title,
                    href: `/blog/${other.slug}/`,
                  }))}
                />
              </aside>
            </div>
          </Container>
        </Section>
        {post.faqs && post.faqs.length > 0 && (
          <Section tone="sunken">
            <Container>
              <JsonLd data={faqSchema(post.faqs)} />
              <SectionHeading className="mb-6">Common questions</SectionHeading>
              <div className="max-w-prose">
                <FaqList items={post.faqs} />
              </div>
            </Container>
          </Section>
        )}
      </article>

      <CtaBand
        heading="Planning work like this?"
        body="Tell us what needs painting and when we are allowed on site."
        cta={{ label: 'Get a free site assessment', href: '/contact-us/#assessment' }}
        phone={settings.phone}
      />
    </>
  );
}
