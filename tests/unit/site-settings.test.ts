import { describe, expect, it } from 'vitest';
import {
  addressEffectiveMonth,
  defaultSiteSettings,
  formatAddress,
  internationalPhone,
  phoneHref,
} from '@/lib/site';

describe('site settings', () => {
  it('derives the tel link from the display number', () => {
    expect(phoneHref('1300 97 97 40')).toBe('tel:1300979740');
    expect(phoneHref('(03) 9876 5432')).toBe('tel:0398765432');
  });

  it('formats the address on one line', () => {
    expect(formatAddress(defaultSiteSettings.address)).toBe(
      '1 Turbo Drive, Bayswater North VIC 3153',
    );
  });

  it('names a future address month until the move date, then drops it', () => {
    // Nothing to describe today — the settings carry no move date — but the
    // footer's line has to expire on its own once one is set.
    expect(addressEffectiveMonth(defaultSiteSettings)).toBeNull();

    const moving = {
      ...defaultSiteSettings,
      address: { ...defaultSiteSettings.address, effectiveFrom: '2026-10-01' },
    };
    expect(addressEffectiveMonth(moving, new Date('2026-09-15'))).toBe('October 2026');
    expect(addressEffectiveMonth(moving, new Date('2026-10-02'))).toBeNull();
  });

  it('country-codes the display number without mangling any Australian shape', () => {
    // The two failures this covers were a six-digit 13 number sliced as a
    // landline, and an already-country-coded number having its 61 grouped as
    // subscriber digits ("+61 3 9123 4567" -> "+61 6 1391 234567").
    const cases: [string, string][] = [
      ['1300 97 97 40', '+61 1300 979 740'],
      ['1300 123 456', '+61 1300 123 456'],
      ['1800 123 456', '+61 1800 123 456'],
      ['13 26 84', '+61 13 26 84'],
      ['0412 345 678', '+61 412 345 678'],
      ['03 9876 5432', '+61 3 9876 5432'],
      ['(03) 9876 5432', '+61 3 9876 5432'],
      ['+61 3 9123 4567', '+61 3 9123 4567'],
      ['61 412 345 678', '+61 412 345 678'],
    ];

    for (const [display, expected] of cases) {
      expect(internationalPhone(display), display).toBe(expected);
    }
  });

  it('publishes the one number everywhere, derived not retyped', () => {
    expect(defaultSiteSettings.phone).toBe('1300 97 97 40');
    expect(internationalPhone(defaultSiteSettings.phone)).toBe('+61 1300 979 740');
  });
});
