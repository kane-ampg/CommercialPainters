import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * The collection notice, set beside every submit that sends an enquiry.
 *
 * Australian Privacy Principle 5 asks that people are told, at the point of
 * collection, why their details are wanted and where the policy is. The form
 * on /contact-us/ and the chat collect the same five fields through the same
 * Server Action, so they carry the same sentence.
 */
export function PrivacyNotice({ className }: { className?: string }) {
  return (
    <p className={cn('text-ink-muted', className)}>
      We use these details to respond to your enquiry and arrange the assessment. Our{' '}
      <Link
        href="/privacy-policy/"
        className="font-semibold text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      >
        privacy policy
      </Link>{' '}
      explains how we handle them.
    </p>
  );
}
