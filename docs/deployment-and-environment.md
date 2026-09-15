# Deployment and environment

## Where it runs

|                       |                                                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository            | `https://github.com/kane-ampg/CommercialPainters`, default branch `main`                                                                                                                  |
| Visibility            | **Public.** Created that way on 10 September 2026. Source, content and client-named photography are visible. `gh repo edit kane-ampg/CommercialPainters --visibility private` changes it. |
| Hosting               | Vercel, Git-linked to the repository. A push to `main` builds and deploys production.                                                                                                     |
| Production domain     | `www.commercialpaintersau.com.au`                                                                                                                                                         |
| Apex                  | `commercialpaintersau.com.au`, 308-redirects to `www`                                                                                                                                     |
| DNS                   | GoDaddy (`ns07/ns08.domaincontrol.com`)                                                                                                                                                   |
| Deployment protection | Off for production. Googlebot gets a 200.                                                                                                                                                 |
| CI                    | None. No `.github/`, no `vercel.json`, no `vercel.ts`. Vercel's own build is the only gate.                                                                                               |

There is no `.vercel/` link in this working copy and the Vercel CLI is not installed. Production
environment variables can only be seen in the Vercel dashboard. Installing the CLI
(`npm i -g vercel`, then `vercel link`) would enable `vercel env pull`, `vercel env add` and
`vercel logs`.

### DNS notes

- The `www` CNAME at GoDaddy points at the apex rather than at Vercel's project CNAME
  (`fde0558cc2d5696b.vercel-dns-017.com.`). It works because the apex A record reaches Vercel, but
  it pins the site to a hard-coded IP. Low urgency, worth tidying.
- A `google-site-verification` TXT record on `@` verifies the Search Console Domain property.
- The domain publishes `_dmarc` with `p=quarantine` but has no SPF and no MX record, so it cannot
  send or receive mail today. Relevant to enquiry delivery.

## Environment variables

All server-only unless marked. Nothing here except `NEXT_PUBLIC_NOINDEX` is ever inlined into the
browser bundle, and that one is inlined on purpose.

| Variable                      | Production value                          | Local value                  | Notes                                                                                                                                                                        |
| ----------------------------- | ----------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`                    | `https://www.commercialpaintersau.com.au` | `http://localhost:3000`      | Canonical origin for canonicals, sitemap, robots, JSON-LD. Set in Vercel as a Production-scope **Config** variable (not Secret, not `NEXT_PUBLIC_`). Must be the `www` host. |
| `NEXT_PUBLIC_NOINDEX`         | unset                                     | unset                        | `"true"` locks the deployment out of search. Preview hosts only.                                                                                                             |
| `ENQUIRY_TRANSPORT`           | `resend` once configured                  | `console`                    | Anything other than `resend` is the console adapter.                                                                                                                         |
| `RESEND_API_KEY`              | required for `resend`                     | blank                        |                                                                                                                                                                              |
| `ENQUIRY_TO_EMAIL`            | required for `resend`                     | blank                        | Where bookings land                                                                                                                                                          |
| `ENQUIRY_FROM_EMAIL`          | required for `resend`                     | blank                        | Must be on a domain verified in Resend                                                                                                                                       |
| `GTM_ID`                      | a `GTM-XXXXXXX` container                 | blank                        | Blank renders no script, no requests, no cookies. Scope to Production so previews are never counted. Everything else (GA4, call tracking, Ads) is configured inside GTM.     |
| `GOOGLE_SITE_VERIFICATION`    | unset                                     | unset                        | Bare token for a URL-prefix property's meta tag. Unnecessary while the Domain property is verified by DNS.                                                                   |
| `CHAT_*`, `ANTHROPIC_API_KEY` | not set                                   | placeholders in `.env.local` | Staged for a model-backed chat that has not been built. Nothing reads them.                                                                                                  |

Vercel also injects `VERCEL_ENV`, `VERCEL_URL` and `VERCEL_PROJECT_PRODUCTION_URL`. When `SITE_URL`
is absent, `lib/site.ts` falls back to the production URL in production and the per-deployment URL
elsewhere, so preview builds never advertise production URLs.

