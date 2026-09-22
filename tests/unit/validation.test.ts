import { describe, expect, it } from 'vitest';
import { siteAssessmentSchema } from '@/lib/validation/enquiry';

/**
 * The free site assessment enquiry.
 *
 * Five fields, enough to qualify and call back a lead: what kind of site it
 * is, roughly where, and how to reach them. Scheduling is worked out on the
 * callback, not collected here.
 */
const validEnquiry = {
  formType: 'commercial',
  propertyType: 'education-and-childcare',
  suburb: 'Vermont VIC',
  name: 'Alex Chen',
  phone: '(03) 9000 0000',
  email: 'facilities@example.edu.au',
  renderedAt: 1700000000000,
  referral_source: '',
};

describe('site assessment schema', () => {
  it('accepts a complete enquiry', () => {
    expect(siteAssessmentSchema.safeParse(validEnquiry).success).toBe(true);
  });

  it('requires a suburb, so the team knows roughly where the site is', () => {
    const result = siteAssessmentSchema.safeParse({ ...validEnquiry, suburb: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.suburb).toBeDefined();
    }
  });

  it('does not ask the visitor to pick a representative — the team assigns one', () => {
    expect('assessor' in siteAssessmentSchema.shape).toBe(false);
    expect(siteAssessmentSchema.safeParse({ ...validEnquiry, assessor: 'zac' }).success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = siteAssessmentSchema.safeParse({ ...validEnquiry, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toMatch(/valid email/i);
    }
  });

  it('rejects a phone number containing letters', () => {
    const result = siteAssessmentSchema.safeParse({ ...validEnquiry, phone: 'call me' });
    expect(result.success).toBe(false);
  });

  /*
   * A real number typed a slightly unusual way is a lead, not a defect. The
   * rule counts digits rather than characters, so punctuation is free and
   * "12 34" cannot pass on length alone.
   */
  it.each([
    '0400 000 000',
    '0400.000.000',
    '0400-000-000',
    '(03) 9000 0000',
    '+61 3 9000 0000',
    '+61 (0)3 9000 0000',
    '1300979740',
  ])('accepts %s, however it is punctuated', (phone) => {
    const result = siteAssessmentSchema.safeParse({ ...validEnquiry, phone });
    expect(result.success, JSON.stringify(result.error?.flatten().fieldErrors)).toBe(true);
  });

  it('rejects a number with too few digits, whatever the punctuation adds', () => {
    const result = siteAssessmentSchema.safeParse({ ...validEnquiry, phone: '(03) 90' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.phone?.[0]).toMatch(/8 digits/i);
    }
  });

  it('rejects a filled honeypot', () => {
    const result = siteAssessmentSchema.safeParse({
      ...validEnquiry,
      referral_source: 'http://spam.example',
    });
    expect(result.success).toBe(false);
  });

  it('requires a name', () => {
    const result = siteAssessmentSchema.safeParse({ ...validEnquiry, name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it('rejects a sector outside the known list', () => {
    const result = siteAssessmentSchema.safeParse({
      ...validEnquiry,
      propertyType: 'nuclear-reactor',
    });
    expect(result.success).toBe(false);
  });

  it('exposes the field shape, so the chat can validate one answer at a time', () => {
    expect(Object.keys(siteAssessmentSchema.shape)).toContain('propertyType');
  });
});
