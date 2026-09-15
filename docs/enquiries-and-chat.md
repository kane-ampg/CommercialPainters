# Enquiries and the assessment chat

The site has one call to action: book a free site assessment. Two surfaces collect it, the form on
`/contact-us/` and the floating chat on every other page. Both post to the same Server Action and
are validated by the same Zod schema. It is one pipeline with two entrances.

## The booking

An enquiry is a booking request, not a quote request. It collects:

| Field                                    | Type                                           | Rule                                                                                                                                        |
| ---------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteRegion`                             | `melbourne`, `regional-victoria`, `interstate` | Required                                                                                                                                    |
| `assessmentType`                         | `onsite`, `online`                             | On-site is offered only when `siteRegion` is `melbourne`. Cross-field refinement in the schema, so neither surface can be talked around it. |
| `propertyType`                           | eight sectors plus `office` and `other`        | Required                                                                                                                                    |
| `siteAddress`                            | text, 3 to 200 chars                           | A suburb is enough for an online assessment                                                                                                 |
| `preferredTimes`                         | text, 3 to 500 chars                           | Two or three times                                                                                                                          |
| `notes`                                  | text, up to 1000 chars                         | Optional                                                                                                                                    |
| `organisation`, `name`, `phone`, `email` | text                                           | Phone is permissive about AU formats                                                                                                        |
| `formType`                               | literal `commercial`                           | The only audience this site serves                                                                                                          |

Schema: `lib/validation/enquiry.ts`. Option labels: `lib/enquiry/options.ts`. The n8n workflow
accepts exactly this payload.

## Anti-spam

Three layers, all in the Server Action `app/actions/enquiry.ts`:

1. **Honeypot.** `company_website` is hidden from users. Any value fails validation, and the
   failure looks identical to a normal validation error from outside.
2. **Minimum completion time.** `renderedAt` is stamped when the form renders. A submit under
   3 seconds is rejected as automated.
3. **Rate limit.** `lib/enquiry/rate-limit.ts`, 5 submissions per 10 minutes per client IP
   (`x-forwarded-for`). In-memory, so serverless instances do not share counts. It stops casual
   hammering. Before relying on it, move it to a shared store (Upstash Redis via the Vercel
   Marketplace).

The rate-limit and provider-error messages quote the phone number from `getSiteSettings()`, never
a literal, so they cannot disagree with the header.

## Delivery

`lib/enquiry/transport.ts` defines an `EnquiryTransport` with two implementations:

| Adapter   | Selected by                                                                                  | Behaviour                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `console` | default                                                                                      | Logs `formType`, `assessmentType` and a field count. Delivers nothing. Returns `delivered: false, reason: 'not-configured'`. |
| `resend`  | `ENQUIRY_TRANSPORT="resend"` plus `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL` | POSTs a plain-text email to the Resend API. Subject names the assessment type, person and organisation.                      |

The UI is honest about the result. With the console adapter, a valid submission shows "Your details
passed validation, but were not sent" and the phone number. With `delivered: true` it says the
request is with the team and a time will be confirmed by email. A provider error asks the visitor to
phone.

**Submitted content is never logged.** The console adapter redacts by construction. The Resend
adapter logs only the HTTP status on failure, because a response body can echo the submission.

### Turning delivery on

In Vercel, Production scope:

```
ENQUIRY_TRANSPORT=resend
RESEND_API_KEY=...
ENQUIRY_TO_EMAIL=...
ENQUIRY_FROM_EMAIL=...
```

Then redeploy. Before that works, the sending domain has to be verified in Resend, which means DNS
records at GoDaddy. As of 14 September 2026 the brand domain publishes a DMARC record with
`p=quarantine` but has no SPF and no MX, so mail from it would be quarantined even with Resend
configured. Either add SPF and DKIM for the brand domain or send from a domain that already has
them.

**Whether production currently delivers is unconfirmed.** Nobody with access to this repository
can read the Vercel production environment (no Vercel CLI, no `.vercel/` link), and the only test
is to submit a real enquiry and see where it lands. This is the single most expensive thing to be
wrong about now that the site is indexed. Check it first.

## The assessment chat

`components/chat/assessment-chat.tsx`, loaded lazily by `assessment-chat-lazy.tsx` after the page
is idle. It is absent on `/contact-us/`, where the full form already is.

**It is scripted, not a chatbot.** `lib/enquiry/chat-flow.ts` holds the conversation as data: a
sequence of steps, each a field the booking schema accepts, with options drawn from the same enums.
A unit test checks the flow against the schema so a renamed field cannot leave the chat sending a
payload the server refuses. The one thing it can answer is the five quick questions in
`lib/enquiry/chat-faqs.ts`, each quoted verbatim from `content/faqs.ts`.

Behaviour verified by the e2e suite: answers a published question without starting a booking,
offers online-only outside Melbourne, refuses an answer the server would reject and says why,
closes on Escape and returns focus, shows every turn with motion switched off, and states plainly
when nothing was delivered.

### A model-backed chat was designed and not built

On 13 September 2026 a design was written for connecting the chat to the Claude API with abuse
safeguards: 10 prompts per conversation, 500 characters per message, 30 turns per IP per hour and
60 per day, a global daily spend ceiling, history capped to six turns, an opaque HttpOnly
conversation cookie keyed to a Redis store, a system prompt compiled from
`docs/chat-knowledge-base.md`, a deterministic price-pattern refusal, and graceful fallback to the
scripted flow when a limit trips or the API is down. Every gate would run before the model is
called.

Only one thing shipped: placeholder variables appended to the gitignored `.env.local` (`CHAT_MODE`,
`ANTHROPIC_API_KEY`, `CHAT_MODEL`, `CHAT_DAILY_USD_CEILING`, `CHAT_MAX_TURNS`,
`CHAT_MAX_TURNS_PER_IP_HOUR`, `CHAT_MAX_TURNS_PER_IP_DAY`). **Nothing reads them.** There is no
`app/api/chat/route.ts` and no `lib/chat/`. `CHAT_MODE` is left at `scripted`. The design is in the
session transcript of 13 September and in the knowledge base's answering rules. If it is picked up,
provision the Redis store through the Vercel Marketplace first and move the enquiry rate limiter onto
it at the same time.

## The n8n booking workflow

`docs/automation/n8n-site-assessment-booking.json` is a complete 35-node n8n workflow, described in
`docs/automation/README.md`. A booking arrives by webhook, is triaged, ranked against the four team
calendars' real free/busy, held in Google Calendar (30 minutes online with a Meet link, or 90
minutes on site with 45 minutes' travel either side), and one email asks Kane, Farbod, Zac and
Simon who will take it. Nothing is promised to the client until someone says yes.

State of it:

- It has **never been run**. An adversarial audit was started on 10 September and did not finish.
- The four team email addresses and the hold calendar ID in its `Team and settings` node are
  **assumptions** and need confirming.
- **The site cannot reach it.** There is no `n8n` transport in `lib/enquiry/transport.ts`. The
  automation README contains the small adapter that would add one, selected by
  `ENQUIRY_TRANSPORT="n8n"` with `N8N_BOOKING_WEBHOOK_URL`.
- Reschedules and cancellations are not covered.

## Go-live checklist for enquiries

1. Decide where enquiries land (an inbox, the n8n workflow, or both).
2. Verify the sending domain in Resend and add its DNS records at GoDaddy.
3. Set the four `ENQUIRY_*` and `RESEND_*` variables in Vercel Production and redeploy.
4. Submit a real test booking from the live site and confirm receipt.
5. Move the rate limiter to a shared store before any paid traffic.
6. File uploads remain unbuilt. The form says so rather than inviting an attachment. They need
   private storage plus server-side type and size validation.
