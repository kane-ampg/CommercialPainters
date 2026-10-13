import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { allLocalities, displayName, type Locality, type StateKey } from '@/lib/locations';
import { metaDescription } from '@/lib/seo/metadata';
import { services } from '@/content/services';
import { galleries } from '@/content/galleries';
import {
  defaultDescription,
  defaultIntro,
  LocalServices,
  localityFaqs,
  NearbyWork,
  nearbyWork,
  reasonsFor,
  WhyChooseUs,
} from '@/components/sections/locality';
import { WorkGalleryBlock } from '@/components/sections/work-gallery';
import { FORBIDDEN } from './qld-copy.test';

/**
 * The selling half of the suburb page: services, photographed work nearby,
 * why us, and the questions before an enquiry.
 *
 * These blocks were added on 12 October 2026 after a side-by-side with the
 * group's older suburb pages, which sell house painting first. The brief was
 * explicit that none of that comes across, so this renders every block for
 * every one of the 1,387 localities and reads the output, rather than trusting
 * a grep of the source: the copy is assembled from data at render time.
 */

const RESIDENTIAL =
  /\b(residential|house|houses|homes?|homeowners?|household|domestic|dwellings?)\b/i;

const byState = (state: StateKey) => allLocalities().filter((l) => l.state === state);

function pageCopy(locality: Locality) {
  const faqs = localityFaqs(locality)
    .map((f) => `${f.question} ${f.answer}`)
    .join(' ');
  return [
    // The hand-written intro and notes, where a promoted suburb has them. They
    // replace the generated intro on the page, so they are read here too.
    locality.intro ?? '',
    ...(locality.localNotes ?? []),
    defaultIntro(locality),
    defaultDescription(locality),
    faqs,
    renderToStaticMarkup(createElement(LocalServices, { locality, services })),
    renderToStaticMarkup(createElement(WhyChooseUs, { locality })),
    renderToStaticMarkup(createElement(NearbyWork, { locality })),
  ].join(' ');
}

describe('suburb page copy is commercial only', () => {
  it('renders no residential vocabulary on any suburb page', () => {
    for (const locality of allLocalities()) {
      // The place's own name is not copy: Glass House Mountains is a suburb.
      const copy = pageCopy(locality).replaceAll(displayName(locality.name), '');
      expect(copy, locality.href).not.toMatch(RESIDENTIAL);
    }
  });
});

describe('Queensland suburb pages claim no presence', () => {
  const qld = byState('QLD');

  it('has Queensland localities to check', () => {
    expect(qld.length).toBeGreaterThan(700);
  });

  it('states no distance, drive time or footprint phrase', () => {
    for (const locality of qld) {
      const text = pageCopy(locality);
      expect(text, `${locality.name}: distance`).not.toMatch(/\d+(\.\d+)?km/);
      expect(text, `${locality.name}: drive`).not.toMatch(/\bdrive\b/i);
      expect(text, `${locality.name}: travel time`).not.toMatch(/\bminutes\b|\ban hour\b/i);
      const lower = text.toLowerCase();
      for (const phrase of FORBIDDEN) {
        expect(lower, `${locality.name}: "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it('shows no photographed work and no site-visit promise', () => {
    for (const locality of qld) {
      expect(nearbyWork(locality), locality.name).toEqual([]);
      expect(
        reasonsFor(locality).map((r) => r.heading),
        locality.name,
      ).not.toContain('A site visit before every price');
      expect(
        localityFaqs(locality).map((f) => f.question),
        locality.name,
      ).not.toContain('What happens at the free site assessment?');
    }
  });
});

describe('photographed work nearby', () => {
  const croydon = allLocalities().find((l) => l.state === 'VIC' && l.slug === 'croydon')!;

  it('puts the two Croydon sites first on the Croydon page, in Croydon itself', () => {
    const sites = nearbyWork(croydon);
    expect(sites.slice(0, 2).map((s) => s.gallery.slug)).toEqual(
      expect.arrayContaining(['toyota-croydon', 'croydon-kindergarten']),
    );
    for (const site of sites.slice(0, 2)) expect(site.km).toBeLessThan(1);
  });

  it('links each card to its gallery on /projects/, and that anchor exists', () => {
    const html = renderToStaticMarkup(createElement(NearbyWork, { locality: croydon }));
    // The test stub for next/link drops the trailing slash; the page keeps it.
    expect(html).toMatch(/href="\/projects\/?#toyota-croydon"/);

    const toyota = galleries.find((g) => g.slug === 'toyota-croydon')!;
    const gallery = renderToStaticMarkup(createElement(WorkGalleryBlock, { gallery: toyota }));
    expect(gallery).toContain('id="toyota-croydon"');
  });

  /*
   * A gallery without a recorded suburb has no position. For the industrial
   * unit that is the client's instruction (owner unnamed, suburb left off), so
   * it must never be placed near anywhere.
   */
  it('never places a gallery that has no recorded suburb', () => {
    const unplaced = new Set(galleries.filter((g) => !g.suburb).map((g) => g.slug));
    expect(unplaced.has('industrial-unit')).toBe(true);
    for (const locality of byState('VIC')) {
      for (const site of nearbyWork(locality)) {
        expect(unplaced.has(site.gallery.slug), locality.name).toBe(false);
      }
    }
  });

  it('gives every Victorian suburb at least one nearby site', () => {
    for (const locality of byState('VIC')) {
      expect(nearbyWork(locality).length, locality.name).toBeGreaterThan(0);
    }
  });
});

describe('the generated meta description', () => {
  it('keeps the offer on an ordinary-length suburb name', () => {
    const croydon = allLocalities().find((l) => l.state === 'VIC' && l.slug === 'croydon')!;
    expect(metaDescription(defaultDescription(croydon))).toMatch(/Free site assessment\.$/);
  });

  it('names the postcode on every Victorian page', () => {
    for (const locality of byState('VIC')) {
      expect(defaultDescription(locality), locality.name).toContain(locality.postcodes[0]!);
    }
  });
});
