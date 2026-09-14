// @vitest-environment node
// Mirrors site-url.test.ts: this covers module-load behavior driven by the
// environment, so each case has to set the environment and re-import.
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * `gtmId` is resolved once at module load, so each case sets the environment
 * first and then re-imports the module.
 */
async function resolve(env: Record<string, string | undefined>) {
  vi.resetModules();
  const previous = { ...process.env };

  delete process.env.GTM_ID;
  Object.assign(process.env, env);

  try {
    return (await import('@/lib/site')).gtmId;
  } finally {
    process.env = previous;
  }
}

afterEach(() => {
  vi.resetModules();
});

describe('gtmId', () => {
  it('uses the container id when one is set', async () => {
    await expect(resolve({ GTM_ID: 'GTM-ABC1234' })).resolves.toBe('GTM-ABC1234');
  });

  // No container configured is the normal state in development, where the
  // .env.example note asks that local traffic never be counted. Analytics has
  // to be absent rather than broken.
  it('is null when nothing is configured', async () => {
    await expect(resolve({})).resolves.toBeNull();
  });

  // The same shape as the regression that broke the first Vercel build: a
  // declared-but-unset variable arrives as '', not undefined.
  it('treats an empty or whitespace value as absent', async () => {
    await expect(resolve({ GTM_ID: '' })).resolves.toBeNull();
    await expect(resolve({ GTM_ID: '   ' })).resolves.toBeNull();
  });

  it('trims surrounding whitespace from a pasted id', async () => {
    await expect(resolve({ GTM_ID: '  GTM-ABC1234  ' })).resolves.toBe('GTM-ABC1234');
  });
});
