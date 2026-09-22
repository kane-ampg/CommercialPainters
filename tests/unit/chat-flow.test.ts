import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  availableOptions,
  buildEnquiryFormData,
  flows,
  validateField,
  type ChatFlow,
} from '@/lib/enquiry/chat-flow';
import {
  MACHINE_FIELDS as MACHINE_FIELD_NAMES,
  siteAssessmentSchema,
} from '@/lib/validation/enquiry';

/**
 * The chat flow asks the same questions the enquiry form asks, and submits
 * through the same Server Action. If the two ever drift — a renamed field, a
 * new enum value, a question quietly dropped — the chat starts sending payloads
 * the server rejects, and the visitor sees a dead end they cannot fix.
 *
 * These tests derive their expectations from the Zod schema itself, so the
 * schema stays the single source of truth and drift fails the build.
 */

/**
 * Fields the schema owns rather than the conversation: set by machine. Taken
 * from the schema module rather than restated, so the Server Action's idea of
 * "has no visible home on the form" and this one cannot drift apart.
 */
const MACHINE_FIELDS = new Set(MACHINE_FIELD_NAMES);

/** The schema's fields, indexable by name. */
function shapeOf(schema: { shape: object }): Record<string, z.ZodTypeAny> {
  return schema.shape as Record<string, z.ZodTypeAny>;
}

function dataFields(schema: { shape: object }): string[] {
  return Object.keys(shapeOf(schema)).filter((key) => !MACHINE_FIELDS.has(key));
}

function flowFields(flow: ChatFlow): string[] {
  return flow.steps.flatMap((step) => step.fields.map((field) => field.name));
}

/** An enum, whether or not it is wrapped in optional()/default(). */
function enumOf(fieldSchema: z.ZodTypeAny): z.ZodEnum<[string, ...string[]]> {
  let inner: z.ZodTypeAny = fieldSchema;
  while (inner instanceof z.ZodOptional || inner instanceof z.ZodDefault) {
    inner = inner instanceof z.ZodOptional ? inner.unwrap() : inner.removeDefault();
  }
  expect(inner).toBeInstanceOf(z.ZodEnum);
  return inner as z.ZodEnum<[string, ...string[]]>;
}

const CASES = [['commercial', siteAssessmentSchema, flows.commercial]] as const;

