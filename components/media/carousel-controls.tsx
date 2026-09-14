'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Where a carousel's controls are drawn.
 *
 * Interior trade photography is overwhelmingly high-key, so a gallery of it
 * usually sits on `ink` — and a white-on-white control row would vanish there.
 * The two tones carry the same geometry and differ only in colour.
 */
type Tone = 'paper' | 'ink';

/** A square control, sized for touch, carrying the outline button's weight. */
function Control({
  label,
  onClick,
  tone,
  children,
}: {
  label: string;
  onClick: () => void;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2',
        tone === 'ink'
          ? 'border-white/25 bg-white/[0.06] text-white/80 hover:border-white/60 hover:text-white focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink'
          : 'border-paper-edge bg-white text-ink-soft hover:border-ink hover:text-ink focus-visible:ring-brand-600',
      )}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}

const ChevronLeft = () => (
  <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
    <path d="M8.5 0L10 1.5 5.5 6 10 10.5 8.5 12 2.5 6z" />
  </svg>
);

const ChevronRight = () => (
  <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
    <path d="M3.5 0L2 1.5 6.5 6 2 10.5 3.5 12 9.5 6z" />
  </svg>
);

/**
 * Beyond this many stops the dots stop being a control and start being a
 * texture: twenty 24px targets wrap onto three rows and none of them tells you
 * where you are. A gallery that long gets a counter instead.
 */
const MAX_DOTS = 8;

/**
 * The control row under a carousel.
 *
 * Rendered from the first paint, so hydration cannot resize the section under
 * someone mid-read. Only the dots wait on the measurement, because only they
 * depend on it.
 */
export function CarouselControls({
  stopCount,
  active,
  goTo,
  reduced,
  stoppedByUser,
  toggleStopped,
  noun,
  tone = 'paper',
  className,
}: {
  stopCount: number;
  active: number;
  goTo: (index: number) => void;
  reduced: boolean;
  /** Omit both pause props for a carousel that never advances by itself. */
  stoppedByUser?: boolean;
  toggleStopped?: () => void;
  /** Singular, lower case — "review", "photograph". Names the controls. */
  noun: string;
  tone?: Tone;
  className?: string;
}) {
  const pausable = typeof stoppedByUser === 'boolean' && Boolean(toggleStopped) && !reduced;
  const asDots = stopCount <= MAX_DOTS;

  return (
    <div className={cn('mt-6 flex items-center justify-between gap-4', className)}>
      {asDots ? (
        <ul className="flex flex-wrap items-center gap-1">
          {Array.from({ length: stopCount }, (_, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => goTo(index)}
                aria-current={index === active}
                // An 8px dot in a 40px target: the hit area is the control, the
                // dot is only the part of it that is drawn.
                className={cn(
                  'flex h-10 w-7 items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2',
                  tone === 'ink'
                    ? 'focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink'
                    : 'focus-visible:ring-brand-600',
                )}
              >
                <span className="sr-only">
                  Go to {noun} {index + 1}
                </span>
                {/*
                 * The current dot is a pill, not just a redder circle.
                 *
                 * Colour alone was carrying this state, and carrying it badly:
                 * on the ink ground the old pairing was 2.90:1 for the active
                 * dot and 2.28:1 for the inactive ones against the ground
                 * (WCAG 1.4.11 wants 3:1), and 1.27:1 against each other — a
                 * dark red dot among dark grey dots on black. Even at a
                 * compliant red the two reds sit ~1.15:1 apart, so width is
                 * what actually distinguishes them, and that also satisfies
                 * 1.4.1: the state survives being unable to tell the two
                 * colours apart.
                 */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === active ? 'w-5' : 'w-2',
                    index === active
                      ? tone === 'ink'
                        ? 'bg-brand-500'
                        : 'bg-brand-600'
                      : tone === 'ink'
                        ? 'bg-white/40'
                        : 'bg-paper-edge',
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        // This branch is only ever reached from PhotoCarousel, whose track sets
        // no aria-live of its own (it never moves by itself, so it has nothing
        // to announce unprompted). Without the live region here, pressing Next
        // on a fifteen-frame gallery scrolled the strip and told a screen
        // reader nothing. `polite` because every move is user-initiated.
        <p
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            'text-xs font-semibold uppercase tabular-nums tracking-label',
            tone === 'ink' ? 'text-white/60' : 'text-ink-muted',
          )}
        >
          <span className={tone === 'ink' ? 'text-white' : 'text-ink'}>{active + 1}</span>
          <span aria-hidden="true"> / {stopCount}</span>
          <span className="sr-only"> of {stopCount}</span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <Control label={`Previous ${noun}`} onClick={() => goTo(active - 1)} tone={tone}>
          <ChevronLeft />
        </Control>

        {/* Under reduced motion nothing advances, so a stop control would be a
            button that does nothing to something that is not happening. */}
        {pausable && (
          <Control
            label={stoppedByUser ? `Play ${noun}s` : `Pause ${noun}s`}
            onClick={toggleStopped!}
            tone={tone}
          >
            {stoppedByUser ? (
              <svg aria-hidden="true" viewBox="0 0 12 14" className="h-3 w-3" fill="currentColor">
                <path d="M0 0l12 7-12 7z" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 12 14" className="h-3 w-3" fill="currentColor">
                <rect x="0" y="0" width="4" height="14" />
                <rect x="8" y="0" width="4" height="14" />
              </svg>
            )}
          </Control>
        )}

        <Control label={`Next ${noun}`} onClick={() => goTo(active + 1)} tone={tone}>
          <ChevronRight />
        </Control>
      </div>
    </div>
  );
}
