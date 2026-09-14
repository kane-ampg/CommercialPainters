'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/** Slack, in px, when deciding whether two slides share a resting position. */
const EPSILON = 2;

/* ------------------------------------------------------------------ */
/* Geometry — pure, and the part that actually goes wrong              */
/* ------------------------------------------------------------------ */

/**
 * The offsets a slide can actually rest at, from the offsets it would like to.
 *
 * Two slides collapse into one stop when scrolling to either lands in the same
 * place — which is what happens at the end of every track, where the last few
 * slides are all clamped to `scrollWidth - clientWidth`. A dot that cannot
 * move anything misrepresents what the control does, so those never become
 * separate stops.
 */
export function collapseStops(offsets: readonly number[], epsilon: number = EPSILON): number[] {
  return offsets.filter(
    (left, index) => index === 0 || left - (offsets[index - 1] as number) > epsilon,
  );
}

/**
 * Which stop a scroll position belongs to.
 *
 * The nearest one, not the one that was asked for: a swipe, a trackpad flick
 * or an interrupted smooth scroll all end wherever they end, and the controls
 * have to agree with what is on screen rather than with what was requested.
 */
export function nearestStop(stops: readonly number[], left: number): number {
  let nearest = 0;
  stops.forEach((stop, index) => {
    if (Math.abs(stop - left) < Math.abs((stops[nearest] as number) - left)) nearest = index;
  });
  return nearest;
}

/** Wraps both ways, so neither arrow is ever a dead control. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/* ------------------------------------------------------------------ */
/* Reduced motion                                                      */
/* ------------------------------------------------------------------ */

/** A media query as an external store, so it re-renders when it changes. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia('(prefers-reduced-motion: reduce)');
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // The server cannot know, and guessing `true` would ship a dead carousel to
    // everyone. Autoplay only ever starts inside an effect, so the real answer
    // arrives before anything has moved.
    () => false,
  );
}

/* ------------------------------------------------------------------ */
/* The carousel                                                        */
/* ------------------------------------------------------------------ */

/**
 * The mechanics behind every carousel on the site.
 *
 * ## Why a scroll container rather than a transform
 *
 * The track is a genuinely scrolling element with CSS scroll snapping, and
 * every move — autoplay, arrows, dots — is a `scrollTo`. That buys touch
 * swiping, trackpad flicks, keyboard arrow keys and a sane reading order for
 * nothing, and it means the hook holds no offset of its own that can drift out
 * of step with what is on screen: position is read back off `scrollLeft`
 * rather than remembered.
 *
 * It also degrades honestly. Before hydration — or if the bundle never arrives
 * — the section is a swipeable row of readable content. None of this is
 * required for the content to be there.
 *
 * ## Where a slide is allowed to stop
 *
 * How many slides are visible is never named in JavaScript. `stops` is
 * measured off the laid-out children, so the breakpoints live in the class
 * list alone, and offsets that clamp to the same final scroll position
 * collapse into one — see `collapseStops`.
 *
 * ## When it moves by itself
 *
 * Only when `autoplayMs` is passed, and then it holds still for any of five
 * reasons: a mouse over the carousel, keyboard focus inside it, the track
 * scrolled off screen, a backgrounded tab, or the visitor pressing pause.
 * `prefers-reduced-motion` suppresses autoplay outright.
 *
 * Content that advances by itself past five seconds needs a way to stop it
 * (WCAG 2.2.2) — `stoppedByUser` is that control's state. Hover and focus are
 * the two that matter in practice, because they are what someone does while
 * reading.
 */
export function useCarousel({
  itemCount,
  autoplayMs,
}: {
  /** Re-measures when the number of slides changes. */
  itemCount: number;
  /** Omit for a carousel that only ever moves when someone moves it. */
  autoplayMs?: number;
}) {
  const trackRef = useRef<HTMLElement | null>(null);

  /** Left offsets a slide can actually rest at, measured from the DOM. */
  const [stops, setStops] = useState<readonly number[]>([]);
  const [active, setActive] = useState(0);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [stoppedByUser, setStoppedByUser] = useState(false);

  const reduced = usePrefersReducedMotion();
  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';

  const canAutoplay = typeof autoplayMs === 'number' && !reduced;
  const running =
    canAutoplay &&
    !hovered &&
    !focused &&
    !stoppedByUser &&
    onScreen &&
    visible &&
    stops.length > 1;

  /* ---------------------------------------------------------------- */
  /* Measurement                                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const offsets = Array.from(track.children, (slide) =>
        Math.min((slide as HTMLElement).offsetLeft, max),
      );
      setStops(collapseStops(offsets));
    };

    measure();

    // The width changes here are the breakpoints firing and a scrollbar gutter
    // appearing, both of which move every slide. More reliable than a window
    // resize listener, which misses a container resized by anything else.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [itemCount]);

  /* ---------------------------------------------------------------- */
  /* Position                                                          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const track = trackRef.current;
    if (!track || stops.length === 0) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setActive(nearestStop(stops, track.scrollLeft));
      });
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [stops]);

  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || stops.length === 0) return;
      const wrapped = wrapIndex(index, stops.length);
      track.scrollTo({ left: stops[wrapped] as number, behavior });
      setActive(wrapped);
    },
    [stops, behavior],
  );

  /* ---------------------------------------------------------------- */
  /* Autoplay                                                          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!canAutoplay) return;
    const track = trackRef.current;
    if (!track) return;

    // Nothing should be advancing behind six sections nobody can see it
    // through. A fifth of the track on screen counts as being read.
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(Boolean(entry?.isIntersecting)),
      { threshold: 0.2 },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, [canAutoplay]);

  useEffect(() => {
    if (!canAutoplay) return;
    const onVisibility = () => setVisible(!document.hidden);
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [canAutoplay]);

  // `active` is a dependency on purpose rather than by oversight: every move,
  // whoever made it, restarts the interval from where it landed. Without that,
  // a slide reached by hand would inherit whatever was left of the previous
  // one's turn and could be gone in a few hundred milliseconds.
  useEffect(() => {
    if (!running || !autoplayMs) return;
    const timer = window.setInterval(() => goTo(active + 1), autoplayMs);
    return () => window.clearInterval(timer);
  }, [running, goTo, active, autoplayMs]);

  /**
   * Spread onto the element wrapping the track and its controls.
   *
   * Mouse only for the enter half. A tap fires `pointerenter` on touch and
   * never fires the matching leave, which would park the carousel for the rest
   * of the visit. The leave is unconditional, so a mouse that departs by way of
   * a scroll or a window switch still releases it.
   */
  const pauseHandlers = {
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(true);
    },
    onPointerLeave: () => setHovered(false),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };

  return {
    trackRef,
    stops,
    active,
    goTo,
    reduced,
    running,
    stoppedByUser,
    toggleStopped: () => setStoppedByUser((stopped) => !stopped),
    pauseHandlers,
  };
}

/**
 * The class list that makes an element a snapping, scrollable track.
 *
 * The row is its own control surface; a scrollbar under it reads as a second
 * one. Swipe, arrows and dots all survive its removal.
 */
export const carouselTrack =
  'flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain ' +
  '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