describe('the chat flow matches the enquiry schema', () => {
  it.each(CASES)(
    'the %s flow asks for exactly the fields the schema accepts',
    (_n, schema, flow) => {
      expect(flowFields(flow).sort()).toEqual(dataFields(schema).sort());
    },
  );

  it.each(CASES)('the %s flow asks each question only once', (_n, _schema, flow) => {
    const names = flowFields(flow);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(CASES)('%s step ids are unique', (_n, _schema, flow) => {
    const ids = flow.steps.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(CASES)('%s choice options are exactly the schema enum values', (_n, schema, flow) => {
    const choices = flow.steps
      .flatMap((step) => step.fields)
      .filter((field) => field.kind === 'choice');

    // Guard against a flow that has quietly lost all its choice fields.
    expect(choices.length).toBeGreaterThan(0);

    for (const field of choices) {
      const fieldSchema = shapeOf(schema)[field.name];
      expect(fieldSchema, `no schema field named "${field.name}"`).toBeDefined();
      const allowed = enumOf(fieldSchema!).options;
      expect(field.options?.map((option) => option.value)).toEqual([...allowed]);
    }
  });

  it.each(CASES)('%s fields the schema lets you skip are marked optional', (_n, schema, flow) => {
    for (const field of flow.steps.flatMap((step) => step.fields)) {
      expect(Boolean(field.optional), `field "${field.name}"`).toBe(
        shapeOf(schema)[field.name]?.isOptional(),
      );
    }
  });

  it.each(CASES)('no %s question mixes tap-to-answer with typed answers', (_n, _schema, flow) => {
    // The widget renders a step as either buttons or a form, never both, so a
    // step that mixed the two kinds would drop half its fields.
    for (const step of flow.steps) {
      const tap = step.fields.filter((f) => f.kind === 'choice' || f.kind === 'confirm').length;
      expect([0, step.fields.length], `step "${step.id}"`).toContain(tap);
    }
  });

  it.each(CASES)('every %s question has a prompt and every field a label', (_n, _schema, flow) => {
    for (const step of flow.steps) {
      expect(step.prompt.length, `step "${step.id}"`).toBeGreaterThan(0);
      for (const field of step.fields) {
        expect(field.label.length, `field "${field.name}"`).toBeGreaterThan(0);
      }
    }
  });

  it('asks what kind of site it is before asking where the site is', () => {
    const ids = flows.commercial.steps.map((step) => step.id);
    expect(ids.indexOf('property-type')).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf('property-type')).toBeLessThan(ids.indexOf('suburb'));
  });
});

describe('choice fields with no conditions withhold nothing', () => {
  it('offers every sector, regardless of earlier answers', () => {
    const field = flows.commercial.steps
      .flatMap((step) => step.fields)
      .find((f) => f.name === 'propertyType')!;
    expect(availableOptions(field, {})).toEqual(field.options);
  });
});

describe('there is exactly one flow', () => {
  it('offers exactly the flow that exists', () => {
    expect(Object.keys(flows)).toEqual(['commercial']);
  });

  it('opens on the flow’s first step rather than an audience question', () => {
    expect(flows.commercial.steps[0]?.id).not.toBe('audience');
    expect(flows.commercial.steps[0]?.fields.some((field) => field.name === 'formType')).toBe(
      false,
    );
  });
});

/* ------------------------------------------------------------------ */
/* Submission payload                                                  */
/* ------------------------------------------------------------------ */

const ANSWERS = {
  propertyType: 'aged-care-and-retirement',
  suburb: 'Chirnside Park VIC',
  name: 'Sam Taylor',
  phone: '0400 000 000',
  email: 'sam@example.com',
};

describe('buildEnquiryFormData produces a payload the server accepts', () => {
  it('builds a payload the schema parses', () => {
    const data = buildEnquiryFormData({
      formType: 'commercial',
      answers: ANSWERS,
      renderedAt: 1_700_000_000_000,
    });

    const parsed = siteAssessmentSchema.safeParse(Object.fromEntries(data));
    expect(parsed.success, JSON.stringify(parsed.error?.flatten().fieldErrors)).toBe(true);
  });

  it('carries the form type so the action picks the right schema', () => {
    const data = buildEnquiryFormData({ formType: 'commercial', answers: ANSWERS, renderedAt: 1 });
    expect(data.get('formType')).toBe('commercial');
  });

  it('sends an empty honeypot, as a real visitor would', () => {
    const data = buildEnquiryFormData({ formType: 'commercial', answers: ANSWERS, renderedAt: 1 });
    expect(data.get('referral_source')).toBe('');
  });

  it('stamps renderedAt so the timing check has something to measure', () => {
    const data = buildEnquiryFormData({
      formType: 'commercial',
      answers: ANSWERS,
      renderedAt: 1_700_000_000_000,
    });
    expect(data.get('renderedAt')).toBe('1700000000000');
  });

  it('omits a skipped answer rather than sending an empty string', () => {
    const data = buildEnquiryFormData({
      formType: 'commercial',
      answers: { ...ANSWERS, suburb: '' },
      renderedAt: 1,
    });
    expect(data.has('suburb')).toBe(false);
  });

  it('never invents an answer the visitor did not give', () => {
    const data = buildEnquiryFormData({
      formType: 'commercial',
      answers: { name: 'Sam Taylor' },
      renderedAt: 1,
    });
    expect([...data.keys()].sort()).toEqual(['formType', 'name', 'referral_source', 'renderedAt']);
  });
});

/* ------------------------------------------------------------------ */
/* Per-step validation                                                 */
/* ------------------------------------------------------------------ */

describe('validateField reuses the schema rules, so the chat cannot disagree with the server', () => {
  it('rejects a phone number that is too short', () => {
    expect(validateField('commercial', 'phone', '123')).toMatch(/8 digits/i);
  });

  it('accepts an Australian mobile written with spaces', () => {
    expect(validateField('commercial', 'phone', '0400 000 000')).toBeUndefined();
  });

  it('rejects an address that is not an email', () => {
    expect(validateField('commercial', 'email', 'sam@')).toMatch(/valid email/i);
  });

  it('rejects a suburb too short to be one', () => {
    expect(validateField('commercial', 'suburb', 'x')).toMatch(/suburb/i);
  });

  it('rejects an empty answer for a field the schema requires', () => {
    expect(validateField('commercial', 'name', '')).toBeDefined();
  });

  it('returns the schema message verbatim, not a paraphrase', () => {
    const viaSchema = siteAssessmentSchema.shape.name.safeParse('a');
    expect(validateField('commercial', 'name', 'a')).toBe(
      viaSchema.success ? undefined : viaSchema.error.issues[0]?.message,
    );
  });
});

describe('the honeypot is carried through, not synthesised', () => {
  it('passes a bot-filled honeypot to the server so it is rejected there', () => {
    const data = buildEnquiryFormData({
      formType: 'commercial',
      answers: ANSWERS,
      renderedAt: 1,
      honeypot: 'http://spam.example',
    });
    expect(data.get('referral_source')).toBe('http://spam.example');
  });
});
