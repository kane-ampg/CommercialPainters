import { ImageResponse } from 'next/og';
import { OG_INK, OG_RED, OG_RED_LIGHT, ogFont } from '@/lib/brand/og-fonts';
import { site } from '@/lib/site';
import { getSiteSettings } from '@/lib/content/source';

/**
 * Default social share card.
 *
 * Generated at build time rather than checked in as a JPEG, so it cannot go
 * missing and stays in step with the brand automatically: rename the business
 * in lib/site.ts and the card follows.
 *
 * Drawn in the brand colours and faces rather than an approximation:
 * Industrial Black #1C1C1C, Primary Red #C8102E, brand-400 #E24356 for the
 * rule; Oswald for the headline and Roboto for everything else. The lockup at
 * the top is the wordmark (components/layout/wordmark.tsx) at card size — the
 * first word carrying the weight, the second under it in red, tracked out.
 */
export const alt = `${site.name} — commercial painters, Melbourne`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const [settings, oswald, roboto] = await Promise.all([
    getSiteSettings(),
    ogFont('oswald-500.ttf'),
    ogFont('roboto-400.ttf'),
  ]);
  const [first, second] = site.name.split(' ') as [string, string];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: OG_INK,
        padding: '72px 80px',
        fontFamily: 'Roboto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          borderLeft: `6px solid ${OG_RED}`,
          paddingLeft: 18,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              fontFamily: 'Oswald',
              fontSize: 44,
              color: '#FFFFFF',
              letterSpacing: '0.03em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {first}
          </div>
          <div
            style={{
              fontFamily: 'Oswald',
              fontSize: 20,
              color: OG_RED,
              letterSpacing: '0.22em',
              marginTop: 8,
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {second}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 96, height: 6, backgroundColor: OG_RED, marginBottom: 32 }} />
        <div
          style={{
            fontFamily: 'Oswald',
            fontSize: 66,
            color: '#FFFFFF',
            lineHeight: 1.08,
            letterSpacing: '0.01em',
            maxWidth: 940,
          }}
        >
          Painters for buildings that cannot stop running
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: 24,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <span>Commercial painting · {settings.serviceAreaPrimary}</span>
        <span style={{ color: OG_RED_LIGHT }}>{settings.phone}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Oswald', data: oswald, weight: 500, style: 'normal' },
        { name: 'Roboto', data: roboto, weight: 400, style: 'normal' },
      ],
    },
  );
}
