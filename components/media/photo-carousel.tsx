'use client';

import { ContentImage } from '@/components/media/content-image';
import { CarouselControls } from '@/components/media/carousel-controls';
import { carouselTrack, useCarousel } from '@/components/media/use-carousel';
import { mediaZoom } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { MediaRef } from '@/lib/content/types';

/**
 * The track's height at each breakpoint, in px.
 *
 * Named here as numbers rather than only as classes because `sizes` is derived
 * from them — see `frameSizes`. The two must not drift: a height changed in
 * the class list alone would leave every image downloading the wrong file.
 */
const TRACK_HEIGHT = { base: 280, sm: 380, lg: 520 } as const;

const TRACK_HEIGHT_CLASS = 'h-[280px] sm:h-[380px] lg:h-[520px]';

/**
 * What this frame will actually be drawn at, given the track height it has to
 * fit and its own proportions.
 *
 * A gallery of mixed orientations has no single width, so a shared `sizes`
 * would be wrong for most of it — too small for the landscapes (a blurred
 * upscale) or too large for the portraits (bytes nobody sees). Each frame
 * carries its own, computed from the ratio the manifest recorded.
 */
function frameSizes(ratio: number): string {
  const at = (height: number) => Math.ceil(height * ratio);
  return (
    `(min-width: 1024px) ${at(TRACK_HEIGHT.lg)}px, ` +
    `(min-width: 640px) ${at(TRACK_HEIGHT.sm)}px, ` +
    `${at(TRACK_HEIGHT.base)}px`
  );
}

/**
 * A set of photographs from one site, as a filmstrip.
 *
 * ## Why the frames are not all the same shape
 *
 * Roughly half of this photography is portrait and half landscape, shot at 3:2
 * either way. The obvious gallery — a uniform 16:9 grid — would centre-crop
 * every portrait frame to a third of itself, and on this subject matter the
 * part it discards is the part that carries the evidence: the tradesperson at
 * the top of the extension pole, the scissor lift under them, the drop sheets
 * at their feet. The same objection the media band already makes to a 21:9
 * crop, only worse.
 *
 * So the track fixes the one dimension a row can share — its height — and lets
 * every frame take whatever width its own ratio asks for. Nothing is cropped,
 * the strip gets a natural rhythm from the alternation, and the portraits stop
 * being the awkward case.
 *
 * ## Movement
 *
 * No autoplay. The reviews carousel advances because a wall of quotations is
 * something you glance at; a gallery is something you go through, and fifteen
 * photographs moving by themselves under a reader is noise rather than
 * pacing. Everything else — swipe, trackpad, arrow keys, the controls — is the
 * shared mechanism in `useCarousel`, which is also what makes this degrade to
 * a plain swipeable row before hydration.
 */
export function PhotoCarousel({
  images,
  label,
  tone = 'paper',
  priority = false,
  className,
}: {
  images: readonly MediaRef[];
  /** Names the carousel for assistive tech, e.g. "Toyota dealership, Croydon". */
  label: string;
  tone?: 'paper' | 'ink';
  /** True only for the one gallery that can be the page's LCP element. */
  priority?: boolean;
  className?: string;
}) {
  const { trackRef, stops, active, goTo, reduced, pauseHandlers } = useCarousel({
    itemCount: images.length,
  });

  if (images.length === 0) return null;

  const onInk = tone === 'ink';

  return (
    <div
      // aria-roledescription is ignored on an element with no role of its own,
      // so without this the carousel announced as a plain group of images.
      // `group` is what the ARIA authoring practices pair it with for a
      // carousel that is not the page's main landmark.
      role="group"
      aria-roledescription="carousel"
      aria-label={`Photographs from ${label}`}
      className={className}
      {...pauseHandlers}
    >
      <ul
        ref={trackRef as React.RefObject<HTMLUListElement>}
        // A scrollable region is only operable from the keyboard if it can be
        // focused, and a focusable region needs a name.
        tabIndex={0}
        aria-label={`${label} — ${images.length} photographs`}
        className={cn(
          carouselTrack,
          TRACK_HEIGHT_CLASS,
          'gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // brand-600 is 2.90:1 on the ink ground — under WCAG 1.4.11's 3:1
          // for a focus indicator. brand-500 clears it, and is the red the
          // ink slabs already rule themselves with.
          onInk
            ? 'focus-visible:ring-brand-500 focus-visible:ring-offset-ink'
            : 'focus-visible:ring-brand-600 focus-visible:ring-offset-white',
        )}
      >
        {images.map((image, index) => {
          // The gallery manifest records both; a frame written by hand does
          // not — `ProjectImage` in the case studies carries only src and alt.
          const measured = Boolean(image.width && image.height);
          const ratio = measured ? image.width! / image.height! : 3 / 2;

          return (
            <li
              key={image.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`Photograph ${index + 1} of ${images.length}`}
              className={cn(
                'group relative h-full shrink-0 snap-start overflow-hidden rounded-lg',
                onInk ? 'bg-ink-raised' : 'bg-paper-sunken',
              )}
              style={{ aspectRatio: String(ratio) }}
            >
              <ContentImage
                image={image}
                fill
                sizes={frameSizes(ratio)}
                priority={priority && index === 0}
                className={cn(
                  // Measured: the box is cut to the photograph's own ratio, so
                  // `cover` crops nothing — it is only insurance against a
                  // rounding difference leaving a hairline of background.
                  //
                  // Unmeasured: the box is a 3:2 GUESS, and `cover` would make
                  // that guess destructive — a 3:4 portrait case-study frame
                  // would silently lose half its height, which is exactly the
                  // crop this component exists to avoid. `contain` letterboxes
                  // against the slide's own ground instead, so an undimensioned
                  // frame is shown whole and merely sits narrower than its
                  // neighbours.
                  measured ? 'object-cover' : 'object-contain',
                  mediaZoom,
                )}
              />
            </li>
          );
        })}
      </ul>

      <CarouselControls
        stopCount={stops.length}
        active={active}
        goTo={goTo}
        reduced={reduced}
        noun="photograph"
        tone={tone}
      />
    </div>
  );
}
