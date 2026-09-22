import { z } from 'zod';

/**
 * Site assessment enquiry schema.
 *
 * The site's one call to action is a free site assessment, so the form asks
 * only what is needed to qualify and call back a lead: who they are, how to
 * reach them, roughly where the site is, and what kind of property it is.
 * Scheduling — on site or online, and when — is worked out on the callback,
 * not collected up front.
 *
 * Shared by the client and the server. The server always re-validates; client
 * validation is a convenience, never a control.
 */

const name = z.string().trim().min(2, 'Enter your name.').max(100, 'That name is too long.');

const email = z
  .string()
  .trim()
  .min(1, 'Enter your work email address.')
  .email('Enter a valid email address, like name@example.com.')
  .max(254);

/**
 * Deliberately permissive — AU numbers are written many ways, and an enquiry
 * lost to a punctuation rule costs more than a malformed number let through.
 *
 * The length rule counts digits rather than characters, so `(03) 9000 0000`
 * and `0400.000.000` both pass while `12345` does not. Counting characters
 * meant punctuation could carry a too-short number over the line.
 */
const phone = z
  .string()
  .trim()
  .max(25, 'That number is too long.')
  .regex(/^[0-9+().\s-]+$/, 'Use digits, spaces, and + ( ) . - only.')
  .refine(
    (value) => value.replace(/\D/g, '').length >= 8,
    'Enter a contact number with at least 8 digits.',
  );

const suburb = z
  .string()
  .trim()
  .min(2, 'Enter the suburb or area.')
  .max(100, 'Please keep this under 100 characters.');

/**
 * Anti-spam fields, present on every route into the pipeline.
 *
 * `referral_source` is a honeypot — hidden from users, so any value means a
 * bot. Its name is deliberately outside the vocabulary browser autofill and
 * password managers match on (`company`, `organization`, `website`, `url`).
 * It was `company_website` until 21 September 2026, and Chrome will fill an
 * off-screen "Company website" from a saved profile whatever `autocomplete`
 * says — which rejected the enquiry of the real person it autofilled for.
 *
 * `renderedAt` supports a minimum-completion-time check on the server.
 */
const antiSpam = {
  referral_source: z.string().max(0, 'Rejected.').optional().default(''),
  renderedAt: z.coerce.number().int().nonnegative(),
};

/**
 * Fields the page sets rather than ones a visitor answers.
 *
 * No form renders an error against these, so a failure confined to them has
 * nowhere on screen to land. The Server Action checks for exactly that before
 * it tells anybody to check their highlighted fields.
 */
export const MACHINE_FIELDS: readonly string[] = ['formType', 'referral_source', 'renderedAt'];

/**
 * The enquiry, as a plain object schema.
 *
 * Kept as an object schema (rather than a refined one) so the chat can
 * validate one answer at a time against `.shape`.
 */
export const siteAssessmentSchema = z.object({
  ...antiSpam,
  formType: z.literal('commercial'),
  propertyType: z.enum(
    [
      'education-and-childcare',
      'healthcare',
      'aged-care-and-retirement',
      'body-corporate-and-strata',
      'retail',
      'hospitality',
      'leisure-and-sports',
      'industrial',
      'office',
      'other',
    ],
    { errorMap: () => ({ message: 'Choose a property or sector type.' }) },
  ),
  suburb,
  name,
  phone,
  email,
});

export type SiteAssessmentRequest = z.infer<typeof siteAssessmentSchema>;
/** Kept as its own alias so callers describe the payload generically. */
export type Enquiry = SiteAssessmentRequest;

/** Minimum seconds between form render and submit. Below this it is a bot. */
export const MIN_COMPLETION_SECONDS = 3;
