# Development history

Reconstructed on 14 September 2026 from the twelve Claude Code sessions recorded against this
project and from the git log. Dates are the developer machine's local dates, which match the
commit dates. One session (a CV rewrite on 14 September) was unrelated to the app and is omitted.

## Before the repository

The site was derived from an existing Next.js 16 commercial-painting build for a related business.
Evidence in the code dates that work to late August 2026: accreditations confirmed by the client on
24 August, the locality dataset verified on 24 August and pruned again on 26 August, the Playwright
and Vitest configs dated 23 August. The derivation spec (`docs/superpowers/specs/`, dated
10 September) records what was removed: the Supabase-backed `/admin` CMS, the AI assist, the media
library, the two-project deployment model, and every string, file name and identifier naming the
previous business. The wordmark became typeset, favicons became build-time renders, four Google
reviews and a testimonial that named the old business were dropped rather than edited.

## 10 September 2026

**Initial commit** `1b52f26`, "Commercial Painters marketing site".

**Uploaded to GitHub.** The folder was not yet a git repository. Initialised, staged against the
existing `.gitignore`, pushed 189 files to `kane-ampg/CommercialPainters`. Confirmed nothing
sensitive left the machine: `.env.local` held only localhost and the console transport. Flagged
that the repository is public and that the two hero videos are committed as regular blobs.

**"Change all locations to Melbourne Bayswater only."** Investigation found the office address
(1 Turbo Drive, Bayswater North VIC 3153) already the single source in `lib/site.ts`, feeding the
footer, contact page, JSON-LD and the geo anchor every Victorian distance is measured from. The
request was clarified and no change was needed.

**Contact email changed** from an address on the new domain to the group inbox on the previous
brand's domain, in `lib/site.ts`, the chat knowledge base, the n8n workflow config and the
derivation spec. This introduced the `brand.test.ts` failure that is still open. Not committed that
day; it reached `main` in `1ec8c93` on 13 September.

**n8n booking automation requested.** The workflow already existed in the repository from the
initial commit: 35 nodes, four assessors, Google Meet or on-site holds, one approval email. Rather
than duplicate it, an adversarial audit (schema validity, Code-node logic, concurrency, client
experience, Workspace security) and an `n8n` transport adapter were started. The session ended
before either finished, and neither landed in the codebase. Findings so far: zone-aware date
handling is correct; the team addresses are unconfirmed; the site has no way to reach the webhook.

**SEO audit began** (the long-running session that continued through 14 September). Rendered HTML
from the dev server was audited across nine templates. Verdict: technical foundations excellent;
the problems were indexation policy. Three critical findings: five of eight sector pages noindex
for want of a case study; fourteen Queensland hub URLs in the sitemap describing a state with no
address, phone or project; `/blog/` indexed and linked sitewide with no posts.

## 13 September 2026

**Critical SEO fixes** (commit `1ec8c93` "Update"). All eight sector pages index unconditionally,
with the evidence block disclosing where no project exists. `stateIsIndexable()` added and wired
into both hub templates and the sitemap, so Queensland hubs are `noindex, follow` while
`qldPresence` is false. `/blog/` is `noindex, follow` while empty, and the sitemap entry and both
nav slots derive from the same post count. Sitemap went from 57 to 47 URLs. New tests:
`area-hub-indexation`, `blog-indexation`, rewritten `sector-indexation` and blog e2e. 458 unit and
65 e2e tests green at that point.

**Search Console support.** `GOOGLE_SITE_VERIFICATION` added as an optional meta-tag route, with
the recommendation to use a DNS-verified Domain property instead. A production build with the real
domain was run to prove the sitemap: 47 absolute URLs, no localhost leakage.

**Connected to Vercel and the domain** (commits `e69831c` "ENV", `72a07c5` "Push"). Walked
through linking the GitHub repository, adding `commercialpaintersau.com.au` and `www`, GoDaddy A
and CNAME records, and setting `SITE_URL`. Two fixes fell out: Vercel injects a declared-but-unset
variable as an empty string, which threw in `new URL('')` during the first build, so origin
resolution now treats empty as absent and falls back to Vercel's system URLs; and `SITE_URL` must
be the `www` host because that is the production domain and the apex 308-redirects to it. Added the
GTM analytics opt-in (`GTM_ID`, renders nothing when blank) with tests. Verified live: canonical,
robots `Host` and `Sitemap`, and all 47 sitemap URLs on `www`; apex 308; analytics inert. Cleared to
submit to Search Console.

