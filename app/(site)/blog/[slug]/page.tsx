import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { buildMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { PostArticle } from '@/components/pages/post-article';
import { blogPostingSchema } from '@/lib/schema';
import { getPost, getPosts, getService, getSiteSettings } from '@/lib/content/source';

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

// Every post is in content/posts.ts at build time, so anything else is a
// real 404 rather than a render attempt.
export const dynamicParams = false;

/** How many other posts the sidebar links to. */
const MORE_POSTS = 3;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.metaTitle,
    description: post.metaDescription,
    path: `/blog/${post.slug}/`,
    ogImage: post.cover?.src,
    ogImageAlt: post.cover?.alt,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [relatedServices, allPosts, settings] = await Promise.all([
    Promise.all(post.relatedServiceSlugs.map((serviceSlug) => getService(serviceSlug))).then(
      (all) => all.filter((service) => service !== undefined),
    ),
    getPosts(),
    getSiteSettings(),
  ]);

  return (
    <>
      <JsonLd data={blogPostingSchema(post)} />
      <PostArticle
        post={post}
        relatedServices={relatedServices}
        morePosts={allPosts.filter((other) => other.slug !== post.slug).slice(0, MORE_POSTS)}
        settings={settings}
      />
    </>
  );
}
