import { expect, test } from '@playwright/test';
import { posts } from '../../content/posts';

/**
 * The blog is advertised only while it has something to show.
 *
 * These assertions are written against `posts.length` rather than against the
 * empty state, so the file does not have to be rewritten the day the first
 * post lands — it starts asserting the other branch on its own.
 */

const hasPosts = posts.length > 0;

test.describe('empty blog', () => {
  test.skip(hasPosts, 'posts exist — the published-blog assertions cover this');

  test('is linked from neither the header nor the footer', async ({ page, isMobile }) => {
    await page.goto('/');

    // Below the lg breakpoint the desktop bar is hidden and nav links live in
    // the drawer, which only exists in the DOM once opened — same pattern as
    // the other nav tests in tests/e2e/wayfinding.spec.ts.
    if (isMobile) {
      await page.getByRole('button', { name: /menu/i }).click();
      const drawer = page.getByRole('dialog', { name: 'Site menu' });
      await expect(drawer.getByRole('link', { name: 'Blog' })).toHaveCount(0);
    } else {
      await expect(page.getByRole('link', { name: 'Blog' })).toHaveCount(0);
    }

    await expect(page.locator('footer a[href="/blog/"]')).toHaveCount(0);
  });

  test('renders noindex while still letting the crawler follow it', async ({ page }) => {
    await page.goto('/blog/');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/);
    await expect(robots).not.toHaveAttribute('content', /nofollow/);
  });

  test('is absent from the sitemap', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toContain('/blog/');
  });
});

test.describe('published blog', () => {
  test.skip(!hasPosts, 'no posts yet — the empty-blog assertions cover this');

  test('renders, is linked from the nav and is indexable', async ({ page, isMobile }) => {
    await page.goto('/');
    if (isMobile) {
      await page.getByRole('button', { name: /menu/i }).click();
      await page
        .getByRole('dialog', { name: 'Site menu' })
        .getByRole('link', { name: 'Blog' })
        .click();
    } else {
      await page.getByRole('link', { name: 'Blog' }).first().click();
    }
    await expect(page).toHaveURL(/\/blog\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Notes from the job');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
  });

  test('sitemap lists the blog index', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain('/blog/');
  });
});
