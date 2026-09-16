# Architecture

## Stack

| Layer      | Choice                                                                  | Notes                                                                                                   |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16, App Router                                                  | Read `node_modules/next/dist/docs/` before writing code. This version differs from older training data. |
| UI         | React 19, TypeScript (strict, `noUncheckedIndexedAccess`)               |                                                                                                         |
| Styling    | Tailwind CSS 3 with `@tailwindcss/typography`, `clsx`, `tailwind-merge` | Design tokens in `tailwind.config.ts`                                                                   |
| Validation | Zod 3                                                                   | One schema shared by client, server and chat                                                            |
| Motion     | GSAP (scroll reveal), CSS keyframes (chat)                              | Respects `prefers-reduced-motion`                                                                       |
| Markdown   | `react-markdown` + `remark-gfm`                                         | Blog post bodies, raw HTML disabled                                                                     |
| Analytics  | `@next/third-parties` Google Tag Manager                                | Renders nothing unless `GTM_ID` is set                                                                  |
| Testing    | Vitest + Testing Library (jsdom), Playwright                            |                                                                                                         |
| Hosting    | Vercel                                                                  | Static output, Node runtime for the one Server Action                                                   |

There is no database, no CMS, no API layer and no authentication. The previous build carried a
Supabase-backed editor at `/admin/*`; the derivation spec in `docs/superpowers/specs/` records how it
was removed and why `lib/content/source.ts` was kept as the seam a data source could later sit behind.

## Route map

Everything public lives in the `app/(site)/` route group so the public site owns its root layout.
`experimental.globalNotFound` in `next.config.ts` gives unmatched URLs a styled 404 despite that.
Every URL ends in a trailing slash (`trailingSlash: true`).

| Route                                       | Source                                | Built | Indexable               |
| ------------------------------------------- | ------------------------------------- | ----- | ----------------------- |
| `/`                                         | `app/(site)/page.tsx`                 | 1     | yes                     |
| `/commercial/`                              | `app/(site)/commercial/page.tsx`      | 1     | yes                     |
| `/office-painters/`                         | `app/(site)/office-painters/page.tsx` | 1     | yes                     |
| `/trade-services/`                          | `app/(site)/trade-services/page.tsx`  | 1     | yes                     |
| `/about-us/`                                | `app/(site)/about-us/page.tsx`        | 1     | yes                     |
| `/contact-us/`                              | `app/(site)/contact-us/page.tsx`      | 1     | yes                     |
| `/projects/`                                | `app/(site)/projects/page.tsx`        | 1     | yes                     |
| `/projects/[slug]/`                         | `app/(site)/projects/[slug]/page.tsx` | 4     | yes                     |
| `/[sector]/` (e.g. `/healthcare-painters/`) | `app/(site)/[sector]/page.tsx`        | 8     | yes                     |
| `/areas/`                                   | `app/(site)/areas/page.tsx`           | 1     | yes                     |
| `/areas/[state]/`                           | `app/(site)/areas/[state]/page.tsx`   | 2     | Victoria only           |
| `/areas/[state]/[region]/`                  | `.../[region]/page.tsx`               | 22    | 9 Victorian only        |
| `/areas/[state]/[region]/[suburb]/`         | `.../[suburb]/page.tsx`               | 1,387 | 17                      |
| `/blog/`                                    | `app/(site)/blog/page.tsx`            | 1     | only once a post exists |
| `/blog/[slug]/`                             | `app/(site)/blog/[slug]/page.tsx`     | 0     |                         |
| `/sitemap.xml`                              | `app/sitemap.ts`                      |       |                         |
| `/robots.txt`                               | `app/robots.ts`                       |       |                         |
| `/llms.txt`                                 | `app/llms.txt/route.ts`               |       |                         |
| `/opengraph-image`                          | `app/(site)/opengraph-image.tsx`      |       |                         |
| `/favicon.ico`, `/icon`, `/apple-icon`      | `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` | | Static files, see scripts/build-icons.mjs |
| `/brand/logo.png`                           | `app/brand/logo.png/route.tsx`        |       |                         |

Sector pages sit at the root, one dynamic segment serving all eight. Static routes take precedence
and anything unmatched is a real 404 (`dynamicParams = false`). The sector URLs are the
`legacyPath` values in `content/sectors.ts`:

```
/education-and-childcare-painting-melbourne/
/healthcare-painters/
/aged-care-and-retirement-painting/
/body-corporate-and-real-estate-painting-melbourne/
/retail-painting/
/hospitality-painters-in-melbourne/
/leisure-and-sports-painting/
/industrial-painting-melbourne/
```

Of the five service lines, two have their own page (office painting at `/office-painters/`,
builders and head contractors at `/trade-services/`). Interior, exterior and protective coatings
are sections of `/commercial/`. `servicePath()` in `content/services.ts` is the one mapping.

## Directory layout

