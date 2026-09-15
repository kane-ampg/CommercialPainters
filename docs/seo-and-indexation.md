# SEO and indexation

## Principles

1. **Evidence gates the claim, not the URL.** A sector page is indexable because it carries
   hand-written copy found nowhere else. Whether it shows a project grid or a "no experience
   claimed" placeholder depends on evidence. Until 13 September 2026 five sector pages were noindex
   for lack of a case study. That rule was wrong and was reversed.
2. **Indexability is computed, never stored.** `computeIndexable()` in `lib/locations/index.ts` is
   the one rule for suburbs. `stateIsIndexable()` carries it up to hubs. The sitemap filters on the
   same functions the pages render their robots directive from, so the two cannot disagree.
3. **`noindex, follow`, never `nofollow`.** The 1,370 noindexed suburb pages exist to be crawled
   and pass equity up to the region hubs. `buildMetadata()` keeps `index` and `follow` independent.
4. **Nothing invented in structured data.** No hours, coordinates or ratings the business has not
   supplied.

## Indexation policy

| Page type    | Built       | Indexable | Rule                                                                         |
| ------------ | ----------- | --------- | ---------------------------------------------------------------------------- |
| Core pages   | 7           | 7         | always                                                                       |
| `/areas/`    | 1           | 1         | always                                                                       |
| Sector pages | 8           | 8         | always, since 13 Sep 2026                                                    |
| Case studies | 4           | 4         | always                                                                       |
| State hubs   | 2           | 1         | Victoria yes, Queensland while `qldPresence` is false no                     |
| Region hubs  | 22          | 9         | the nine Victorian regions                                                   |
| Suburb pages | 1,387       | 17        | Tier 1, not rural fringe, Victorian (or Queensland once `qldPresence` flips) |
| Blog index   | 1           | 0         | indexable once `content/posts.ts` has an entry                               |
| **Total**    | about 1,440 | **47**    |                                                                              |

### Suburb tiers

Two tiers, numbered 1 and 3 on purpose (region hubs are the middle of the hierarchy but a
different entity).

- **Tier 1**: indexable, hand-written. Fifteen come from the generator's seed list and two more
  from `TIER_1_OVERRIDES` in `content/locations.overrides.ts` (Bayswater North, the office suburb,
  and Brighton, which has a documented project and hand-written copy).
- **Tier 3**: templated, `noindex, follow`. 1,370 of them.

The 17 indexable suburbs: Bayswater, Bayswater North, Box Hill, Braeside, Brighton, Campbellfield,
Chirnside Park, Clayton, Dandenong South, Laverton North, Notting Hill, Port Melbourne, Richmond,
Ringwood, South Melbourne, Tullamarine, Vermont.

Three Victorian region hubs have no indexable child: Inner East, Northern Melbourne, Yarra Valley
and Hinterland. The last can never have one under current rules because all 106 of its localities
are flagged `ruralFringe`.

### Promoting a suburb

The clearest growth path for the site is converting Tier 3 suburbs to Tier 1 with genuine local
copy. To do one:

1. Write an `intro` and `localNotes` in `localityOverrides` (keyed `VIC|slug`) that say something
   true and specific about commercial stock in that suburb. Cite a project if one exists.
2. Add `'VIC|slug': true` to `TIER_1_OVERRIDES`.
3. Check the council the page will state as fact: `node scripts/audit-councils.mjs --state VIC`.
   Three swapped or wrong councils were corrected on 14 September (Coburg, Northcote, Dandenong),
   and a test now pins them.
4. Run the tests. `locations-tiers.test.ts` and `tier1-councils.test.ts` guard the result.

Candidates identified on 14 September, in rough priority: **Noble Park** first (it has a documented
factory repaint and is the only project suburb still noindex), then Camberwell and Hawthorn East
(Inner East), Heidelberg, Preston and Thomastown (Northern), and Scoresby, Mulgrave, Keysborough,
Moorabbin (industrial and business-park stock close to base).

### Queensland

`qldPresence = false` in `content/locations.overrides.ts`. While false: no Queensland suburb, region
or state page is indexable, no second `LocalBusiness` entity is emitted, and `qld-copy.test.ts`
fails any copy claiming a Queensland office, phone or project. Queensland is `areaServed` only.
Flip it only when the client supplies an address or a documented project, and all three levels
flip together.

## Metadata

`buildMetadata()` in `lib/seo/metadata.ts` is the one way a page gets metadata. It requires a
description (a page without one will not compile), sets the canonical to `siteUrl + path`, an Open
Graph block, a Twitter card and the robots directive. Titles are absolute and already end in the
brand, so the layout's `%s | Commercial Painters` template is bypassed. `metaDescription()` cuts
prose at the last full sentence that fits 155 characters, never mid-word.

The homepage title is brand-led; `/commercial/` targets "Commercial Painters Melbourne" so the two
do not compete. An e2e test holds that.

The default Open Graph card is drawn at build time by `app/(site)/opengraph-image.tsx`. Project
pages override it with their cover photograph.

## Sitemap

`app/sitemap.ts`. Rules:

- Only indexable URLs. A noindex URL in a sitemap is two contradictory instructions.
- No `lastmod` except on blog posts, which carry a real date. A `lastmod` of "now" on every deploy
  is a signal Google learns to ignore.
- Priorities: home 1.0, `/commercial/` 0.9, `/areas/`, `/projects/`, `/office-painters/` and
  suburbs 0.8, sectors and region hubs 0.7, projects 0.6.

