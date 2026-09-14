import { GoogleTagManager } from '@next/third-parties/google';
import { gtmId } from '@/lib/site';

/**
 * Analytics, as a single opt-in.
 *
 * One Google Tag Manager container and nothing else. Every further tag — GA4,
 * call tracking, Ads conversions — is added inside GTM's own UI rather than
 * here, so measurement changes never need a code change or a deploy.
 *
 * No container configured means this renders nothing at all: no script, no
 * requests, no cookies. That is the normal state in development, where
 * `.env.example` asks that local traffic never be counted, and on any
 * deployment that has not opted in.
 */
export function Analytics() {
  if (!gtmId) return null;

  return <GoogleTagManager gtmId={gtmId} />;
}
