// @vitest-environment node
// Matches tests/unit/site-url.test.ts: the value is read at module load, so
// each case sets the environment and re-imports.
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The Search Console ownership token ships only when one is configured.
 *
 * The failure this guards against is quiet in both directions: an empty
 * `<meta name="google-site-verification" content="">` looks fine in a diff
 * and fails verification, and a token pasted as the whole `<meta>` element —
 * which is exactly what Google's UI hands you — renders a tag whose content
 * is markup. Neither shows up until someone is staring at Search Console
 * wondering why the property will not verify.
 */
async function resolve(value: string | undefined) {
  vi.resetModules();
  const previous = { ...process.env };
  delete process.env.GOOGLE_SITE_VERIFICATION;
  if (value !== undefined) process.env.GOOGLE_SITE_VERIFICATION = value;

  try {
    return (await import('@/lib/site')).googleSiteVerification;
  } finally {
    process.env = previous;
  }
}

afterEach(() => {
  vi.resetModules();
});

describe('googleSiteVerification', () => {
  it('is null when unset, so no tag ships by default', async () => {
    await expect(resolve(undefined)).resolves.toBeNull();
  });

  it('treats an empty or whitespace value as absent, never as a token', async () => {
    await expect(resolve('')).resolves.toBeNull();
    await expect(resolve('   ')).resolves.toBeNull();
  });

  it('trims a pasted token', async () => {
    await expect(resolve('  abc123token  ')).resolves.toBe('abc123token');
  });

  it('carries a real token through unchanged', async () => {
    await expect(resolve('K2j_9xQvL0')).resolves.toBe('K2j_9xQvL0');
  });
});
