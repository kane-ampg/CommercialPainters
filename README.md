# Commercial Painters — website

The Next.js site for [commercialpaintersau.com.au](https://commercialpaintersau.com.au): a commercial
painting contractor working across metropolitan Melbourne and listing South East Queensland as an
area served.

Fully static. Every page is rendered at build time from typed TypeScript content under `content/`
and `lib/site.ts`. There is no database and no admin — editing the site means editing those files
and deploying.

---

## Read this first

Two things about this build are deliberate and easy to mistake for bugs.

**1. Enquiries are not delivered until a provider is configured.** The app ships a transport
adapter whose default implementation delivers nothing and says so. Submit a form and you get:
_"Your details passed validation — but were not sent."_ See [Enquiry delivery](#enquiry-delivery).

**2. `NEXT_PUBLIC_NOINDEX="true"` locks a deployment out of search.** It turns four layers on
together — a `noindex, nofollow` robots directive on every page, an `X-Robots-Tag` response header,
a `Disallow: /` robots.txt and a 404 on `/llms.txt`. Use it on any preview host. Leave it unset in
production.

---

## Running it

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Command             | What it does                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Development server                                              |
| `npm run build`     | Production build                                                |
| `npm start`         | Serve the production build                                      |
| `npm run lint`      | ESLint                                                          |
| `npm run typecheck` | `tsc --noEmit`                                                  |
| `npm run format`    | Prettier, writing changes                                       |
| `npm test`          | Vitest unit and component tests                                 |
| `npm run test:e2e`  | Playwright end-to-end tests (builds and serves on port 3100)    |
| `npm run verify`    | lint → typecheck → format check → unit tests → production build |

---

## How it is put together

```
app/
  (site)/               The public site. Static. Its own root layout
    [sector]/           Sector pages at the root (/healthcare-painters/ and so on)
    areas/[state]/      VIC + QLD state, region and suburb hubs
    projects/[slug]/    Case studies
    blog/[slug]/        Posts, from content/posts.ts
  actions/enquiry.ts    Server Action — exports only async functions
  icon.tsx apple-icon.tsx   Favicons, drawn at build time in brand colours
  brand/logo.png/       The logo as a file, for structured data
  sitemap.ts robots.ts llms.txt/  Generated, excluding noindex URLs
components/
  layout/               Header, footer, and the typeset wordmark
  forms/                Field primitives with mandatory labels, plus the booking form
  navigation/           Desktop nav, mobile drawer (the only client component in the header)
  sections/ ui/         Presentation, no content
  seo/                  JSON-LD renderer
content/                Typed content modules — the only place copy lives
lib/
  site.ts               Canonical business facts. Single source of truth.
  content/source.ts     The content adapter every page reads through
  content/types.ts      Content models
  schema/               JSON-LD builders
  validation/           Zod schemas, shared client and server
  enquiry/              Transport adapter, rate limiter, form state
  locations/ geo/       The 1,387-suburb service-area model
tests/
  unit/                 Vitest
  e2e/                  Playwright
```

**`lib/site.ts` matters more than its size suggests.** The trading name, phone, email, address,
service area, accreditations and brand statements all live there, and every surface that states a
business fact imports from it. A unit test scans the whole repository for the previous trading name
so it cannot creep back in through a comment or a filename.

**The wordmark is type, not an image.** `components/layout/wordmark.tsx` sets the name in the
display face; `app/icon.tsx`, `app/apple-icon.tsx` and `app/brand/logo.png/route.tsx` draw the
same lockup with `next/og` at build time. Rename the business in `lib/site.ts` and all of them
follow.

**Content lives in typed TypeScript files under `content/`.** Projects, services, sectors, suburbs,
FAQs, reviews and posts. Pages never import them directly — they go through
`lib/content/source.ts`, which is async so a database can sit behind it later without a page
changing.

---

## Enquiry delivery

`lib/enquiry/transport.ts` defines an `EnquiryTransport` interface with two implementations:

| Adapter   | When it runs                       | Behaviour                                                                      |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| `console` | Default                            | Logs that a submission occurred. Delivers nothing. Returns `delivered: false`. |
| `resend`  | `ENQUIRY_TRANSPORT=resend` + a key | Sends via Resend.                                                              |

To switch on real delivery, set in `.env.local` (and in Vercel's environment variables):

```
ENQUIRY_TRANSPORT="resend"
RESEND_API_KEY="..."
ENQUIRY_TO_EMAIL="..."
ENQUIRY_FROM_EMAIL="..."
```

Submitted content is never logged. The console adapter records the form type and a field count —
no name, phone, email or free text.

### Still missing

- **Where enquiries should be delivered.** An address, and whether a CRM sits behind it.
- **File uploads.** The form is specified with an optional upload and does not ship one. It needs
  storage provisioned first, plus server-side type and size validation and a non-public bucket.
- **Shared-store rate limiting.** `lib/enquiry/rate-limit.ts` is in-memory, so serverless instances
  do not share counts. It stops casual hammering, which is what it is for, but it should move to
  Upstash Redis or Vercel KV before go-live.
- **Analytics.** `NEXT_PUBLIC_GTM_ID` and the CallRail script are blank.

---

## Business facts still to confirm

Everything marked `NEEDS-CLIENT-CONFIRMATION` in `lib/site.ts`, in order of how much it matters:

1. **Registered entity name.** The footer legal line and Organization `legalName` currently carry
   the trading name.
2. **Google Business Profile.** The `sameAs` link and the review figures point at the profile the
   business already holds. Its registered name and address must match this site before go-live.
3. **Social profiles.** Instagram and Facebook are `null` until profiles exist under this name.
4. **ABN.** Not published. Required for complete `LocalBusiness` schema.
5. **Coordinates and opening hours.** Both null; both emitted into schema only when populated.
6. **Photography.** The company and hero photographs carry the previous trading name's signage
   and are marked for replacement in their alt text's absence of a brand claim.

---

## Structured data rules

Held deliberately, and enforced by tests:

- No `aggregateRating` is emitted from Google reviews. The site displays the profile's figure as
  Google's, attributed and linked, and only first-party reviews the site itself hosts would ever be
  aggregated.
- The canonical phone number is used, never a dynamically inserted tracking number.
- Service area is Melbourne, with Victoria and three South East Queensland regions as `areaServed`.
  No Queensland address, phone number or project is claimed — see
  `content/locations.overrides.ts` and `tests/unit/qld-copy.test.ts`.
- Accreditations appear only once `verified: true`.

---

## Known gaps before this could go live

1. Business facts above.
2. Enquiry delivery configuration.
3. `SITE_URL` set to `https://commercialpaintersau.com.au`. The build fails rather than
   shipping localhost canonicals without it.
4. Submit the sitemap at `https://commercialpaintersau.com.au/sitemap.xml` in Search Console once
   live.

Nothing in this repository guarantees any particular search ranking.
