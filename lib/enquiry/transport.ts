import 'server-only';
import type { Enquiry } from '@/lib/validation/enquiry';
import {
  ASSESSMENT_TYPES,
  COMMERCIAL_PROPERTY_TYPES,
  SITE_REGIONS,
  type EnquiryOption,
} from '@/lib/enquiry/options';

/**
 * Booking delivery.
 *
 * No production email or CRM credentials exist for this project yet, and where
 * Contact Form 7 submissions currently land on the WordPress site is unknown.
 * Rather than pretend, this is an adapter interface with two implementations:
 *
 *   console  — the default. Records that a submission happened. Delivers nothing.
 *   resend   — a real provider, active only once RESEND_API_KEY is configured.
 *
 * The console adapter reports `delivered: false`, and the UI tells the user to
 * phone instead. The site never claims a message was sent when it was not.
 *
 * On Vercel production a transport that cannot deliver is a misconfiguration,
 * not a state: see `requireDelivery` at the bottom of this file.
 */

export type TransportResult =
  { delivered: true } | { delivered: false; reason: 'not-configured' | 'provider-error' };

export interface EnquiryTransport {
  readonly id: string;
  send(enquiry: Enquiry): Promise<TransportResult>;
}

/**
 * Fields that must never reach a log. Customer contact details and free text
 * are business data, not diagnostics.
 */
function redact(enquiry: Enquiry): Record<string, unknown> {
  return {
    formType: enquiry.formType,
    assessmentType: enquiry.assessmentType,
    // A count, not the content.
    fieldsSubmitted: Object.keys(enquiry).length,
  };
}

const consoleTransport: EnquiryTransport = {
  id: 'console',
  async send(enquiry) {
    // Redacted by construction — no name, phone, email or free text.
    console.info('[enquiry] received', redact(enquiry));
    return { delivered: false, reason: 'not-configured' };
  },
};

const resendTransport: EnquiryTransport = {
  id: 'resend',
  async send(enquiry) {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.ENQUIRY_TO_EMAIL;
    const from = process.env.ENQUIRY_FROM_EMAIL;

    if (!apiKey || !to || !from) {
      return { delivered: false, reason: 'not-configured' };
    }

    const { subject, body } = describeRequest(enquiry);

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, subject, text: body }),
      });

      if (!response.ok) {
        // Status only. The response body can echo submitted content.
        console.error('[enquiry] provider rejected send', { status: response.status });
        return { delivered: false, reason: 'provider-error' };
      }

      return { delivered: true };
    } catch {
      console.error('[enquiry] provider request failed');
      return { delivered: false, reason: 'provider-error' };
    }
  },
};

function labelOf(options: readonly EnquiryOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/**
 * The email a booking becomes.
 *
 * The subject is how the team triages an inbox, so it says what was booked
 * and by whom. The body reads back the labels the visitor saw rather than the
 * enum values the server stored — `On-site visit`, not `onsite`.
 */
export function describeRequest(enquiry: Enquiry): { subject: string; body: string } {
  const assessmentType = labelOf(ASSESSMENT_TYPES, enquiry.assessmentType);

  const subject = `Site assessment request — ${assessmentType} — ${enquiry.name}, ${enquiry.organisation}`;

  const lines: (readonly [string, string])[] = [
    ['Assessment type', assessmentType],
    ['Site region', labelOf(SITE_REGIONS, enquiry.siteRegion)],
    ['Sector', labelOf(COMMERCIAL_PROPERTY_TYPES, enquiry.propertyType)],
    ['Site address', enquiry.siteAddress],
    ['Preferred times', enquiry.preferredTimes],
    ['Notes', enquiry.notes || '—'],
    ['Organisation', enquiry.organisation],
    ['Name', enquiry.name],
    ['Phone', enquiry.phone],
    ['Email', enquiry.email],
  ];

  return { subject, body: lines.map(([key, value]) => `${key}: ${value}`).join('\n') };
}

const RESEND_VARIABLES = ['RESEND_API_KEY', 'ENQUIRY_TO_EMAIL', 'ENQUIRY_FROM_EMAIL'] as const;

/**
 * Production guard.
 *
 * Between launch and 16 September 2026 production ran the console adapter, so
 * every enquiry validated, showed a polite "not sent" message and vanished.
 * Nothing in the logs said so, because "received" is what a working system
 * logs too.
 *
 * On Vercel production, a transport that cannot deliver is therefore refused:
 * the visitor is told to phone (the `provider-error` copy in the Server
 * Action) and one unmistakable error line names the transport and the
 * variables that are unset. Names, never values. Preview and local keep the
 * quiet console adapter, which the e2e suite depends on.
 */
function requireDelivery(transport: EnquiryTransport): EnquiryTransport {
  return {
    id: transport.id,
    async send(enquiry) {
      const missing =
        transport.id === 'resend'
          ? RESEND_VARIABLES.filter((name) => !process.env[name])
          : ['ENQUIRY_TRANSPORT=resend'];

      if (transport.id === 'console' || missing.length > 0) {
        console.error(
          '[enquiry] MISCONFIGURED: production cannot deliver enquiries. Set the Resend variables in Vercel Production and redeploy.',
          { transport: transport.id, missing },
        );
        return { delivered: false, reason: 'provider-error' };
      }

      return transport.send(enquiry);
    },
  };
}

export function getEnquiryTransport(): EnquiryTransport {
  const transport = process.env.ENQUIRY_TRANSPORT === 'resend' ? resendTransport : consoleTransport;

  return process.env.VERCEL_ENV === 'production' ? requireDelivery(transport) : transport;
}
