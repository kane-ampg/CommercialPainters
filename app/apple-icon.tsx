import { ImageResponse } from 'next/og';
import { OG_INK, OG_RED, monogram, ogFont } from '@/lib/brand/og-fonts';
import { site } from '@/lib/site';

/**
 * The home-screen icon. Same mark as app/icon.tsx at the size iOS asks for;
 * the rule thickens in proportion so it reads as the same rule rather than a
 * hairline.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
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
          fontSize: 100,
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        {monogram(site.name)}
      </div>
      <div style={{ height: 16, backgroundColor: OG_RED }} />
    </div>,
    {
      ...size,
      fonts: [{ name: 'Oswald', data: oswald, weight: 500, style: 'normal' }],
    },
  );
}
