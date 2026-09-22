# Website enquiry → email (n8n)

`n8n-enquiry-notification.json` is a complete n8n workflow. Import it with
**Workflows → … → Import from File**, or open a blank canvas, select everything in the file, and
paste.

It does one thing: an enquiry arrives from the website, it is checked, and it is emailed to the
office. Nothing is booked, held, scheduled or promised.

```
website form or chat
   └─ POST /webhook/commercial-painters/enquiry
         ▼
      Settings            ← the only node you edit
         ▼
      Build the notification
         ├─ looks like an enquiry → Gmail → office mailbox → 200 { ok: true }
         └─ junk or a bot         → 400 { ok: false, errors: [...] }
```

Seven nodes. The previous version of this file was a 35-node booking workflow that ranked the
client's preferred times against four team calendars, held a slot, and ran an approval round by
email. It was never run, the site could never reach it, and the form it was built for no longer
exists — the enquiry was cut to five fields on 21 September 2026. It is in the git history if any
of it is ever wanted again.

## What it sends

The payload is the five fields the form collects, posted as JSON:

```json
{
  "name": "Priya Raman",
  "email": "priya@example.com.au",
  "phone": "03 9123 4567",
  "suburb": "Kew VIC",
  "propertyType": "education-and-childcare",
  "referral_source": ""
}
```

`propertyType` is the stored value; the workflow maps it to the label a human reads
("School or childcare") using the same table as
[lib/enquiry/options.ts](../../lib/enquiry/options.ts). `referral_source` is the honeypot — the
site rejects a filled one before it ever posts, and the workflow checks it again because a webhook
URL is public and the site is not the only thing that can call it.

The email that comes out:

```
Subject: Website enquiry - Priya Raman - School or childcare, Kew VIC

A new enquiry came in from the website.

Name:    Priya Raman
Phone:   03 9123 4567
Email:   priya@example.com.au
Suburb:  Kew VIC
Sector:  School or childcare

Received Monday 22 September 2026 at 9:15 am (Melbourne time).

They asked for a free site assessment, so the next step is a call to arrange
a time - on site in Melbourne, or a short online call anywhere else.

Reply to this email to answer Priya Raman directly, or call 03 9123 4567.
```

The reply-to is set to the enquirer, so replying answers the customer rather than the workflow.

## Before it will run

1. **`Settings` node** — the only node you should need to edit. Put the receiving mailbox in
   `notifyEmail`. It ships with the outreach address that `site.email` carries in
   [lib/site.ts](../../lib/site.ts); change it there if enquiries should land somewhere else.
2. **Credentials** — a Gmail OAuth2 credential on **Email the enquiry**. The account that
   authorises it is the account the notification is sent from, which is the point: it already has
   SPF and DKIM, so nothing depends on the brand domain's DNS.
3. **Activate**, then copy the **production** webhook URL from **Enquiry received**.

## Pointing the website at it

Set two variables in Vercel (Production scope) and redeploy:

```
ENQUIRY_TRANSPORT=n8n
N8N_ENQUIRY_WEBHOOK_URL=https://<your-n8n-host>/webhook/commercial-painters/enquiry
```

That is all — the adapter already exists, in
[lib/enquiry/transport.ts](../../lib/enquiry/transport.ts). It posts the JSON above, gives the
workflow ten seconds to answer, and treats anything else as a provider error, which shows the
visitor the "call us" message rather than a hung form.

On Vercel production the transport is wrapped in a guard: if `N8N_ENQUIRY_WEBHOOK_URL` is unset the
submission is refused and one line naming the missing variable is written to the function logs.
Search the logs for `MISCONFIGURED` after any environment change.

## Why n8n rather than Resend

Both adapters ship. `resend` sends directly and needs no n8n at all, but it cannot send from the
brand domain until that domain publishes SPF and DKIM — as of 14 September 2026 it had neither, and
a DMARC policy of `p=quarantine`, so its own mail would be quarantined. The n8n route sends through
an already-authenticated Gmail account, so it works today with no DNS changes.

Pick one. Both configured at once is not double delivery — `ENQUIRY_TRANSPORT` selects exactly one
adapter — but leaving the unused one's variables set is a trap for whoever reads the config next.

## Testing it

With the workflow active, post the sample payload straight at the webhook:

```bash
curl -X POST https://<your-n8n-host>/webhook/commercial-painters/enquiry \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Person","email":"you@example.com","phone":"0400 000 000","suburb":"Bayswater North VIC","propertyType":"office"}'
```

A `200 {"ok":true}` and an email in the office mailbox means it is working. A `400` returns the
list of what it objected to. Then submit the real form on `/contact-us/` and confirm that one
arrives too — the workflow answering curl proves the workflow; only the form proves the wiring.

## Not covered

Reschedules, cancellations, calendars, assignment and auto-replies to the customer. This workflow
notifies the office and stops. If an enquiry needs a booking, someone rings them.
