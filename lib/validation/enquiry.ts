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

/** Deliberately permissive — AU numbers are written many ways. */
const phone = z
  .string()
  .trim()
  .min(8, 'Enter a contact number with at least 8 digits.')
  .max(20, 'That number is too long.')
  .regex(/^[0-9+()\s-]+$/, 'Use digits, spaces, and + ( ) - only.');

const suburb = z
  .string()
  .trim()
  .min(2, 'Enter the suburb or area.')
  .max(100, 'Please keep this under 100 characters.');

/**
 * Anti-spam fields, present on every route into the pipeline.
 * `company_website` is a honeypot — hidden from users, so any value means a bot.
 * `renderedAt` supports a minimum-completion-time check on the server.
 */
const antiSpam = {
  company_website: z.string().max(0, 'Rejected.').optional().default(''),
  renderedAt: z.coerce.number().int().nonnegative(),
};

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
