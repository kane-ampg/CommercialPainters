import { describe, expect, it } from 'vitest';
import { collapseStops, nearestStop, wrapIndex } from '@/components/media/use-carousel';

/**
 * The three pure pieces of the carousel. They are extracted and tested rather
 * than left inline because every one of them is a place the old inline version
 * could have been wrong without anything visibly breaking: a dot that scrolls
 * nowhere, an arrow that dies at the end of the track, or a control row that
 * disagrees with what is on screen after a swipe.
 */
describe('collapseStops', () => {
  it('keeps every offset when each is its own resting position', () => {
    expect(collapseStops([0, 300, 600, 900])).toEqual([0, 300, 600, 900]);
  });

  it('collapses the tail that clamps to the same final scroll position', () => {
    // Seven cards, three visible: the last three all clamp to the same max,
    // so the track has five stops and five dots, not seven.
    expect(collapseStops([0, 300, 600, 900, 1200, 1200, 1200])).toEqual([0, 300, 600, 900, 1200]);
  });

  it('treats a sub-epsilon difference as the same stop', () => {
    // A scrollbar gutter or a fractional layout leaves differences of well
    // under a pixel between offsets that are, visibly, the same place.
    expect(collapseStops([0, 0.5, 1.4, 300])).toEqual([0, 300]);
  });

  it('is empty for an empty track', () => {
    expect(collapseStops([])).toEqual([]);
  });

  it('keeps a single stop', () => {
    expect(collapseStops([0])).toEqual([0]);
  });
});

describe('nearestStop', () => {
  const stops = [0, 300, 600, 900];

  it('resolves an exact position to its own stop', () => {
    expect(nearestStop(stops, 600)).toBe(2);
  });

  it('resolves a position a swipe left between stops to the nearer one', () => {
    expect(nearestStop(stops, 340)).toBe(1);
    expect(nearestStop(stops, 460)).toBe(2);
  });

  it('clamps past either end rather than running off the array', () => {
    expect(nearestStop(stops, -120)).toBe(0);
    expect(nearestStop(stops, 5000)).toBe(3);
  });

  it('returns the first stop when there is nothing to compare', () => {
    expect(nearestStop([], 400)).toBe(0);
  });
});

describe('wrapIndex', () => {
  it('leaves an in-range index alone', () => {
    expect(wrapIndex(2, 5)).toBe(2);
  });

  it('wraps forward off the end, so Next is never a dead control', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(6, 5)).toBe(1);
  });

  it('wraps backward off the start, so Previous is never a dead control', () => {
    // The case a bare `%` gets wrong: JavaScript's remainder keeps the sign,
    // so -1 % 5 is -1 and the track would scroll to `undefined`.
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(-7, 5)).toBe(3);
  });

  it('survives an unmeasured track instead of dividing by zero', () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});
