import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Analytics is opt-in, and the opt-in is the presence of a container id.
 *
 * The GTM component itself is stubbed. Real `GoogleTagManager` renders through
 * `next/script`, which injects nothing outside Next's runtime, so asserting on
 * its output here would test Next rather than this component. What belongs to
 * this component is the decision — render the container or render nothing —
 * and which id it hands over, so the stub records exactly that.
 */
vi.mock('@next/third-parties/google', () => ({
  GoogleTagManager: ({ gtmId }: { gtmId: string }) => <div data-testid="gtm" data-id={gtmId} />,
}));

/**
 * `gtmId` resolves once at module load, so each case stubs the environment and
 * re-imports both the module and the component that reads it.
 */
async function renderAnalytics(id: string) {
  vi.resetModules();
  vi.stubEnv('GTM_ID', id);

  const { Analytics } = await import('@/components/analytics/analytics');
  return render(<Analytics />);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('Analytics', () => {
  // The default state locally and on any deployment that has not opted in.
  // Rendering nothing at all is what keeps development traffic uncounted.
  it('renders nothing when no container is configured', async () => {
    const { queryByTestId } = await renderAnalytics('');
    expect(queryByTestId('gtm')).toBeNull();
  });

  it('renders the container when one is configured', async () => {
    const { getByTestId } = await renderAnalytics('GTM-ABC1234');
    expect(getByTestId('gtm').getAttribute('data-id')).toBe('GTM-ABC1234');
  });
});
