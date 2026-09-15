# Status and next steps

As of 14 September 2026.

## Where things stand

| Area                 | State                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Site                 | Live at `https://www.commercialpaintersau.com.au/`, apex redirects, deployment protection off                                       |
| Pages                | About 1,440 built, 47 indexable, all with unique title, description and canonical                                                   |
| Search               | Domain property verified. Sitemap read 14 Sep, 47 discovered. Homepage indexed 14 Sep. Zero inbound links.                          |
| Enquiries            | Form and chat work end to end. **Delivery in production unconfirmed.** Local config is the console adapter, which delivers nothing. |
| Analytics            | GTM opt-in shipped and inert. `GTM_ID` not set.                                                                                     |
| Photography          | 54 frames across 7 sites live on the homepage, `/projects/` and five sector pages                                                   |
| Case studies         | 4, one thin and unfeatured                                                                                                          |
| Blog                 | Built, empty, correctly hidden until the first post                                                                                 |
| Tests                | 503 of 504 unit tests pass. One known failure on the public email. E2E green at last full run.                                      |
| Repository           | Clean and in sync with `main`. Public.                                                                                              |
| n8n booking workflow | Exists, never run, not reachable from the site                                                                                      |
| Model-backed chat    | Designed, not built                                                                                                                 |

## Decisions only the business can make

In order of how much they matter.

1. **Where enquiries go, and confirm they arrive.** If `ENQUIRY_TRANSPORT` is still `console` in
   Vercel production, every booking validates and vanishes. Now that the site is indexed this has a
   real cost. Set the Resend variables, fix the sending domain's DNS, redeploy, submit a test.
2. **The public email address.** The address in `lib/site.ts` is on the previous brand's domain
   and fails `brand.test.ts`, so `npm run verify` is red. Keep it (and relax the guard for that one
   string) or move to an address on the new domain.
3. **Google Business Profile.** Publish it with name, address and phone matching the site exactly,
   the `www` URL in the website field, and the drafted description. This will out-earn organic
   search for months.
4. **Registered entity name and ABN.** The footer legal line and `legalName` carry the trading
   name; ABN is unpublished. Both are needed for complete `LocalBusiness` schema.
5. **Photography.** Crew uniforms in many gallery frames and the van in the Newbay cover photo show
   the previous brand. Replace, crop, or accept.
6. **Social profiles, coordinates, opening hours.** All null and all omitted from schema until
   supplied. Coordinates are the highest-value local signal of the three: geocode 1 Turbo Drive.
7. **Team addresses for the n8n workflow**, if it is to be used.
8. **Repository visibility.** It is public. The site source and client-named photography are
   visible.

## Technical gaps before paid traffic

- **Sending domain DNS.** The brand domain has DMARC `p=quarantine`, no SPF, no MX. Mail from it
  is quarantined. Needed before Resend can send from that domain.
- **`GTM_ID`.** Create a container, add the ID to Vercel Production, redeploy. GA4 and call
  tracking then live inside GTM with no further deploys.
- **Shared-store rate limiting.** The limiter is in-memory per serverless instance. Move it to
  Redis via the Vercel Marketplace before advertising.
- **Privacy policy.** None on any of the 47 pages. Google Ads and Meta Ads onboarding both
  require one.
- **File uploads.** Specified for the form, not built. Needs private storage and server-side
  validation.
- **`www` CNAME** at GoDaddy points at the apex rather than Vercel's project CNAME. Works, but pins
  to an IP.
- **Vercel CLI.** Not installed. `npm i -g vercel` and `vercel link` would make production env
  readable and logs available.

## Growth work, in the order it pays

1. **Promote Noble Park** to Tier 1. It already has a documented project and needs only hand-written
   local copy. Then Camberwell, Hawthorn East, Heidelberg, Preston, Thomastown, Scoresby, Mulgrave,
   Keysborough, Moorabbin.
2. **Claim entitled backlinks**: Dulux Accredited Painter listing, Master Painters Australia member
   directory, Cm3 profile. The domain has zero inbound links and that is what throttles crawl and
   ranking.
3. **Publish the first post.** One entry in `content/posts.ts` restores the blog everywhere.
4. **Give interior, exterior and protective coatings their own pages.** Today they are sections of
   `/commercial/`.
5. **Complete the Newbay Medical record** and flip `isFeatured`.
6. **Bing Webmaster Tools** import from Search Console.
7. **Collect first-party reviews** with permission to reproduce. The first one switches
   `aggregateRating` on.
8. **Decide on the model-backed chat.** The design exists; provisioning Redis is the first step and
   also fixes the rate limiter.

## Expectations

Indexing of the remaining 46 URLs: two to four weeks, some may lag at "Crawled, currently not
indexed". Organic clicks in the first month: near zero, and that is normal. Long-tail suburb
queries: months two to three. "Commercial painters Melbourne": six to twelve months with link
building. The map pack via Google Business Profile can produce calls within weeks and is the
fastest path to enquiries.
