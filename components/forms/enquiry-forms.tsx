'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { submitEnquiry } from '@/app/actions/enquiry';
import { initialEnquiryState } from '@/lib/enquiry/state';
import { Honeypot, SelectField, TextField } from './fields';
import { FormStatus } from './form-status';
import { COMMERCIAL_PROPERTY_TYPES } from '@/lib/enquiry/options';
import { Button } from '@/components/ui';

/**
 * The free site assessment enquiry form.
 *
 * Built on a Server Action via useActionState, so it submits and validates
 * with JavaScript disabled — the progressive-enhancement requirement. Five
 * fields, enough to qualify and call back a lead: what kind of site it is,
 * roughly where, and how to reach them. Scheduling is worked out on the call.
 */

/**
 * Hidden field carrying the moment the form became interactive, used by the
 * server's minimum-completion-time check.
 *
 * The timestamp is written straight to the DOM node in an effect. Calling
 * Date.now() during render would be impure, and routing it through React state
 * would trigger a cascading render for a value React never needs to read.
 *
 * With JavaScript disabled the value stays 0, which the server reads as an
 * enormous elapsed time and therefore allows. That is deliberate — a no-JS
 * visitor must not be blocked by an anti-bot heuristic. The honeypot still
 * applies to them.
 */
function RenderedAtField() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.value = String(Date.now());
  }, []);

  return <input ref={ref} type="hidden" name="renderedAt" defaultValue="0" />;
}

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Sending…' : children}
    </Button>
  );
}

export function SiteAssessmentForm() {
  const [state, formAction] = useActionState(submitEnquiry, initialEnquiryState);

  return (
    <form action={formAction} className="relative flex flex-col gap-6" noValidate>
      <input type="hidden" name="formType" value="commercial" />
      <RenderedAtField />
      <Honeypot />

      <FormStatus status={state.status} message={state.message} delivered={state.delivered} />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Property or sector type"
          name="propertyType"
          errors={state.errors?.propertyType}
          options={COMMERCIAL_PROPERTY_TYPES}
        />
        <TextField
          label="Suburb or area"
          name="suburb"
          autoComplete="address-level2"
          hint="Just the suburb or area is fine."
          errors={state.errors?.suburb}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Your name" name="name" autoComplete="name" errors={state.errors?.name} />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          errors={state.errors?.phone}
        />
        <div className="sm:col-span-2">
          <TextField
            label="Work email"
            name="email"
            type="email"
            autoComplete="email"
            hint="Where we send the confirmation."
            errors={state.errors?.email}
          />
        </div>
      </div>

      <SubmitButton>Request my free assessment</SubmitButton>
    </form>
  );
}