```
app/
  (site)/                Public site, its own root layout, template.tsx for page transitions
  actions/enquiry.ts     The only Server Action. Exports async functions only.
  favicon.ico icon.png apple-icon.png  Favicons, built from the APMG logo (npm run icons:build)
  brand/logo.png/        Organization.logo as a PNG, also drawn at build time
  sitemap.ts robots.ts llms.txt/  Generated, honouring the noindex rules
  global-not-found.tsx   Styled 404 for URLs matching no route
  globals.css            Tailwind layers, keyframes (prefixed cp-), skip link
components/
  layout/                Header, footer, wordmark
  navigation/            Desktop nav, mobile drawer, breadcrumbs, nav-data.ts (the menu as data)
  forms/                 Field primitives with mandatory labels, the booking form, form status
  chat/                  The site assessment chat and its lazy wrapper
  media/                 ContentImage, HeroReel, PhotoCarousel, CarouselControls, use-carousel.ts
  sections/              Page sections: hero, grids, FAQ list, CTA band, review carousel, work gallery
  pages/                 Article renderers for projects and posts
  seo/json-ld.tsx        JSON-LD script renderer
  analytics/             The GTM opt-in
  providers/             SiteSettingsProvider for client components
  motion/                ScrollReveal (GSAP) and InView
  icons/ ui/             Icon sets and UI primitives (Container, Section, Card, Prose, ...)
content/                 Typed content. The only place copy lives. See content-and-editing.md
lib/
  site.ts                Canonical business facts, env-derived config. Single source of truth.
  content/source.ts      The async content adapter every page reads through
  content/types.ts       Content models
  seo/metadata.ts        buildMetadata() and metaDescription()
  schema/index.ts        JSON-LD builders
  validation/enquiry.ts  The Zod booking schema
  enquiry/               Transport adapter, rate limiter, form state, chat flow, chat FAQs, options
  locations/ geo/        The suburb model: tiers, regions, indexability, haversine distance
  brand/og-fonts.ts      Fonts and hex colours for every next/og renderer
  nav/active.ts          Current-page marking
scripts/                 Offline build tools. See media-and-data-pipelines.md
tests/unit/ tests/e2e/   Vitest and Playwright
media/                   Gitignored masters: hero video, photography. Never deployed.
public/                  Committed web assets: encoded video, gallery WebP, project and company photos, badges, OG fonts
docs/                    This documentation, the n8n workflow, the chat knowledge base, the derivation spec
```

## Data flow

```
content/*.ts  ──►  lib/content/source.ts (async)  ──►  pages (server components)
lib/site.ts   ──►  defaultSiteSettings  ──►  getSiteSettings()  ──►  layout
                                                                   ├─► Header, Footer (props)
                                                                   └─► SiteSettingsProvider ──► client components
                                                                        (mobile menu, chat, forms)
```

Pages never import `content/*.ts` directly. They call `getProjects()`, `getSectors()`-style
functions on the adapter, which are async so a database can sit behind them later without a page
changing shape. The adapter is deliberately thin today.

Business facts flow one way from `lib/site.ts`. `getSiteSettings()` always resolves and never
throws, because the layout and the enquiry action both depend on it and the phone number must
always render. Client components read the settings through `SiteSettingsProvider` because they
cannot await.

`lib/site.ts` also resolves build-time configuration from the environment: `siteUrl`,
`noindexAll`, `gtmId`, `googleSiteVerification`. Those four are server-only by convention. Nothing
in the client graph reads them, and the file's comments explain the hydration mismatch that would
follow if something did.

## Rendering

Every page is prerendered. Dynamic segments export `generateStaticParams()` and set
`dynamicParams = false`. A production build emits about 1,440 HTML pages, most of them suburbs.

The client bundle is small on purpose. Client components are:

- the mobile menu drawer (`components/navigation/mobile-menu.tsx`)
- the assessment chat, loaded lazily and only after idle (`components/chat/`)
- the booking form, which uses `useActionState` against the Server Action
- the carousels (`use-carousel.ts` scroll-snap mechanics shared by photo and review carousels)
- ScrollReveal and InView
- SiteSettingsProvider

Everything else is a server component.

## Brand assets

**The wordmark is type, not an image.** `components/layout/wordmark.tsx` sets the two words in
Oswald with the brand's red rule. `app/brand/logo.png/route.tsx` draws the same lockup with
`next/og` at build time, reading fonts and hex values from `lib/brand/og-fonts.ts`. Rename the
business in `lib/site.ts` and both follow.

**The favicons are the APMG logo, not the wordmark.** `scripts/build-icons.mjs` renders
`public/images/company/favicon.webp` (white on transparent, 4:3) onto the ink ground as a square
and writes `app/favicon.ico` (16/32/48), `app/icon.png` (192) and `app/apple-icon.png` (180),
which Next picks up by file convention. Replace the webp and run `npm run icons:build`.

**Fonts.** Oswald (display) and Roboto (body), self-hosted and subset by `next/font` in the site
layout. No runtime font CDN request.

**Palette.** Tailwind tokens in `tailwind.config.ts`:

| Token    | Value                                       | Use                                                      |
| -------- | ------------------------------------------- | -------------------------------------------------------- |
| `ink`    | `#1C1C1C` and raised/soft/muted steps       | Dark surfaces and body text                              |
| `paper`  | `#FFFFFF`, sunken `#F5F5F5`, edge `#E3E3E4` | Light surfaces                                           |
| `brand`  | `#C8102E` at 600, with 50 to 900 steps      | The only accent. 600 is the floor for red text on white. |
| `signal` | amber steps                                 | Preview banners and "awaiting content" markers only      |

Two extra breakpoints are height-keyed: `short` (max-height 760px) and `tight` (short and narrow).
The homepage fold uses them to fit inside a laptop viewport.

**Hero reel.** `components/media/hero-reel.tsx` plays `public/video/hero-1080.mp4` or
`hero-720.mp4` depending on viewport, poster `public/images/hero/banner-poster.webp`. Encoded from a
gitignored master by `scripts/encode-hero-video.mjs`.

## Motion and accessibility conventions

- Skip link to `#main` first in the DOM. The chat sits outside `<main>` and last.
- Every form field has a visible label (`components/forms/fields.tsx` enforces it).
- Nothing is hidden while waiting on motion. Reduced motion shows everything at rest.
- Carousels render every frame into static HTML so they degrade without JavaScript, and keyboard
  arrows move exactly one slide.
- Contrast is held to WCAG floors (4.5:1 text, 3:1 UI) and the tokens are chosen to make that
  automatic.
