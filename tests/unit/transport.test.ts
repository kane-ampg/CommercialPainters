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

  it('accepts the n8n adapter in production once its webhook URL is set', async () => {
    stubProduction({
      ENQUIRY_TRANSPORT: 'n8n',
      N8N_ENQUIRY_WEBHOOK_URL: 'https://n8n.example/webhook/enquiry',
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{"ok":true}', { status: 200 }));

    const result = await getEnquiryTransport().send(request);

    expect(result).toEqual({ delivered: true });
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(error).not.toHaveBeenCalled();
  });

  it('refuses the n8n adapter in production when its webhook URL is unset', async () => {
    stubProduction({ ENQUIRY_TRANSPORT: 'n8n', N8N_ENQUIRY_WEBHOOK_URL: '' });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const result = await getEnquiryTransport().send(request);

    expect(result).toEqual({ delivered: false, reason: 'provider-error' });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      expect.stringMatching(/\[enquiry\] MISCONFIGURED/),
      expect.objectContaining({ transport: 'n8n', missing: ['N8N_ENQUIRY_WEBHOOK_URL'] }),
    );
  });
});

/**
 * What the workflow actually receives. It checks the honeypot itself, because
 * a webhook URL is public and the site is not the only thing that can call it.
 */
describe('the n8n transport posts what the workflow expects', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function post(enquiry: Enquiry = request) {
    vi.stubEnv('VERCEL_ENV', 'development');
    vi.stubEnv('ENQUIRY_TRANSPORT', 'n8n');
    vi.stubEnv('N8N_ENQUIRY_WEBHOOK_URL', 'https://n8n.example/webhook/enquiry');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{"ok":true}', { status: 200 }));

    const result = await getEnquiryTransport().send(enquiry);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    return { result, url, init: init as RequestInit, body: JSON.parse(String(init?.body)) };
  }

  it('sends the five answered fields and the honeypot, as JSON', async () => {
    const { url, init, body } = await post();

    expect(url).toBe('https://n8n.example/webhook/enquiry');
    expect(init.method).toBe('POST');
    expect(body).toEqual({
      name: 'Alex Chen',
      email: 'alex@example.com',
      phone: '0400 000 000',
      suburb: 'Bayswater North VIC',
      propertyType: 'office',
      referral_source: '',
    });
  });

  it('sends the sector as the value the workflow maps, not the label', async () => {
    const { body } = await post({ ...request, propertyType: 'aged-care-and-retirement' });
    expect(body.propertyType).toBe('aged-care-and-retirement');
  });

  it('gives up rather than hanging a visitor on an unreachable workflow', async () => {
    vi.stubEnv('VERCEL_ENV', 'development');
    vi.stubEnv('ENQUIRY_TRANSPORT', 'n8n');
    vi.stubEnv('N8N_ENQUIRY_WEBHOOK_URL', 'https://n8n.example/webhook/enquiry');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('aborted', 'TimeoutError'));

    const result = await getEnquiryTransport().send(request);

    expect(result).toEqual({ delivered: false, reason: 'provider-error' });
  });

  it('never logs what the visitor submitted when the workflow rejects it', async () => {
    vi.stubEnv('VERCEL_ENV', 'development');
    vi.stubEnv('ENQUIRY_TRANSPORT', 'n8n');
    vi.stubEnv('N8N_ENQUIRY_WEBHOOK_URL', 'https://n8n.example/webhook/enquiry');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"ok":false,"errors":["missing name"]}', { status: 400 }),
    );

    const result = await getEnquiryTransport().send(request);

    expect(result).toEqual({ delivered: false, reason: 'provider-error' });
    const logged = JSON.stringify(error.mock.calls);
    expect(logged).toContain('400');
    expect(logged).not.toContain('Alex Chen');
    expect(logged).not.toContain('alex@example.com');
  });
});
