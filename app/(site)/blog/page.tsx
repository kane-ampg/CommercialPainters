import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { ContentImage } from '@/components/media/content-image';
import { Container, Section, SectionHeading } from '@/components/ui';
import { getPosts } from '@/lib/content/source';

/**
 * An empty section does not get advertised.
 *
 * `content/posts.ts` has exported `[]` since launch, and this page still
 * shipped `index, follow`, sat in the sitemap at priority 0.6 and held a slot
 * in both the header and the footer — an indexed page with a heading, the
 * words "Nothing published yet." and nothing else, linked sitewide. That is
 * thin content at the top of a section, on a site whose whole purpose is
 * organic traffic.
 *
 * `noindex, follow` rather than `nofollow`, for the same reason a Tier 3
 * suburb is: the crawler should still reach whatever is linked from here.
 *
 * app/sitemap.ts and components/navigation/nav-data.ts compute the same thing
 * from the same `posts.length`, so publishing the first post restores the
 * directive, the sitemap entry and both nav slots at once. Async because the
 * count comes through `getPosts()`, the same source the body renders from —
 * reading the content module directly here would let the two drift.
 */
export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPosts();

  return buildMetadata({
    title: 'Notes from the job | Commercial Painters',
    description:
      'Practical notes on commercial painting in Melbourne: sequencing occupied buildings, coating systems, access and compliance.',
    path: '/blog/',
    index: posts.length > 0,
  });
}

export default async function BlogIndexPage() {
  const posts = await getPosts();
  return (
    <>
      <Section tone="sunken" className="py-10">
        <Container>
          <Breadcrumbs crumbs={[{ name: 'Blog', path: '/blog/' }]} />
          <SectionHeading as="h1">Notes from the job</SectionHeading>
        </Container>
      </Section>
      <Section tone="paper">
        <Container>
          {posts.length === 0 ? (
            <p className="text-ink-soft">Nothing published yet.</p>
          ) : (
            <ul className="grid gap-8 md:grid-cols-2">
              {posts.map((post) => (
                <li key={post.slug} className="flex flex-col gap-3">
                  {post.cover && (
                    <Link
                      href={`/blog/${post.slug}/`}
                      className="relative block aspect-[16/9] overflow-hidden rounded bg-paper-sunken"
                    >
                      <ContentImage
                        image={post.cover}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </Link>
                  )}
                  <h2 className="font-display text-2xl">
                    <Link href={`/blog/${post.slug}/`}>{post.title}</Link>
                  </h2>
                  <p className="text-ink-soft">{post.excerpt}</p>
                  <time
                    dateTime={post.publishedAt}
                    className="text-xs uppercase tracking-label text-ink-soft"
                  >
                    {new Date(post.publishedAt).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
