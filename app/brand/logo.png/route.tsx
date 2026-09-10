import { ImageResponse } from 'next/og';
import { OG_INK, OG_RED, ogFont } from '@/lib/brand/og-fonts';
import { site } from '@/lib/site';

/**
 * /brand/logo.png — the logo as a file, for structured data.
 *
 * The header and footer set the wordmark in live type
 * (components/layout/wordmark.tsx), so there is no logo image in the repo for
 * `Organization.logo` to point at, and Google needs one it can fetch. This
 * renders the same lockup as a 512px square at build time — `force-static`,
 * like /llms.txt — so the entity Google resolves and the mark a visitor sees
 * are the same one, and renaming the business in lib/site.ts re-draws it.
 *
 * Square, because Google's guidance for the logo property wants a mark that
 * reads on a square or a landscape canvas, and the stacked lockup is the
 * square form of the wordmark.
 */
export const dynamic = 'force-static';

const SIZE = 512;

export async function GET(): Promise<Response> {
  const oswald = await ogFont('oswald-500.ttf');
  const [first, second] = site.name.split(' ') as [string, string];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: OG_INK,
        fontFamily: 'Oswald',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          borderLeft: `14px solid ${OG_RED}`,
          paddingLeft: 34,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              color: '#FFFFFF',
              fontSize: 84,
              letterSpacing: '0.03em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {first}
          </div>
          <div
            style={{
              marginTop: 18,
              color: OG_RED,
              fontSize: 44,
              letterSpacing: '0.22em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {second}
          </div>
        </div>
      </div>
    </div>,
    {
      width: SIZE,
      height: SIZE,
      fonts: [{ name: 'Oswald', data: oswald, weight: 500, style: 'normal' }],
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  );
}
