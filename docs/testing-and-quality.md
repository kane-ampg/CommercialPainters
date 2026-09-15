# Testing and quality

## Commands

| Command                           | Runs                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `npm test`                        | Vitest, `tests/unit/**/*.test.{ts,tsx}`, jsdom                                                                 |
| `npm run test:watch`              | Vitest in watch mode                                                                                           |
| `npm run test:e2e`                | Playwright, `tests/e2e/*.spec.ts`, desktop Chrome and Pixel 7, against `next start` on port 3100 (build first) |
| `npm run lint`                    | ESLint (`eslint-config-next`, Prettier conflicts disabled)                                                     |
| `npm run typecheck`               | `tsc --noEmit`, strict with `noUncheckedIndexedAccess`                                                         |
| `npm run format` / `format:check` | Prettier with the Tailwind class-sorting plugin                                                                |
| `npm run verify`                  | lint, typecheck, format check, unit tests, production build, in that order                                     |

`server-only` is aliased to a no-op stub in `vitest.config.ts` so server modules can be unit
tested.

## Current state

As of 14 September 2026:

|                        |                                              |
| ---------------------- | -------------------------------------------- |
| Unit                   | 43 files, 504 tests, **503 pass, 1 fail**    |
| E2E                    | 65 tests, last full run green (13 September) |
| Lint, typecheck, build | Clean                                        |

**The one failure** is `brand.test.ts`, "appears in no source, content, doc, config or test file".
The contact email in `lib/site.ts` is the group inbox on the previous brand's domain, and the same
address is transcribed in `docs/chat-knowledge-base.md` and the derivation spec. The test is
correct: it was written to catch exactly this. It has been red since the email was changed on
10 September and needs a business decision, not a code fix. Either the address becomes one on the
new brand's domain, or the guard is consciously relaxed for that one string. Until then
`npm run verify` is red and cannot gate deploys.

## What the unit tests guard

Grouped by what would go wrong without them.

**Brand and honesty**

| Test                          | Guards                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `brand.test.ts`               | Previous trading name absent from the whole repository and from `public/` file names. Mission and values stated one way. |
| `no-residential.test.ts`      | No residential or domestic claim on a commercial-only site                                                               |
| `qld-copy.test.ts`            | No Queensland presence claim while `qldPresence` is false                                                                |
| `reviews.test.ts`             | Google figure displayed as Google's, quotes unedited                                                                     |
| `chat-knowledge-base.test.ts` | The knowledge base matches `lib/site.ts` and the quick questions                                                         |
| `approach.test.ts`            | Differentiators and process copy stay within what is evidenced                                                           |

**Business facts and settings**

| Test                                   | Guards                                                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `site-settings.test.ts`                | Settings derive from `site`, phone href and international form are correct, address effective-month logic |
| `site-url.test.ts`                     | Origin resolution, empty-string handling, production failure without an origin                            |
| `gtm-id.test.ts`, `analytics.test.tsx` | Blank means nothing renders; a container renders once                                                     |
| `search-console-verification.test.ts`  | Token renders a tag when set, no tag when unset                                                           |
| `noindex-flag.test.ts`                 | All four lockdown layers switch together                                                                  |

**Indexation and SEO**

| Test                                                                          | Guards                                                                                                                      |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `sector-indexation.test.ts`                                                   | All eight sectors indexable and in the sitemap                                                                              |
| `area-hub-indexation.test.ts`                                                 | State and region hubs follow `stateIsIndexable`; the sitemap never lists a noindex hub, including after `qldPresence` flips |
| `blog-indexation.test.ts`                                                     | Blog index, sitemap entry and nav slots all derive from post count                                                          |
| `locations-tiers.test.ts`, `locality-pages.test.ts`, `locations-data.test.ts` | Tier rules, 17 indexable suburbs, dataset shape and total                                                                   |
| `tier1-councils.test.ts`, `council-overrides.test.ts`, `councils.test.ts`     | Every indexable page states the verified council; the three corrected councils stay corrected                               |
| `regions.test.ts`, `geo.test.ts`                                              | Region definitions, sentence forms, haversine                                                                               |
| `page-metadata.test.ts`, `meta-description.test.ts`                           | Every page has title, description, canonical; descriptions cut cleanly                                                      |
| `schema.test.ts`, `json-ld.test.tsx`                                          | No aggregateRating from Google, canonical phone, areaServed shape, verified accreditations only                             |

**Content integrity**

| Test                                                  | Guards                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `content-integrity.test.ts`, `content-source.test.ts` | Slugs resolve, adapter returns what the files hold                       |
| `galleries.test.ts`                                   | Alt keyed by source file, every frame described, covers name real frames |
| `content-image.test.tsx`                              | Dimensions and blur placeholder used when present                        |

**Enquiries and chat**

| Test                                                                 | Guards                                                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `validation.test.ts`                                                 | Schema rules including on-site Melbourne-only                                             |
| `enquiry-action.test.ts`                                             | Honeypot, timing check, rate limit, transport results and messages                        |
| `rate-limit.test.ts`                                                 | Window and count behaviour with an injectable clock                                       |
| `transport.test.ts`                                                  | Console adapter delivers nothing and redacts; Resend adapter unconfigured and error paths |
| `assessment-form.test.tsx`, `form-accessibility.test.tsx`            | Labels, errors, accessible names                                                          |
| `chat-flow.test.ts`, `chat-faqs.test.ts`, `assessment-chat.test.tsx` | Flow matches the schema, answers are verbatim, component behaviour                        |

**Navigation and UI**

| Test                                         | Guards                                                     |
| -------------------------------------------- | ---------------------------------------------------------- |
| `mobile-menu.test.tsx`, `nav-active.test.ts` | Drawer behaviour, current-page marking                     |
| `carousel.test.ts`                           | Scroll-snap mechanics shared by photo and review carousels |

## What the e2e tests cover

`tests/e2e/critical-flows.spec.ts`: mobile menu opens and closes on Escape and is a full-height
sidebar; `/commercial/` targets the commercial query and the homepage does not compete; every page
has one h1; the service grid renders a card per service; Open Graph image present; a case study
opens with its detail; the booking form rejects invalid data with accessible errors, offers on-site
in Melbourne only, and states plainly when nothing was delivered; the chat is absent on the contact
page, answers a published question, offers online-only outside Melbourne, walks a booking, refuses
what the server would reject, closes on Escape, and shows everything under reduced motion;
robots.txt and sitemap.xml are valid; an unknown route is a real 404; a suburb page serves at its
nested URL.

`blog.spec.ts`: the empty blog is linked from nowhere, noindex, absent from the sitemap; a published
blog is the reverse. `contact.spec.ts`: one phone number, matching the header and its tel link.
`wayfinding.spec.ts`: the menu marks the current page.

## Conventions worth keeping

- **Comments explain why, not what.** Most modules open with the decision they encode and the
  failure that motivated it. Keep that habit; it is how the next person avoids re-learning.
- **Numbers that must agree are derived, not duplicated.** `tel:` from the display number,
  international form from the same, region counts from `REGIONS`, indexability from tier.
- **Guards are assembled so the test file does not contain the string it forbids.**
- **Nothing is hidden while waiting on motion.**
- **Server-only modules import `server-only`.** Anything the client graph touches (`lib/site.ts`
  is in it via the mobile menu and chat) must not throw at module scope.
- **Prettier runs on docs.** Run `npm run format` after editing Markdown here.
- **The brand test reads `docs/**/*.md`.** Do not write the previous brand's name into any doc.