Live at `https://www.commercialpaintersau.com.au/sitemap.xml`, 47 entries, all on the `www` host.

## robots.txt

`app/robots.ts`. Allows everything, then names the AI crawlers explicitly (GPTBot, ChatGPT-User,
OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-User, anthropic-ai, Google-Extended,
Applebot-Extended, Bingbot) so a later blanket rule cannot quietly lock answer engines out. States
`Host` and `Sitemap`. Under the staging lockdown it becomes `Disallow: /`.

## llms.txt

`app/llms.txt/route.ts` renders a plain-text summary for AI answer engines from the same typed
content the pages use: services, sectors, case studies, verified accreditations, the Google figure
attributed as Google's, the regions and locality counts derived from `REGIONS`, and the FAQ
corpus. It cannot claim something the site does not. Returns 404 under the lockdown.

## Structured data

`lib/schema/index.ts`. One `LocalBusiness` node in the layout (merged with Organization rather than
two half-described entities), plus `Service`, `FAQPage`, `BreadcrumbList` and `BlogPosting` where
relevant.

Rules, all tested:

- **No `aggregateRating` from Google reviews.** Only first-party reviews the site collects would be
  aggregated, and there are none yet.
- **Canonical phone only**, in `+61` form. Never a dynamically inserted tracking number.
- **`areaServed`** is Melbourne, Victoria and the Queensland regions as administrative areas, plus a
  `GeoCircle` once `coords` is set. Not 1,387 `City` nodes.
- **Accreditations** appear only when `verified: true`.
- **`sameAs`** carries the Google Business Profile place ID URL and, when set, the social profiles.
- **`logo`** is `/brand/logo.png`, drawn at build time.

## The staging lockdown

`NEXT_PUBLIC_NOINDEX="true"` (that exact string) switches on four layers together:

1. `<meta name="robots" content="noindex, nofollow">` on every page
2. `X-Robots-Tag: noindex, nofollow` response header (`next.config.ts`)
3. `Disallow: /` robots.txt
4. 404 on `/llms.txt`

`noindex-flag.test.ts` asserts they switch together. Use it on any preview host. If it is ever set
in production, Search Console will report "Discovered, currently not indexed" everywhere with no
obvious cause. It is confirmed off on the live site.

## Search Console

State as of 14 September 2026:

| Item            | State                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Property        | **Domain** property `commercialpaintersau.com.au`, verified by DNS TXT record at GoDaddy                                                                       |
| Sitemap         | Submitted as the full URL `https://www.commercialpaintersau.com.au/sitemap.xml`. Domain properties reject a bare path.                                         |
| Sitemap status  | Read 14 September 2026, 47 discovered, none rejected. It showed "Couldn't fetch" for a few hours first, which is the pre-first-read placeholder, not an error. |
| Homepage        | **Indexed 14 September 2026.** Google-selected canonical equals the declared `www` URL. Crawled as Googlebot smartphone. Discovered via the sitemap.           |
| Referring pages | None detected. The domain has zero inbound links.                                                                                                              |

`GOOGLE_SITE_VERIFICATION` exists as an alternative for a URL-prefix property verified by meta tag.
It is unnecessary while the Domain property stands and is unset.

What to expect: the remaining 46 URLs trickle in over two to four weeks and some may sit at
"Crawled, currently not indexed" for a while. That is normal for a new domain with no links. What
would be a real fault: "Excluded by noindex tag" or "Blocked by robots.txt" on a page in the
sitemap.

Requesting indexing through URL Inspection on `/`, `/commercial/`, `/contact-us/`,
`/office-painters/` and `/healthcare-painters/` is the fastest lever and uses a small daily quota.

## Google Business Profile

The profile already exists (place ID `ChIJnV9lqRIw1moRftY3Ankvfdw`, 5.0 from 70 reviews). For a
local trade it will out-earn organic search. Before go-live its registered name and address must
match `lib/site.ts` exactly, and its website field must be the `www` URL.

A description was drafted on 14 September for Business Profile Manager. 742 of 750 characters,
policy-clean (no URL, phone, superlatives or offers), every claim backed by `lib/site.ts` or
`content/sectors.ts`, Melbourne-only on purpose:

```
Commercial Painters is a Melbourne-based commercial painting and property
maintenance contractor, established 2015, working across metropolitan
Melbourne from Bayswater North.

We paint buildings that stay open while the work happens: schools mid-term,
clinics between patients, aged care, strata, retail, hospitality and
industrial sites. Work is staged zone by zone or programmed after hours so
the building keeps operating.

Every job begins with an on-site assessment: scope, substrate, access and
permitted working hours established before a price is given. Quotes itemise
labour and materials.

Cm3 prequalified. Master Painters Australia member, Dulux Accredited Painter.
Fully insured. Police and Working with Children Checks current.
```

## Off-site work that matters more than anything left in the code

"Commercial Painters" is the category, not a brand, so the usual early win of ranking for the
business name does not exist here. Ranking for competitive Melbourne queries is a six-to-twelve
month job and inbound links are the constraint. In order:

1. Publish and verify the Google Business Profile with matching NAP and the `www` URL.
2. Claim the directory listings the business is already entitled to: Dulux Accredited Painter,
   Master Painters Australia member directory, Cm3 profile.
3. Import the verified Search Console property into Bing Webmaster Tools (Bing feeds ChatGPT
   search, and robots.txt already allows those crawlers).
4. Put the URL on vehicles, quotes, invoices and email signatures.
5. Promote suburbs and publish posts, per the sections above.
