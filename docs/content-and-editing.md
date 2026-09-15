# Content and editing

The site publishes nothing it cannot evidence. That is a design rule, and the tests hold it. Before
adding a fact, a credential, a project or a review, find its source. If there is none, use a
placeholder (see below) rather than inventing a value.

## Where things live

| To change                                                                          | Edit                                                 | Notes                                                                                          |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Trading name, phone, email, address, ABN, coordinates, opening hours, social links | `lib/site.ts` (`site`)                               | Everything reads from here. Never retype a business fact elsewhere.                            |
| Who carries out assessments                                                        | `lib/site.ts` (`assessors`)                          | Named on the contact page. Currently Farbod, Zac, Simon.                                       |
| Vision, mission, values, ownership line                                            | `lib/site.ts` (`brand`)                              | Mission must start with "At Commercial Painters" (tested).                                     |
| Accreditations and badges                                                          | `lib/site.ts` (`accreditations`)                     | Only `verified: true` renders or reaches schema. Badges under `public/images/accreditations/`. |
| Contact page copy                                                                  | `lib/site.ts` (`defaultContactPage`)                 | The form itself is code.                                                                       |
| Services (five)                                                                    | `content/services.ts`                                | Which page a service links to is `servicePath()`.                                              |
| Sectors (eight)                                                                    | `content/sectors.ts`                                 | `legacyPath` is the page URL. `projectSlugs` is the evidence list.                             |
| Case studies (four)                                                                | `content/projects.ts`                                | `isFeatured` gates the featured grid. Images under `public/images/projects/`.                  |
| Blog posts (none yet)                                                              | `content/posts.ts`                                   | See "Publishing the first post".                                                               |
| Site photography galleries (seven)                                                 | `content/galleries.ts` + `media/photography/`        | See "Adding a photo shoot".                                                                    |
| Reviews                                                                            | `content/reviews.ts`                                 | Google reviews vs first-party reviews. See below.                                              |
| FAQs                                                                               | `content/faqs.ts`                                    | Four sets: `faqs`, `officeFaqs`, `tradeFaqs`, `homeFaqs`.                                      |
| Process and differentiators                                                        | `content/approach.ts`                                |                                                                                                |
| Council notes                                                                      | `content/councils.ts`                                | One note per council. The dataset build fails if a council has none.                           |
| Hand-written suburb copy, tier promotions, Queensland flag                         | `content/locations.overrides.ts`                     | See seo-and-indexation.md.                                                                     |
| Navigation                                                                         | `components/navigation/nav-data.ts`                  | Derived from sectors and posts.                                                                |
| Metadata for a page                                                                | that page's `generateMetadata` via `buildMetadata()` | Description is a required argument.                                                            |
| Chat quick answers                                                                 | `lib/enquiry/chat-faqs.ts`                           | Must match a question in `content/faqs.ts` exactly.                                            |
| What a model-backed chat may say                                                   | `docs/chat-knowledge-base.md`                        | Tested against `lib/site.ts` for drift.                                                        |

## Placeholders

`placeholder('note')` from `lib/content/types.ts` marks copy awaiting real input. Components render
it as an editorial marker in the `signal` amber palette, never as a fact. Use it for a project
duration or testimonial you do not have. Do not write a plausible value.

## Business facts

Fields marked `NEEDS-CLIENT-CONFIRMATION` in `lib/site.ts` are not rendered until supplied:

| Field                                 | State                                                 | Effect once set                                                                                                         |
| ------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `legalName`                           | Trading name stands in                                | Footer legal line and Organization `legalName`                                                                          |
| `abn`                                 | `null`                                                | Required for complete `LocalBusiness` schema                                                                            |
| `coords`                              | `null`                                                | A `GeoCircle` of 60 km around the base is added to `areaServed`. Geocode 1 Turbo Drive; do not use the suburb centroid. |
| `openingHours`                        | `null`                                                | `openingHoursSpecification` in schema                                                                                   |
| `social.instagram`, `social.facebook` | `null`                                                | `sameAs` links                                                                                                          |
| `email`                               | Set to the group inbox on the previous brand's domain | This is what currently fails `brand.test.ts`. A decision is pending.                                                    |

## Accreditations

Nine entries, all `verified: true`, confirmed by the client on 24 August 2026. Six carry a badge and
appear on the logo wall. The three personnel screening checks (Working with Children, police, NDIS
Worker Screening) have no badge because they are held per person, and are stated in words on the
about page. Two wording rules: the body is "Master Painters Australia", and the NDIS credential is a
"Worker Screening Check", not an accreditation.

Certificates of currency for insurance are not on file. A facilities manager will ask for them.

## Sectors

Each sector has hand-written `intro`, `considerations`, `body` and `faqs`. That depth is why every
sector page is indexable. `projectSlugs` decides whether the evidence block shows a project grid or
a placeholder stating the sector makes no experience claim. Healthcare has one project; the others
have none. A sector may also show a photo gallery when `content/galleries.ts` has a gallery with a
matching `sectorSlug`.

## Case studies

Four projects, every field transcribed from the business's records:

