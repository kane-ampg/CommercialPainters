import { ImageResponse } from 'next/og';
import { OG_INK, OG_RED, monogram, ogFont } from '@/lib/brand/og-fonts';
import { site } from '@/lib/site';

/**
 * The favicon, generated at build time.
 *
 * The monogram on the ink ground with the brand's red rule along the bottom
 * edge — the same cut line the footer, the hero seam and the wordmark carry.
 * Drawn here rather than checked in as a PNG so it is in step with the brand
 * by construction: rename the business in lib/site.ts and the initials
 * follow.
 *
 * 64px, not 32: browsers scale down cleanly and a 32px Oswald "CP" loses its
 * counters.
 */
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default async function Icon() {
  const oswald = await ogFont('oswald-500.ttf');

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: OG_INK,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontFamily: 'Oswald',
          fontSize: 36,
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        {monogram(site.name)}
      </div>
      <div style={{ height: 6, backgroundColor: OG_RED }} />
    </div>,
    {
      ...size,
      fonts: [{ name: 'Oswald', data: oswald, weight: 500, style: 'normal' }],
    },
  );
}