**Search Console verified** by DNS TXT at GoDaddy as a Domain property. Sitemap submitted (the
full `www` URL, since Domain properties reject a bare path). Showed "Couldn't fetch" with no
last-read timestamp, explained as the pre-first-read placeholder.

**Model-backed chat designed.** Request: connect a Claude API key with safeguards so public users
cannot abuse it, about ten chats before handing off to the contact page. A design was produced
(turn caps, IP budgets, daily spend ceiling, opaque Redis-keyed cookie, knowledge-base grounding,
price-pattern refusal, degradation to the scripted flow) and the env variable block was written.
Placeholders were appended to `.env.local` with `CHAT_MODE="scripted"`. The design awaited
confirmation of six numbers and was not implemented.

**Photo galleries and carousels** (commit `fc25a19` "Carousel", finished early 14 September).
Nine photographer shoots (537 MB) had been dropped into `public/` under a folder named for the
previous brand. Built `scripts/build-gallery-images.mjs`, moved the masters to `media/photography/`,
encoded 54 frames across the 7 commercial sites to WebP (6.6 MB), excluded two residential shoots
and one van frame carrying the old brand legibly. Built `PhotoCarousel` as a filmstrip that sizes
each slide from its own aspect ratio so portrait frames are not cropped, extracted the review
carousel's scroll-snap logic into `use-carousel.ts` (that component went from 340 to 100 lines),
and made case-study galleries carousels too. Galleries appear on the homepage strip, `/projects/`
and five sector pages. An adversarial review caught invented caption claims, positionally keyed alt
text and contrast failures, all fixed. Flagged that crew uniforms in many frames still show the old
logo, and that the Newbay cover photo shows a van in old livery.

## 14 September 2026

**"Further projects" removed** from `/projects/` (commit `b553c19`). The page now runs documented
case studies, then the seven photographed sites, then the CTA. Newbay Medical keeps its page and
its healthcare link.

**Website gap audit.** All 47 live URLs crawled, DNS checked, repo compared with production.
Critical: enquiry delivery may be the console adapter in production (unconfirmed); the brand
domain has DMARC `p=quarantine` with no SPF or MX so it cannot send mail; no GTM, no CallRail;
22 files on the live site not yet in git (committed since). Growth gaps: empty blog, three
services without their own page, 17 of 1,387 suburbs indexable, no privacy policy (blocks Google
and Meta Ads onboarding). Strengths: unique titles, descriptions and canonicals on all 47, business
schema sitewide, alt text everywhere, 166 to 178 ms TTFB, sector pages averaging 6.6 percent
overlap. A report artifact was published.

**Progress TLDR for the boss** written: built and working, 1,387 location pages, 4 case studies,
enquiry forms and chat, SEO complete, gallery system just finished, one decision needed on the
public email.

**Council data corrected** (commit `4bcc363`). While shortlisting suburbs to promote, three wrong
councils were found in the Tier 3 set: Coburg and Northcote swapped, Dandenong tagged Casey. Wrote
the `scripts/audit-councils.mjs` centroid-outlier tool that `build-locations.mts` had described but
never had, corrected the three, nearly broke Tullamarine (deliberately pinned to Brimbank for its
commercial core) and reverted, added `council-overrides.test.ts`. All 17 indexable pages confirmed
to state the correct council. Promotion candidates recorded: Noble Park first, then Camberwell,
Hawthorn East, Heidelberg, Preston, Thomastown, Scoresby, Mulgrave, Keysborough, Moorabbin.

**Google Business Profile description drafted**, 742 characters, policy-clean, Melbourne-only.

**Search Console: sitemap read** on 14 September, 47 discovered, none rejected.
**Homepage indexed** the same day, ahead of the estimate. Google-selected canonical matched the
declared `www` URL. Referring pages: none.

**This documentation written.**

## Recurring threads

Three items were raised in nearly every session from 10 September on and remain open:

1. **Enquiry delivery in production is unconfirmed.** The console adapter is the default, the
   Vercel environment cannot be read from this machine, and the only test is a real submission.
2. **The public email fails the brand guard.** A business decision, raised five times.
3. **Photography carries the previous brand** on uniforms and one van. Alt text does not name it,
   so the tests pass, but the pixels do.