| Slug                                                          | Sector                                   | Suburb     |
| ------------------------------------------------------------- | ---------------------------------------- | ---------- |
| `emmaus-college-school-repaint-vermont`                       | education-and-childcare                  | Vermont    |
| `case-study-factory-exterior-painting-in-noble-park-victoria` | industrial                               | Noble Park |
| `ndis-commercial-painting`                                    | healthcare (11 offices across Melbourne) |            |
| `medical-clinic-fit-out-painting-newbay-medical-brighton`     | healthcare                               | Brighton   |

The Newbay Medical entry is thin and `isFeatured: false`, so it appears on its sector page and in
the sitemap but not in the featured grid on `/projects/`. Flip `isFeatured` once the record is
complete. Its cover photograph shows a van in the previous brand's livery.

None of the four has an attributable testimonial. Do not add one without the client's words.

## Publishing the first post

Add one entry to `content/posts.ts`. That single change:

- renders the post at `/blog/{slug}/` with `BlogPosting` schema
- flips `/blog/` from `noindex, follow` to `index, follow`
- adds `/blog/` and the post to the sitemap, with a real `lastModified`
- adds "Blog" to the header and footer navigation
- lists the post in `/llms.txt`

`body` is Markdown rendered without raw HTML. Keep `excerpt` under 300 characters and
`metaDescription` under 160. Posts publish as the business, not under an invented byline.

## Adding a photo shoot

1. Drop the photographer's JPEGs in `media/photography/<site folder>/`. This folder is gitignored
   and never deployed.
2. Add the site to the `SITES` allow-list in `scripts/build-gallery-images.mjs`. It is an
   allow-list, not a directory scan, so residential shoots stay out.
3. Run `npm run gallery:build`. It writes `public/images/gallery/<slug>/<slug>-NN.webp` (long edge
   1800px, quality 78) and `content/galleries.generated.json` (dimensions, blur placeholders,
   source file names).
4. Add the site to `SITES` in `content/galleries.ts` with a `sectorSlug`, a heading, a one-sentence
   description of what the photographs show, and a `cover` naming the lead frame by the
   photographer's file name.
5. Write an `ALT` entry per frame, keyed by the photographer's file name. Describe only what is in
   the frame. A frame with no alt entry is dropped, and `tests/unit/galleries.test.ts` fails.

Galleries are not case studies. They have no scope, coating system, duration or outcome, and their
copy may claim nothing the photograph does not show. Two delivered shoots are excluded because they
are private dwellings and this site is commercial-only.

Current galleries: Toyota dealership Croydon (14), BYD dealership Bayswater (11), 20 Christensen
Street Cheltenham (14), Our Lady of the Pines Primary School (5), Saint Bar (3), 2-4 Heather Street
South Melbourne (4), 47 Kinkora Road Hawthorn (3). 54 frames. One Toyota frame is excluded because
the previous brand's name and domain are legible on a van.

## Reviews

Two kinds live in `content/reviews.ts` and the distinction matters for Google policy:

- **Google reviews** (`firstParty: false`). Reproduced word for word from the Google Business
  Profile, attributed, linked back. Rendered in the review carousel. **Never** emitted as
  `aggregateRating`. Reviews that named the previous business were dropped rather than edited,
  because an edited quotation is not a quotation. Three remain.
- **First-party reviews** (`firstParty: true`). None yet. The first one switches `aggregateRating`
  on by itself.

`googleAggregate` records the profile's own figure (5.0 from 70, read 24 August 2026). It displays
as Google's figure, attributed. Re-read it off the profile when it drifts.

## FAQs and the chat

The chat's five quick answers in `lib/enquiry/chat-faqs.ts` are looked up in `content/faqs.ts` by
exact question text and quoted verbatim. Rename a question in one place and
`tests/unit/chat-faqs.test.ts` fails. `docs/chat-knowledge-base.md` reproduces the same five and
the business facts, and `tests/unit/chat-knowledge-base.test.ts` fails when they drift.

## Rules the tests enforce on content

| Rule                                                                                                  | Test                                               |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| The previous trading name appears nowhere: source, content, docs, tests, config, `public/` file names | `brand.test.ts`                                    |
| No residential or domestic claim anywhere                                                             | `no-residential.test.ts`                           |
| No Queensland address, phone, office or project claim while `qldPresence` is false                    | `qld-copy.test.ts`                                 |
| Every project's related slugs resolve, every sector's project slugs exist                             | `content-integrity.test.ts`                        |
| Every gallery frame has alt text, keyed by source file; every cover names a real frame                | `galleries.test.ts`                                |
| Meta descriptions end on a sentence or a word, not mid-word                                           | `meta-description.test.ts`                         |
| Every page has a title, description and canonical                                                     | `page-metadata.test.ts`                            |
| Chat quick answers and knowledge base match the FAQ corpus and `lib/site.ts`                          | `chat-faqs.test.ts`, `chat-knowledge-base.test.ts` |
| The Google figure is displayed as Google's and never marked up as the site's rating                   | `reviews.test.ts`, `schema.test.ts`                |
