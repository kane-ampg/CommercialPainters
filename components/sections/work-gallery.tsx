import { PhotoCarousel } from '@/components/media/photo-carousel';
import { ButtonLink, Container, microLabel, Section } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { WorkGallery } from '@/content/galleries';
import type { MediaRef } from '@/lib/content/types';

/* ------------------------------------------------------------------ */
/* One site                                                            */
/* ------------------------------------------------------------------ */

/**
 * One site's photography, headed by what the site is.
 *
 * Set as an editorial spread rather than a titled box: the site name in the
 * display face on the left, the sentence describing what the photographs show
 * on the right, and a printer's rule tying the two to the strip beneath them.
 * It is the same 2:3 split the figure captions and the schedule lists use, so
 * a page that stacks seven of these still reads as one grid rather than seven
 * separate widgets.
 *
 * `ink` is the default ground for the same reason the media band defaults to
 * it: interior trade photography is overwhelmingly high-key — white walls,
 * white ceilings, white shirts — and on a pale ground a strip of it has no
 * edge and reads as a smear. The dark surround supplies the contrast the
 * photographs do not have.
 */
export function WorkGalleryBlock({
  gallery,
  headingLevel: Heading = 'h3',
  tone = 'ink',
  priority = false,
  className,
}: {
  gallery: WorkGallery;
  /** `h2` when the block is the section's own subject rather than one of many. */
  headingLevel?: 'h2' | 'h3';
  tone?: 'paper' | 'ink';
  priority?: boolean;
  className?: string;
}) {
  const onInk = tone === 'ink';

  return (
    <div className={className}>
      <div className="mb-6 grid gap-x-10 gap-y-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-baseline">
        <div>
          <p className={cn(microLabel, 'mb-2', onInk ? 'text-white/55' : 'text-ink-muted')}>
            {gallery.buildingType}
            {gallery.suburb && <span> · {gallery.suburb}</span>}
          </p>
          <Heading
            className={cn(
              'text-balance font-display text-2xl leading-tight sm:text-3xl',
              onInk ? 'text-white' : 'text-ink',
            )}
          >
            {gallery.label}
          </Heading>
        </div>

        <p className={cn('text-pretty leading-relaxed', onInk ? 'text-white/70' : 'text-ink-soft')}>
          {gallery.caption}
        </p>
      </div>

      {/*
       * A printer's rule, not a divider — the same mark the media band puts
       * over its caption and the hero fold puts before its label: the house
       * accent at the smallest size it is used at.
       */}
      <span aria-hidden="true" className="mb-5 flex h-px w-full">
        <span className={cn('h-px w-10', onInk ? 'bg-brand-500' : 'bg-brand-600')} />
        <span className={cn('h-px flex-1', onInk ? 'bg-white/15' : 'bg-paper-edge')} />
      </span>

      <PhotoCarousel
        images={gallery.images}
        label={gallery.label}
        tone={tone}
        priority={priority}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Every site                                                          */
/* ------------------------------------------------------------------ */

/**
 * The full set of galleries, stacked.
 *
 * One `<Section>` around all of them rather than one each: seven ink slabs in
 * a row would put six seams down the page that mean nothing, and the scroll
 * reveal would fire seven times. The separation between sites is the rule and
 * the heading, which is enough.
 */
export function WorkGalleries({
  galleries,
  tone = 'ink',
}: {
  galleries: readonly WorkGallery[];
  tone?: 'paper' | 'ink';
}) {
  if (galleries.length === 0) return null;

  return (
    <Section tone={tone === 'ink' ? 'ink' : 'paper'}>
      <Container width="wide">
        <div className="flex flex-col gap-16 sm:gap-20">
          {galleries.map((gallery) => (
            <WorkGalleryBlock key={gallery.slug} gallery={gallery} tone={tone} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* One frame from each site                                            */
/* ------------------------------------------------------------------ */

/**
 * A strip that stands for all seven sites rather than any one of them.
 *
 * For the homepage, which already carries a case-study grid and does not need
 * a second list of the same shape underneath it. This is the other thing the
 * photography can do: show the work, at a glance, on a slab dark enough to
 * hold it — one lead frame per site, in gallery order, and a link through to
 * where the rest of them live.
 *
 * Deliberately not labelled per frame. A caption under each would turn it back
 * into the list this exists to avoid; the alt text carries the description,
 * and the sites are named in full on the page it links to.
 */
export function RecentWorkStrip({
  images,
  heading,
  body,
  action,
}: {
  images: readonly MediaRef[];
  heading: string;
  body?: string;
  action?: { label: string; href: string };
}) {
  if (images.length === 0) return null;

  return (
    <Section tone="brand">
      <Container width="wide">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <h2 className="text-balance font-display text-3xl leading-tight text-white sm:text-4xl">
              {heading}
            </h2>
            {body && <p className="mt-3 max-w-prose text-white/70">{body}</p>}
          </div>
          {action && (
            <ButtonLink href={action.href} variant="ghostLight">
              {action.label}
            </ButtonLink>
          )}
        </div>

        <PhotoCarousel images={images} label={heading} tone="ink" />
      </Container>
    </Section>
  );
}
