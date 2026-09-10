# Commercial Painters — derivation from the source build

**Date:** 2026-09-10
**Status:** Implemented in this repository.

## 1. What this is

A new site for **Commercial Painters** (commercialpainters.com.au), derived file-for-file from an
existing Next.js 16 commercial-painting build. Everything about how the site looks and behaves is
carried across unchanged: the Oswald/Roboto typography, the black-and-red palette, square corners,
every component, every page, every motion decision, the enquiry pipeline, the 1,387-suburb VIC + QLD
service-area model, the photography, the hero reel and the accreditation badges.

Two things are removed on purpose, and this document records how.

## 2. The headless CMS is removed

The source build carried a Supabase-backed editor at `/admin/*` with magic-link auth, an AI assist,
a media library, cross-deployment revalidation and a two-project deployment model keyed off
`NEXT_PUBLIC_APP_ROLE`. None of it ships here.

**Removed:** `app/admin/**`, `app/api/revalidate`, `app/actions/{ai,auth,content,media}.ts`,
`components/admin/**`, `lib/{admin,ai,auth,supabase,revalidate,media}/**`,
`lib/content/{schemas,form-fields,tags}.ts`, `lib/app-role.ts`, `proxy.ts`, `supabase/**`,
`scripts/seed-cms.mjs`, the matching unit and e2e tests, and the `@supabase/*`,
`@anthropic-ai/sdk` and `sharp` dependencies (Next bundles its own `sharp` for image optimisation).

**Kept, simplified:** `lib/content/source.ts` remains the seam every page reads through. It is now a
thin async adapter over `content/*.ts` with the same function signatures, so no page changed shape
and a data source can still be put behind it later. `getSiteSettings()` returns
`defaultSiteSettings` from `lib/site.ts`; `getPage('contact-us')` returns `defaultContactPage`.
`SiteSettingsProvider` still hands the settings to client components — it exists because client
components cannot await, not because of the CMS.

**Added:** `content/posts.ts`, an empty typed array, so the blog has a place for posts to live.

**Renamed:** `CmsImage` → `ContentImage` (`components/media/content-image.tsx`). Same component;
the name described a data source that no longer exists.

**Re-keyed:** the editor deployment's four-layer noindex lockdown (meta robots, `X-Robots-Tag`,
robots.txt, llms.txt 404) becomes a plain staging flag, `NEXT_PUBLIC_NOINDEX="true"`. Off unless
set to exactly that string, so a typo fails safe. `tests/unit/noindex-flag.test.ts` asserts all four
layers switch together.

**Dropped:** the `/areas/painters-{suburb}/` legacy redirects and their test. Those URLs were the
source build's WordPress predecessor; a new domain has none.

The `(site)` route group and `experimental.globalNotFound` stay. The route group now exists only so
the public site owns its root layout, and `global-not-found` is still the documented way to give a
URL that matches no route a styled 404 when the root layout lives in a group.

## 3. The previous brand is removed

Every string, file name, code identifier and comment naming the previous business is gone, and
`tests/unit/brand.test.ts` scans source, content, docs, tests, config and `public/` file names to
keep it that way. The regex in that test is assembled from two halves so the test file cannot itself
be the match.

### Business facts (`lib/site.ts`)

| Fact                    | Decision                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Trading name            | **Commercial Painters**, everywhere.                                                                       |
| Legal name              | Set to the trading name, marked `NEEDS-CLIENT-CONFIRMATION`. Only the footer legal line and schema use it. |
| Phone, address, founded | Kept. Treated as the same business under a new trading name; the address is also the geographic anchor the |
|                         | whole service-area dataset is measured from.                                                               |
| Email                   | `info@commercialpainters.com.au`, from the stated domain.                                                  |
| Instagram, Facebook     | `null`. The previous URLs spelled the previous brand.                                                      |
| Google profile          | Kept — it carries the reviews figure and the `sameAs` link. Flagged: its registered name and address must  |
|                         | match this site before go-live.                                                                            |
| Brand statements        | Group name, descriptor and alternate names removed. Vision, mission and values kept; the mission names     |
|                         | Commercial Painters.                                                                                       |
| Accreditations          | Kept verbatim, including badges. `evidence` provenance reworded to "client confirmed".                     |

### Copy and metadata

- Page titles: the brand suffix becomes `| Commercial Painters`. Where the page's own keyword already
  _is_ the brand (the /commercial/ hub, Victorian region and suburb pages), the suffix becomes a
  descriptive phrase instead so titles do not read "Commercial Painters X | Commercial Painters".
- The homepage title stays brand-led (`Commercial Painters | Melbourne Commercial Painting Contractor`)
  and /commercial/ keeps `Commercial Painters Melbourne` as its target, so the two do not compete.
- Where prose named the business as a subject ("X attends every site…", "X services Brighton…") it
  now names Commercial Painters. Where it described a possessive fact ("X's mobilisation time",
  "X's own suburb") it now says "the business". Alt text drops the brand adjective ("A painter…").
- **Reviews.** Four of the seven Google reviews and the Noble Park testimonial quote the previous
  name. A quotation cannot be edited and remain a quotation, so those five are dropped. Three
  Google reviews remain; the testimonial becomes a labelled placeholder. The review wall's footnote
  now states the count it actually shows.

### Assets

- The two logo files are removed. The mark is now **typeset**: `components/layout/wordmark.tsx`
  sets the two words in Oswald with the brand's red rule, in `ink` and `white` tones, matching the
  lockup the OG card already used. Header and footer use it.
- `app/icon.tsx` and `app/apple-icon.tsx` draw the "CP" monogram at build time with `next/og`.
  `app/brand/logo.png/route.tsx` draws the stacked lockup as a 512px PNG for
  `Organization.logo`. `lib/brand/og-fonts.ts` is the one place all four renderers get their fonts
  and hex colours from.
- Company photographs are kept and renamed (`crew-onsite`, `fleet-depot`, `team-lineup`,
  `van-street`). Their alt text describes what is in frame without naming a brand. They still show
  the previous signage and should be replaced when new photography exists.
- The hero reel and poster are kept unchanged.
- CSS keyframes prefixed with the previous name are now prefixed `cp-`.

## 4. What did not change

Everything else. In particular: `tailwind.config.ts` values, `app/globals.css` rules, every
component under `components/`, the enquiry validation and transport, the chat flow, the locations
model and its generated dataset, the sector and service content, the FAQ corpus, the structured-data
rules and the tests that enforce them.

## 5. Verification

`npm run verify` (lint → typecheck → format check → unit tests → production build) and the
Playwright suite, both green, plus a repository-wide search for the previous name returning nothing.
