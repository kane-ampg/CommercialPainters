import Link from 'next/link';
import { DesktopNav } from '@/components/navigation/desktop-nav';
import { MobileMenu } from '@/components/navigation/mobile-menu';
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
        <div className="flex h-16 items-center justify-between gap-6 sm:h-20">
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

          <DesktopNav />

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={phoneHref(settings.phone)}
              className="rounded-md px-2 py-2 text-sm font-semibold text-brand-700 hover:bg-paper-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 sm:px-3"
            >
              <span className="sr-only">Call </span>
              {settings.phone}
            </a>
            <AssessmentCta className="hidden rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 lg:inline-block">
              Get a free site assessment
            </AssessmentCta>
            <MobileMenu />
          </div>
        </div>
      </Container>
    </header>
  );
}
