'use client';

import { CarouselControls } from '@/components/media/carousel-controls';
import { carouselTrack, useCarousel } from '@/components/media/use-carousel';
import { GoogleMark, Stars } from '@/components/sections/review-parts';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/content/types';

/** How long a review holds the frame before the track moves on. */
const INTERVAL = 5000;

/**
 * The Google reviews, as a carousel.
 *
 * The mechanism — a real scroll container with snapping, stops measured off
 * the laid-out cards, autoplay that yields to hover, focus, visibility and a
 * pause control — is `useCarousel`, which the photo galleries share. What is
 * left here is the part that is about reviews: three cards at `lg`, two at
 * `sm`, one below that, and a card built as figure/blockquote/figcaption.
 *
 * Three visible at `lg` is expressed in the class list alone and nowhere in
 * JavaScript, which is why the last two dots do not exist on desktop: the
 * offsets they would scroll to clamp to the same final position and collapse
 * into one stop.
 */
export function GoogleReviewCarousel({ reviews }: { reviews: readonly Review[] }) {
  const {
    trackRef,
    stops,
    active,
    goTo,
    reduced,
    running,
    stoppedByUser,
    toggleStopped,
    pauseHandlers,
  } = useCarousel({ itemCount: reviews.length, autoplayMs: INTERVAL });

  if (reviews.length === 0) return null;

  return (
    <div
      // See the note in PhotoCarousel: aria-roledescription needs a role to
      // attach to. This carousel has been missing one since it was written.
      role="group"
      aria-roledescription="carousel"
      aria-label="Reviews from our Google Business Profile"
      {...pauseHandlers}
    >
      <ul
        ref={trackRef as React.RefObject<HTMLUListElement>}
        // A scrollable region is only operable from the keyboard if it can be
        // focused, and a focusable region needs a name.
        tabIndex={0}
        aria-label="Google reviews"
        // Off while it moves on its own: a reader being told about a card it
        // did not ask for, every five seconds, is noise. Paused — which is what
        // hovering or focusing does — every move is deliberate and worth
        // announcing.
        aria-live={running ? 'off' : 'polite'}
        className={cn(carouselTrack, 'gap-5 py-1')}
      >
        {reviews.map((review, index) => (
          <li
            key={review.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`Review ${index + 1} of ${reviews.length}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            {/* figure/blockquote/figcaption is the house pattern for an
                attributed quotation — see TestimonialBlock. A <footer> here
                would scope to the section, not the card, and put seven of them
                on the page. */}
            <Card className="gap-3">
              <figure className="flex h-full flex-col gap-3">
                <Stars rating={review.rating} />
                <blockquote className="text-sm leading-relaxed text-ink-soft">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
                {/* Every card is as tall as the longest quote, because they sit
                    in one flex row. `mt-auto` spends that difference below the
                    quote rather than above the attribution, so the rule lands
                    on the card's own bottom edge in all of them. */}
                <figcaption className="mt-auto flex items-center gap-2 border-t border-paper-edge pt-3 text-xs text-ink-muted">
                  <GoogleMark className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    <span className="font-semibold text-ink">{review.attribution}</span>
                    {review.organisation && <span> · {review.organisation}</span>}
                    <span className="block">on {review.source}</span>
                  </span>
                </figcaption>
              </figure>
            </Card>
          </li>
        ))}
      </ul>

      <CarouselControls
        stopCount={stops.length}
        active={active}
        goTo={goTo}
        reduced={reduced}
        stoppedByUser={stoppedByUser}
        toggleStopped={toggleStopped}
        noun="review"
      />
    </div>
  );
}
