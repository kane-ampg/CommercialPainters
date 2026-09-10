import { cn } from '@/lib/utils';
import { site } from '@/lib/site';

/**
 * The wordmark.
 *
 * Typeset, not an image: the brand is two words, and setting them in the
 * site's own display face means the mark is always the same weight, colour
 * and sharpness as the headings beside it, and it costs nothing to load. It is
 * the OG card's lockup (app/(site)/opengraph-image.tsx) at header size — the
 * first word carries the weight, the second sits under it in the brand red,
 * tracked out — so the page and the card that represents it agree.
 *
 * The red rule on the left is the cut line the whole design system is built
 * on: the footer's top rule, the hero seam, the process rail. Here it is the
 * mark's one piece of geometry.
 *
 * Two tones. `ink` for the header's white ground; `white` for the footer's
 * black one. Nothing else may set the colours — a third version of the mark
 * is how a wordmark stops being one.
 *
 * Square corners and uppercase are the system's, not a departure from it:
 * Oswald is a condensed face with tight sidebearings of its own, so the
 * first word carries only a hair of tracking while the second, smaller line
 * takes the site-wide `tracking-label`.
 */
export function Wordmark({
  tone = 'ink',
  className,
}: {
  tone?: 'ink' | 'white';
  className?: string;
}) {
  const [first, second] = site.name.split(' ') as [string, string];

  return (
    <span
      className={cn(
        'flex items-stretch gap-3 border-l-4 border-brand-600 pl-3 font-display leading-none',
        tone === 'ink' ? 'text-ink' : 'text-white',
        className,
      )}
    >
      <span className="flex flex-col justify-center">
        <span className="text-[1.375rem] font-semibold uppercase tracking-[0.04em] sm:text-2xl">
          {first}
        </span>
        <span className="mt-1 text-[0.6875rem] font-medium uppercase tracking-label text-brand-600 sm:text-xs">
          {second}
        </span>
      </span>
    </span>
  );
}
