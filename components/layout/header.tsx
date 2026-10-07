import Link from 'next/link';
import { DesktopNav } from '@/components/navigation/desktop-nav';
import { MobileMenu } from '@/components/navigation/mobile-menu';
import { mainNav } from '@/components/navigation/nav-data';
import { AssessmentCta } from '@/components/navigation/assessment-cta';
import { Wordmark } from '@/components/layout/wordmark';
import { Container } from '@/components/ui';
import { phoneHref, site } from '@/lib/site';
import type { SiteSettings } from '@/lib/content/types';

export function Header({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-paper-edge bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <Container width="wide">
        {/* h-16/sm:h-20 plus this header's 1px rule is what `.hero-viewport`
            subtracts to size the homepage fold. Change one, change both. */}
        <div className="flex h-16 items-center justify-between gap-3 sm:h-20 sm:gap-6">
          {/* The wordmark, typeset in the display face rather than shipped as
              an image — see components/layout/wordmark.tsx. The footer sets
              the same mark in white on the ink ground. */}
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            <Wordmark tone="ink" className="h-11 sm:h-14" />
          </Link>

          <DesktopNav items={mainNav} />

          <div className="flex items-center gap-2 sm:gap-3">
            {/*
             * On a phone the number needs 106px on one line and the row leaves
             * it 86px at 390 wide, so it broke into "1300 97 / 97 40" and read
             * as two numbers. Below sm it is a Call button cut like the Menu
             * button beside it (icon only under 375px, where even "Call" does
             * not fit); the number itself is in the fold under it. Screen
             * readers hear "Call" and the number at every width.
             */}
            <a
              href={phoneHref(settings.phone)}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-paper-edge px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-paper-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 sm:border-transparent"
            >
              <span className="sr-only">Call </span>
              <PhoneIcon />
              {/* An arbitrary media variant: `max-*` is unavailable while the
                  screens config holds raw queries (short/tight). */}
              <span aria-hidden="true" className="sm:hidden [@media(max-width:374px)]:hidden">
                Call
              </span>
              <span className="sr-only sm:not-sr-only">{settings.phone}</span>
            </a>
            <AssessmentCta className="hidden rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 lg:inline-block">
              Get a free site assessment
            </AssessmentCta>
            <MobileMenu items={mainNav} />
          </div>
        </div>
      </Container>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5 sm:hidden">
      <path
        d="M5.6 2.75h2.1l1.15 3.6-1.6 1.2a9.4 9.4 0 0 0 5.2 5.2l1.2-1.6 3.6 1.15v2.1a1.85 1.85 0 0 1-1.85 1.85A13.4 13.4 0 0 1 2.75 4.6 1.85 1.85 0 0 1 4.6 2.75h1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
