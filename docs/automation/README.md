# Free site assessment → Google Meet booking (n8n)

`n8n-site-assessment-booking.json` is a complete n8n workflow. Import it with
**Workflows → … → Import from File**, or open a blank canvas, select everything
in the file, and paste.

## What it does

A booking arrives from the website. The workflow proposes a real time, holds it
in Google Calendar, and asks Kane, Farbod, Simon and Zac to take it. **Nothing
is promised to the client until one of them says yes.**

```
website form
   └─ triage ─────────────► junk            → 400, nothing else happens
      │                     on-site outside
      │                     Melbourne       → office is emailed, no booking
      ▼
   rank the client's preferred times against real free/busy for all four
      ▼
   ┌─ online  → hold 30 min + create a Google Meet link
   └─ on site → hold 90 min at the address, 45 min travel free either side
      ▼
   email all four: "who are you?" + "yes or no"
      ├─ first YES → client gets a calendar invite (Meet link or address)
      │              + a confirmation email; travel time blocked for on site
      ├─ a NO      → that person drops off, whoever is left is re-asked,
      │              the hold stays put
      └─ 6 hours   → hold released, office emailed. No time was ever given
         or all
         passed
```

## Before it will run

1. **`Team and settings` node** — the only node you should need to edit. Put the
   real work emails and calendar IDs in. **The four addresses in there are
   assumptions and need confirming.** Also set `holdCalendarId` (a shared "Site
   assessments" calendar is better than a personal one) and `officeEmail`.
2. **Credentials** — a Google Calendar OAuth2 credential on the four calendar
   nodes and the free/busy HTTP node, and a Gmail OAuth2 credential on the four
   Gmail nodes. The Google account must be able to write to the hold calendar
   and read free/busy on all four team calendars (in Google Workspace, share
   each calendar with at least "See only free/busy").
3. **Activate**, then copy the **production** webhook URL from the first node.

## Pointing the website at it

The workflow expects `POST` with the form fields as JSON:

```json
{
  "name": "Priya Raman",
  "organisation": "Eastwood Childcare Group",
  "email": "priya@example.com.au",
  "phone": "03 9123 4567",
  "siteRegion": "melbourne",
  "assessmentType": "online",
  "propertyType": "education-and-childcare",
  "siteAddress": "12 Cotham Road, Kew VIC 3101",
  "preferredTimes": "Tuesday morning, or Thursday after 2pm",
  "notes": "Sign in at reception."
}
```

Those are exactly the values in [lib/validation/enquiry.ts](../../lib/validation/enquiry.ts),
so an `Enquiry` can be posted as-is. The site has no webhook transport yet —
[lib/enquiry/transport.ts](../../lib/enquiry/transport.ts) ships `console` and
`resend` only. Adding one is a small adapter:

```ts
const n8nTransport: EnquiryTransport = {
  id: 'n8n',
  async send(enquiry) {
    const url = process.env.N8N_BOOKING_WEBHOOK_URL;
    if (!url) return { delivered: false, reason: 'not-configured' };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiry),
      });
      if (!response.ok) {
        console.error('[enquiry] booking webhook rejected', { status: response.status });
        return { delivered: false, reason: 'provider-error' };
      }
      return { delivered: true };
    } catch {
      console.error('[enquiry] booking webhook request failed');
      return { delivered: false, reason: 'provider-error' };
    }
  },
};
```

…returned from `getEnquiryTransport()` when `ENQUIRY_TRANSPORT === 'n8n'`.

## How the time gets chosen

`preferredTimes` is free text, so `Normalise the booking` reads it — weekday
names, "morning" / "afternoon", "after 2pm", "before Friday", "Thursday 10:30" —
and scores every working slot in the next fortnight against it. `Pick the slot
and who is free` then crosses that ranking with Google Calendar free/busy and
keeps the best slot at least one assessor can actually make, breaking ties
towards the slot more of the team could cover.

It is a heuristic, and it says so: the approval email always quotes the client's
own words back, so whoever confirms can see the request and move the event
before accepting if the match is poor.

## Things worth knowing

- **The client's words are never auto-parsed into a promise.** The hold is a
  `HOLD - …` event on one calendar with no attendees; the client sees nothing
  until someone confirms.
- **On-site is Melbourne-only**, mirroring the rule in `lib/validation/enquiry.ts`.
  Anything else is handed to the office rather than silently downgraded.
- **Travel time** (45 min each way, configurable) must be free *before* an
  on-site slot is offered, and is written to the assessor's own calendar once
  confirmed — never onto the client's invitation.
- **`maxRounds`** caps how many times a "no" may bounce. Default 4, i.e. once
  per person.
- The approval form asks who is answering because a single email goes to all
  four; n8n's approval webhook cannot tell you who clicked.

## Not covered

Reschedules and cancellations. If a client replies to the confirmation asking
to move it, that is a human job today — the workflow has no second entry point
for an existing booking.
