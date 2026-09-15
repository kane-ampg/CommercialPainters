# Commercial Painters — app documentation

Documentation for the Next.js site behind
[www.commercialpaintersau.com.au](https://www.commercialpaintersau.com.au/), the marketing site for
Commercial Painters, a commercial painting contractor based in Bayswater North, Melbourne.

The root [README.md](../README.md) is the quick-start. This folder is the reference: how the app is
built, how to change it, how it is deployed, what the tests hold in place, and how it got to where
it is. It was assembled on 14 September 2026 from the codebase and from the Claude Code sessions
that built and shipped it.

## At a glance

|            |                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| Live site  | `https://www.commercialpaintersau.com.au/` (apex 308-redirects to `www`)                                 |
| Repository | `github.com/kane-ampg/CommercialPainters`, branch `main`, **public**                                     |
| Hosting    | Vercel, Git-linked. A push to `main` is a production deploy.                                             |
| DNS        | GoDaddy                                                                                                  |
| Framework  | Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 3, Zod                                |
| Rendering  | Fully static. About 1,440 pages rendered at build time. No database, no admin.                           |
| Content    | Typed TypeScript under `content/` and `lib/site.ts`. Editing the site means editing those and deploying. |
| Search     | Indexed by Google since 14 September 2026 (homepage). 47 URLs in the sitemap.                            |
| Tests      | 43 Vitest files, 504 tests, plus Playwright e2e on desktop and mobile                                    |

## Documents

| Document                                                       | What it covers                                                                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [architecture.md](architecture.md)                             | Stack, route map, directory layout, data flow, rendering, brand assets                                              |
| [content-and-editing.md](content-and-editing.md)               | Where every piece of copy lives and how to change it safely                                                         |
| [enquiries-and-chat.md](enquiries-and-chat.md)                 | The booking form, the assessment chat, validation, anti-spam, delivery adapters, the n8n workflow                   |
| [seo-and-indexation.md](seo-and-indexation.md)                 | Indexation policy, the 47 URLs, sitemap, robots, llms.txt, structured data, Search Console, Google Business Profile |
| [deployment-and-environment.md](deployment-and-environment.md) | Vercel, domain and DNS, every environment variable, deploy runbook                                                  |
| [media-and-data-pipelines.md](media-and-data-pipelines.md)     | Gallery encoder, hero video encoder, the 1,387-suburb dataset, council audit                                        |
| [testing-and-quality.md](testing-and-quality.md)               | Commands, what each test guards, the one known failure, conventions                                                 |
| [history.md](history.md)                                       | Development log, reconstructed from every Claude Code session on this project                                       |
| [status-and-next-steps.md](status-and-next-steps.md)           | Where things stand, open decisions, and the recommended order of work                                               |

Existing documents that stay where they are:

- [automation/README.md](automation/README.md) — the n8n site-assessment booking workflow
- [chat-knowledge-base.md](chat-knowledge-base.md) — what a model-backed chat would be allowed to say
- [superpowers/specs/2026-09-10-commercial-painters-derivation-design.md](superpowers/specs/2026-09-10-commercial-painters-derivation-design.md) — how this site was derived from the previous build

## Running it

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Command                   | What it does                                                       |
| ------------------------- | ------------------------------------------------------------------ |
| `npm run dev`             | Development server                                                 |
| `npm run build`           | Production build (fails without a site origin, see deployment doc) |
| `npm start`               | Serve the production build                                         |
| `npm test`                | Vitest unit and component tests                                    |
| `npm run test:e2e`        | Playwright, against a production build on port 3100                |
| `npm run verify`          | lint, typecheck, format check, unit tests, production build        |
| `npm run gallery:build`   | Re-encode site photography from `media/photography/`               |
| `npm run locations:build` | Regenerate the suburb dataset                                      |

## Two things that look like bugs and are not

**Enquiries are not delivered until a provider is configured.** The default transport logs that a
submission happened and delivers nothing. The form then says so, plainly, and gives the phone number.
See [enquiries-and-chat.md](enquiries-and-chat.md).

**`NEXT_PUBLIC_NOINDEX="true"` locks a deployment out of search.** It switches on a `noindex` meta
directive, an `X-Robots-Tag` header, a `Disallow: /` robots.txt and a 404 on `/llms.txt`, all
together. Use it on preview hosts. Never set it in production. See
[seo-and-indexation.md](seo-and-indexation.md).

## A rule that applies to these docs

`tests/unit/brand.test.ts` scans every Markdown file under `docs/` for the previous trading name
and fails the build if it finds it. Do not write the old name, or any email address or domain that
contains it, into any file here. Refer to the group inbox as "the contact email in `lib/site.ts`".
