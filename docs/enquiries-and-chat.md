# Enquiries and the assessment chat

The site has one call to action: get a free site assessment. Two surfaces collect it, the form on
`/contact-us/` and the floating chat on every other page. Both post to the same Server Action and
are validated by the same Zod schema. It is one pipeline with two entrances.

## The enquiry

Refactored 21 September 2026. The form used to collect ten fields modelled as a booking request —
site region, on-site-vs-online, a street address, preferred times, notes and an organisation name —
enough to propose a specific calendar slot. None of that was reachable by an automation (see
[The n8n notification workflow](#the-n8n-notification-workflow)), and it was a long form for what the site
actually needed: a qualified lead to call back. It now collects five fields:

| Field                    | Type                                    | Rule                                 |
| ------------------------ | --------------------------------------- | ------------------------------------ |
| `propertyType`           | eight sectors plus `office` and `other` | Required                             |
| `suburb`                 | text, 2 to 100 chars                    | Suburb or area is enough             |
| `name`, `phone`, `email` | text                                    | Phone is permissive about AU formats |
| `formType`               | literal `commercial`                    | The only audience this site serves   |

Scheduling — on site in Melbourne or an online call, and when — is worked out on the callback, not
collected here. Schema: `lib/validation/enquiry.ts`. Option labels: `lib/enquiry/options.ts`. The
n8n notification workflow accepts exactly this payload.

## Anti-spam

Three layers, all in the Server Action `app/actions/enquiry.ts`:

1. **Honeypot.** `referral_source` is hidden from users. Any value fails validation.
2. **Minimum completion time.** `renderedAt` is stamped when the form renders. A submit under
   3 seconds is rejected as automated.
3. **Rate limit.** `lib/enquiry/rate-limit.ts`, 5 submissions per 10 minutes per client IP
   (`x-forwarded-for`). In-memory, so serverless instances do not share counts. It stops casual
   hammering. Before relying on it, move it to a shared store (Upstash Redis via the Vercel
   Marketplace).

The rate-limit and provider-error messages quote the phone number from `getSiteSettings()`, never
a literal, so they cannot disagree with the header.

### The honeypot must stay invisible to autofill

The honeypot was called `company_website`, with a "Company website" label, until 21 September 2026.
Chrome fills an off-screen field named that way from a saved address profile whatever
`autocomplete` says, and password managers do the same — so a real visitor's enquiry was rejected
by a check they could not see. Kane hit it on the live form.

Two things changed, and both need keeping:

- **The name is outside autofill's vocabulary.** Browsers and password managers match on tokens
  like `company`, `organization`, `website`, `url`, `name`, `email`, `tel`, `address`.
  `referral_source` matches none of them, and the label no longer names a real-world thing. The
  input also carries `data-1p-ignore`, `data-lpignore` and `data-form-type="other"`, the documented
  opt-outs. **Never rename this field to something a browser recognises.**
- **A hidden-field failure never tells a visitor to check their highlighted fields.** No form
  renders an error against `referral_source`, `renderedAt` or `formType` — they are listed as
  `MACHINE_FIELDS` in `lib/validation/enquiry.ts`. When a rejection is confined to them the Server
  Action returns the phone number instead, because "check the highlighted fields" highlights
  nothing and leaves the visitor stuck on a form where every answer is already correct. It costs
  the honeypot some opacity — a bot reading the reply can tell an invisible check from a field
  error — and that is the cheaper trade: the bots this catches fill every input and never read the
  reply, while a lead that cannot get through is lost for good.

Regression tests: `tests/unit/enquiry-action.test.ts` (both branches) and the autofill walk-through
in `tests/e2e/critical-flows.spec.ts`.

## Delivery

`lib/enquiry/transport.ts` defines an `EnquiryTransport` with three implementations, selected by
`ENQUIRY_TRANSPORT`:

| Adapter   | Selected by                                                                                  | Behaviour                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `console` | default                                                                                      | Logs `formType`, `propertyType` and a field count. Delivers nothing. Returns `delivered: false, reason: 'not-configured'`. |
| `resend`  | `ENQUIRY_TRANSPORT="resend"` plus `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL` | POSTs a plain-text email to the Resend API. Subject names the contact and the sector.                                      |
| `n8n`     | `ENQUIRY_TRANSPORT="n8n"` plus `N8N_ENQUIRY_WEBHOOK_URL`                                     | POSTs the five fields as JSON to the notification workflow, which emails the office through Gmail. Ten-second deadline.    |

The UI is honest about the result. With the console adapter, a valid submission shows "Your details
passed validation, but were not sent" and the phone number. With `delivered: true` it says the
enquiry is with the team and they will call to arrange a time. A provider error asks the visitor to
phone.

**Submitted content is never logged.** The console adapter redacts by construction. The Resend
adapter logs only the HTTP status on failure, because a response body can echo the submission.

### Production guard

Added 16 September 2026, after the incident below. When `VERCEL_ENV` is `production`,
`getEnquiryTransport()` wraps the selected adapter in `requireDelivery`. A transport that cannot
deliver — the console adapter, or a real adapter with any of its variables unset — is refused: the
result is `provider-error`, so the visitor is told to phone, and one line is written to the
function logs:

```
[enquiry] MISCONFIGURED: production cannot deliver enquiries. Set the delivery variables in Vercel Production and redeploy. { transport: 'console', missing: [ 'ENQUIRY_TRANSPORT=resend or n8n' ] }
```

What each adapter needs is declared once, in `REQUIRED_VARIABLES`, so a new transport cannot be
added without telling the guard how to check it.

It names the transport and the unset variable names, never values. Preview and local deployments
are untouched, so the console adapter and the e2e assertions about "not sent" still work there.
Search Vercel logs for `MISCONFIGURED` after any environment change. Unit tests:
`tests/unit/transport.test.ts`.

### Turning delivery on

In Vercel, Production scope, one of these two — then redeploy.

```
ENQUIRY_TRANSPORT=n8n
N8N_ENQUIRY_WEBHOOK_URL=...
```

```
ENQUIRY_TRANSPORT=resend
RESEND_API_KEY=...
ENQUIRY_TO_EMAIL=...
ENQUIRY_FROM_EMAIL=...
```

`n8n` works immediately: the workflow sends through a Gmail account that already has SPF and DKIM.
`resend` does not, yet. As of 14 September 2026 the brand domain publishes a DMARC record with
`p=quarantine` but has no SPF and no MX, so mail from it would be quarantined even with Resend
configured. Either add SPF and DKIM for the brand domain, or send from a domain that already has
them, or take the n8n route.

### Incident: nothing delivered from launch to 15 September 2026

On 15 September 2026 Kane submitted the live form on `/contact-us/` and saw "passed validation,
but were not sent". Production had run the console adapter since the first deploy on 10 September.
Every enquiry submitted in that window is unrecoverable: the console adapter logs a field count and
nothing else, by design. The production guard above exists so that this state can no longer be
quiet.

Configuration as of 16 September 2026: the Vercel CLI is installed on Kane's machine (59.5.0) but
logged out, and there is no `.vercel/` link, so production variables are still set through the
dashboard or after `vercel login` and `vercel link`. The receiving mailbox, sender address and
Resend API key were being put in place on 16 September; this section is to be updated with the
sender, the mailbox and the date of the first confirmed test delivery once that email has arrived.

## The assessment chat

`components/chat/assessment-chat.tsx`, loaded lazily by `assessment-chat-lazy.tsx` after the page
is idle. It is absent on `/contact-us/`, where the full form already is.

**It is scripted, not a chatbot.** `lib/enquiry/chat-flow.ts` holds the conversation as data: a
sequence of steps, each a field the enquiry schema accepts, with options drawn from the same enums.
A unit test checks the flow against the schema so a renamed field cannot leave the chat sending a
payload the server refuses. Since the 21 September 2026 field reduction it is three steps —
property type, suburb, contact details — down from seven. The one thing it can answer is the five
quick questions in `lib/enquiry/chat-faqs.ts`, each quoted verbatim from `content/faqs.ts`.

Behaviour verified by the unit suite: answers a published question without starting an enquiry,
refuses an answer the server would reject and says why, closes on Escape and returns focus, shows
every turn with motion switched off, and states plainly when nothing was delivered.

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

## The n8n notification workflow

`docs/automation/n8n-enquiry-notification.json`, described in `docs/automation/README.md`. Seven
nodes: an enquiry arrives by webhook, is checked, and is emailed to the office through Gmail. It
books nothing and promises nothing.

It replaced a 35-node booking workflow on 22 September 2026. That one ranked the client's preferred
times against four team calendars, held a slot and ran an approval round by email — all built on
the ten-field booking payload that the 21 September field reduction removed. It had never been run
and the site had never been able to reach it. It is in the git history if any of it is wanted back.

Unlike its predecessor, **the site can reach this one**: `lib/enquiry/transport.ts` has an `n8n`
adapter, selected by `ENQUIRY_TRANSPORT="n8n"` with `N8N_ENQUIRY_WEBHOOK_URL`.

Still to do before it delivers anything: import it, set the recipient in its `Settings` node, add a
Gmail OAuth2 credential, activate it, and put its production webhook URL into Vercel.

## Go-live checklist for enquiries

Two routes deliver. Pick one — `ENQUIRY_TRANSPORT` selects exactly one adapter.

**Route A — n8n and Gmail.** Nothing to do at the registrar, because it sends from an
already-authenticated Gmail account.

1. Import `docs/automation/n8n-enquiry-notification.json`, set `notifyEmail` in its `Settings`
   node, add the Gmail credential, activate.
2. Set `ENQUIRY_TRANSPORT=n8n` and `N8N_ENQUIRY_WEBHOOK_URL` in Vercel Production and redeploy.

**Route B — Resend.** Fewer moving parts, but blocked on DNS.

1. Verify the sending domain in Resend and add its DNS records at GoDaddy — the brand domain has no
   SPF and no MX, with DMARC `p=quarantine`, so mail from it is quarantined until that is fixed.
2. Set `ENQUIRY_TRANSPORT=resend` and the three `RESEND_*`/`ENQUIRY_*` variables in Vercel
   Production and redeploy.

Then, either way:

3. Submit a real test enquiry from the live site and confirm it arrives. Search the Vercel function
   logs for `MISCONFIGURED` if it does not.
4. Move the rate limiter to a shared store before any paid traffic.
5. File uploads remain unbuilt. The form says so rather than inviting an attachment. They need
   private storage plus server-side type and size validation.