### Rules baked into `lib/site.ts`

- **A production build with no origin fails.** It would otherwise ship localhost canonicals on
  1,440 pages silently. The error message says what to set.
- **A declared-but-empty variable is treated as absent.** Vercel injects unset declared variables
  as `""`, which broke the first Vercel build (`new URL('')` throws). `SITE_URL`, `GTM_ID` and
  `GOOGLE_SITE_VERIFICATION` are all trimmed and treated as null when empty.
- **No `NEXT_PUBLIC_` prefix for server config.** The root layout is a server component and passes
  values down as props. Reading `siteUrl` from a client component would render localhost in the
  browser and mismatch hydration.

## What ships and what does not

`.gitignore` excludes `node_modules`, `.next`, `.env*.local`, `.vercel`, `test-results`,
`tsconfig.tsbuildinfo`, `.impeccable/`, `.cache/` (the downloaded locality dataset) and `/media/`
(the hero video master and the photography masters, about 880 MB together). `.vercelignore`
repeats `/media/` for the case of a CLI deploy from a working tree.

The encoded hero videos (`public/video/hero-1080.mp4` 5.5 MB, `hero-720.mp4` 2.5 MB) and the 54
gallery WebPs (6.6 MB) are committed as regular blobs. Fine at this size. If the videos are
re-encoded often, Git LFS is the usual answer.

## Deploy runbook

1. `npm run verify` locally. It is currently red on one known test (see testing doc). Everything
   else must be green.
2. Commit and push to `main`. Vercel builds and promotes automatically.
3. If an environment variable changed, a redeploy is required for it to take effect. Vercel
   dashboard, Deployments, latest, Redeploy. A push does the same.
4. Verify the live output:

   ```bash
   curl -sI https://www.commercialpaintersau.com.au/ | grep -i x-robots-tag   # must print nothing
   curl -s https://www.commercialpaintersau.com.au/robots.txt                  # Allow: /, www Host and Sitemap
   curl -s https://www.commercialpaintersau.com.au/sitemap.xml | grep -c "<loc>"   # 47
   curl -s https://www.commercialpaintersau.com.au/ | grep -o '<link rel="canonical"[^>]*>'   # www
   ```

5. After any change to indexable URLs, Search Console picks the sitemap up on its own. Resubmitting
   does not speed it up.

## Local setup

```bash
npm install
cp .env.example .env.local     # SITE_URL=http://localhost:3000, ENQUIRY_TRANSPORT=console
npm run dev
```

`npm run build` locally works with `SITE_URL=http://localhost:3000` because the production-origin
check only fires when the resolved origin is missing, not when it is localhost. To reproduce the
production sitemap locally, set `SITE_URL=https://www.commercialpaintersau.com.au` for the build.

Playwright (`npm run test:e2e`) starts `next start` on port 3100 against an existing production
build, so run `npm run build` first.

## Deployment history

| Date        | Commit                   | What                                                                               |
| ----------- | ------------------------ | ---------------------------------------------------------------------------------- |
| 10 Sep 2026 | `1b52f26` Initial commit | Site pushed to GitHub (189 files)                                                  |
| 13 Sep 2026 | `1ec8c93` Update         | SEO indexation fixes, `GOOGLE_SITE_VERIFICATION`                                   |
| 13 Sep 2026 | `e69831c` ENV            | `SITE_URL` handling hardened for Vercel's empty-string injection                   |
| 13 Sep 2026 | `72a07c5` Push           | GTM analytics opt-in, `www` as production origin. First fully correct live deploy. |
| 14 Sep 2026 | `fc25a19` Carousel       | Photo galleries, carousels, masters moved to `media/`                              |
| 14 Sep 2026 | `b553c19`                | "Further projects" block removed from `/projects/`                                 |
| 14 Sep 2026 | `4bcc363`                | Council corrections, council audit tool, pinning test                              |
