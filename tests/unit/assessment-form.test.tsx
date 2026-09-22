import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteAssessmentForm } from '@/components/forms/enquiry-forms';
import { SiteSettingsProvider } from '@/components/providers/site-settings';
import { defaultSiteSettings } from '@/lib/site';

/**
 * The enquiry form on the contact page.
 *
 * Five fields, enough to qualify and call back a lead. Scheduling — on site or
 * online, and when — is worked out on the callback, not asked here.
 */

vi.mock('@/app/actions/enquiry', () => ({
  submitEnquiry: vi.fn(async () => ({ status: 'idle' })),
}));

beforeEach(() => {
  render(
    <SiteSettingsProvider value={defaultSiteSettings}>
      <SiteAssessmentForm />
    </SiteSettingsProvider>,
  );
});

describe('the form asks for a qualified lead, not a booking', () => {
  it('does not ask the visitor to choose a representative', () => {
    expect(screen.queryByLabelText(/representative/i)).not.toBeInTheDocument();
  });

  it('does not ask when suits, or on-site vs online — that is worked out on the call', () => {
    expect(screen.queryByLabelText(/preferred times/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/assessment type/i)).not.toBeInTheDocument();
  });

  it('asks for exactly the five qualifying fields', () => {
    expect(screen.getByLabelText(/property or sector type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/suburb or area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toHaveAttribute('type', 'email');
  });

  it('no longer demands a scope summary or timeframe up front', () => {
    expect(screen.queryByLabelText(/scope summary/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/timeframe/i)).not.toBeInTheDocument();
  });

  it('submits as a fast enquiry, not a scheduled booking', () => {
    expect(screen.getByRole('button', { name: /request my free assessment/i })).toBeInTheDocument();
  });
});
