import { afterEach, describe, expect, it, vi } from 'vitest';
import { describeRequest, getEnquiryTransport } from '@/lib/enquiry/transport';
import type { Enquiry } from '@/lib/validation/enquiry';

/**
 * The email subject is how Farbod, Zac and Simon triage an inbox: it has to
 * say who is asking and what kind of site before anyone opens the message.
 */
const request: Enquiry = {
  formType: 'commercial',
  propertyType: 'office',
  suburb: 'Bayswater North VIC',
  name: 'Alex Chen',
  phone: '0400 000 000',
  email: 'alex@example.com',
  renderedAt: 0,
  referral_source: '',
};

describe('describeRequest', () => {
  it('names the contact and the sector in the subject', () => {
    expect(describeRequest(request).subject).toBe(
      'Site assessment enquiry — Alex Chen — Office, Bayswater North VIC',
    );
  });

  it('carries no representative line — assignment is internal', () => {
    expect(describeRequest(request).body).not.toMatch(/Representative/);
  });

  it('reads the label a visitor saw, not the enum value', () => {
    const { body } = describeRequest({ ...request, propertyType: 'healthcare' });
    expect(body).toMatch(/Sector: Healthcare or medical/);
    expect(body).not.toMatch(/\bhealthcare\b(?! or medical)/);
  });

  it('never carries the anti-spam fields into the email', () => {
    const { body } = describeRequest(request);
    expect(body).not.toMatch(/referral_source|renderedAt|formType/);
  });
});

/**
 * The console adapter is a development convenience. In production it means
 * every enquiry validates and vanishes, which is exactly what happened between
 * launch and 16 September 2026. So on Vercel production a transport that
 * cannot deliver refuses the submission as a provider error (the UI then says
 * "call us") and writes a line to the logs that says why.
 */
describe('getEnquiryTransport in production', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function stubProduction(env: Record<string, string>) {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('ENQUIRY_TRANSPORT', '');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('ENQUIRY_TO_EMAIL', '');
    vi.stubEnv('ENQUIRY_FROM_EMAIL', '');
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  }

  it('refuses the console adapter and logs an error', async () => {
    stubProduction({ ENQUIRY_TRANSPORT: 'console' });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    const result = await getEnquiryTransport().send(request);

    expect(result).toEqual({ delivered: false, reason: 'provider-error' });
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/\[enquiry\] MISCONFIGURED/),
      expect.objectContaining({ transport: 'console' }),
    );
    // The quiet "received" line would suggest the submission was handled.
    expect(info).not.toHaveBeenCalled();
  });

  it('refuses a resend adapter with missing variables and names them', async () => {
    stubProduction({
      ENQUIRY_TRANSPORT: 'resend',
      RESEND_API_KEY: 're_test',
      ENQUIRY_FROM_EMAIL: 'enquiries@example.com',
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const result = await getEnquiryTransport().send(request);

    expect(result).toEqual({ delivered: false, reason: 'provider-error' });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/\[enquiry\] MISCONFIGURED/),
      expect.objectContaining({ transport: 'resend', missing: ['ENQUIRY_TO_EMAIL'] }),
    );
  });

  it('never logs a variable value, only its name', async () => {
    stubProduction({ ENQUIRY_TRANSPORT: 'resend', RESEND_API_KEY: 're_secret_value' });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    await getEnquiryTransport().send(request);

    expect(JSON.stringify(error.mock.calls)).not.toMatch(/re_secret_value/);
  });

  it('leaves the console adapter alone outside production', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('ENQUIRY_TRANSPORT', 'console');
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    const result = await getEnquiryTransport().send(request);

    expect(result).toEqual({ delivered: false, reason: 'not-configured' });
    expect(info).toHaveBeenCalled();
  });
});
