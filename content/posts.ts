import { galleryImage } from '@/content/galleries';
import type { Post } from '@/lib/content/types';

/**
 * Blog posts.
 *
 * Add an entry here and it appears on /blog/, gets its own page at
 * /blog/{slug}/, lands in the sitemap with a real `lastModified`, and is
 * described to answer engines in /llms.txt — nothing else needs touching.
 *
 * `body` is Markdown, rendered without raw HTML
 * (components/pages/post-article.tsx), so a pasted script tag is text, not
 * code. Keep `excerpt` under 300 characters and `metaDescription` under 160:
 * the first is the card and the OG description, the second is the SERP
 * snippet. `metaTitle` is used as-is, so it must end in "| Commercial
 * Painters". `relatedServiceSlugs` (slugs from content/services.ts) become the
 * post's "Related services" links.
 *
 * Photographs come from the galleries only: `cover` through `galleryImage()`,
 * and inline as `![alt](/images/gallery/… "Caption")`. Anything else is not
 * rendered. `faqs` render under the body and as FAQPage JSON-LD.
 * tests/unit/page-metadata.test.ts checks every one of these rules against
 * every post.
 *
 * Posts are published as the business, not under an invented personal byline
 * — see `blogPostingSchema` in lib/schema/index.ts.
 */
export const posts: readonly Post[] = [
  /*
   * Built on the Toyota Croydon gallery, which has no project record behind it
   * (see content/galleries.ts). So every claim about that job is one the
   * photographs show — the rooms, the protection, the tools, the vehicles on
   * the floor — and nothing about scope, duration, coating system or outcome.
   * The general advice is drawn from content/faqs.ts, content/approach.ts and
   * the retail sector copy, which already carry the business's verified
   * practice. The shoot date is from the photographs' own metadata.
   */
  {
    slug: 'painting-a-car-dealership-showroom',
    title: 'How to repaint a car dealership without closing the showroom',
    excerpt:
      'A car dealership can usually be repainted without closing the showroom. How the work is zoned, how display vehicles and tiled floors are protected, and how high bulkheads are reached — with photographs from a Toyota dealership in Croydon.',
    cover: galleryImage('/images/gallery/toyota-croydon/toyota-croydon-03.webp'),
    publishedAt: '2026-09-27',
    author: 'Commercial Painters',
    tags: ['Car dealerships', 'Showroom painting', 'Retail', 'Croydon'],
    relatedServiceSlugs: ['interior-painting', 'office-painting'],
    metaTitle: 'Car Dealership Painting in Melbourne | Commercial Painters',
    metaDescription:
      'How a car dealership is repainted without closing the showroom: zones, vehicle and floor protection, dust control and access, with photos from Croydon.',
    body: `A car dealership can usually be repainted without closing the showroom. The building is split into zones, display vehicles and polished floors are protected wherever the work is, the dustiest steps are contained at the source, and each area is cleaned and handed back before the next one is opened up.

The photographs in this post were taken on 8 April 2026, while our crew rolled and cut in the walls, columns and ceiling bulkheads of a Toyota dealership's showroom, reception and offices in Croydon, in Melbourne's east. They show what that protection looks like on a real showroom floor, and they are a useful reference before you ask any painter to quote a dealership.

## Why a dealership is harder to paint than an office

A showroom packs the awkward parts of several building types into one open floor:

- **New vehicles on the floor.** Stock is parked close to the walls and cannot take a speck of paint or a film of sanding dust.
- **Polished tiles.** Large-format gloss tiles show every drip and scuff, and they run right to the base of every wall and column.
- **Height.** Columns, bulkheads and tall walls sit directly above customer areas and display cars.
- **Brand standards.** Manufacturer fit-out guidelines often fix colours and finishes, and feature elements — like the timber Toyota wall behind the Croydon reception counter — are worked around, not painted over.
- **People.** Sales staff, customers and deliveries keep moving through the space unless the work is scheduled around them.

## How the showroom floor is protected

Protection is most of the job in a dealership, and it goes down before the first tin is opened. At Croydon it looked like this:

1. **Furniture sheeted.** Sales desks and furniture near the work were covered in plastic sheeting.
2. **Floors masked at the wall line.** Tape and paper protected the tiles where walls and columns meet the floor — where a brush or roller is most likely to touch down.
3. **Display vehicles left in place.** The cars stayed on the showroom floor, close to the walls being rolled. Whether a vehicle is moved, covered or left where it is depends on how near it sits to the work, and it should be agreed zone by zone before painting starts.

![A painter in company uniform kneeling to cut in the base of a showroom wall with a brush beside a paint pail](/images/gallery/toyota-croydon/toyota-croydon-02.webp "Cutting in at the base of a showroom wall, with display vehicles still on the floor behind.")

Cutting in is painting the edge of a wall by brush, where it meets the floor, the ceiling or a fixture. On a showroom floor it is the step most likely to mark a polished tile, which is why the masking runs along every wall line rather than only where the rolling happens.

## Columns, bulkheads and high walls

Most of the height in a showroom can be reached from the floor. At Croydon, extension-pole rollers covered the columns and upper walls, and a stepladder was used for the ceiling bulkheads above the showroom floor.

That order is deliberate. Safe Work Australia's model Code of Practice, *Managing the risk of falls at workplaces*, starts its hierarchy of controls with eliminating the risk by doing the work on the ground or on a solid construction — so an extension pole is not a shortcut, it is the preferred option. Where a wall or ceiling is beyond safe ladder reach, access moves up to a mobile scaffold or scissor lift, planned per area rather than for the whole site, so the showroom is not filled with equipment it does not need.

![A painter on a stepladder running an extension-pole roller across a bulkhead above the showroom floor](/images/gallery/toyota-croydon/toyota-croydon-04.webp "Rolling a ceiling bulkhead from a stepladder above the showroom floor.")

## Dust and odour around new vehicles

Sanding is the dustiest step in any repaint, and the one a dealership should ask about first. In the Croydon offices, walls were sanded with a vacuum-fed pole sander, which draws dust into an extractor at the sanding head instead of letting it settle on desks, floors — or a showroom full of new paintwork.

![A painter sanding an office wall with a vacuum-fed pole sander, masking tape at the wall base and floor protection down](/images/gallery/toyota-croydon/toyota-croydon-11.webp "Sanding an office wall with a vacuum-fed pole sander, masking and floor protection already down.")

Odour is the other half. Low-VOC paint systems are standard in occupied workplaces and reduce it substantially, but ventilation is what actually clears a space, so a well-planned programme leaves coated areas a ventilation window before staff and customers return.

## Sales offices and back-of-house

Dealership offices are painted like any other workplace: after hours or one zone at a time, with desks cleared of loose items and equipment covered or moved before the programme starts. At Croydon, the offices overlooking the carpark were sanded and rolled out with extension poles. There is more on how that works on our [office painting](/office-painters/) page.

![A painter in company uniform working an extension-pole roller across an interior wall, window and carpark behind](/images/gallery/toyota-croydon/toyota-croydon-14.webp "Rolling out an interior wall beside a window overlooking the dealership carpark.")

## How a dealership repaint runs, step by step

1. **Site assessment before the quote.** Scope, access and trading-hours limits are established on site, not guessed from photographs.
2. **Paperwork before day one.** Safe Work Method Statements, insurance certificates, and a pre-start meeting to confirm site rules.
3. **Zones and hours agreed.** Which areas are released, when, and what stays open to customers.
4. **Protection.** Vehicles moved or covered where needed, furniture sheeted, floors masked at every wall line.
5. **Preparation.** Patching and sanding, with dust extracted at the source.
6. **Painting.** Cutting in and rolling walls, columns and bulkheads.
7. **Handover.** Each zone is cleaned and returned before the next one is opened up.

## What to ask before a painter quotes your dealership

| Ask | What a good answer sounds like |
| --- | --- |
| Will you attend site before quoting? | Yes — preparation and access cannot be priced from photographs. |
| How will you protect vehicles, floors and furniture? | A zone-by-zone plan, agreed before the first day. |
| Can you work around trading hours? | After close, overnight, or one zone at a time. |
| How do you control sanding dust? | Extraction at the sander, not a broom afterwards. |
| Which paint system, and is it low-VOC? | A named system matched to the surface, low-VOC in occupied areas. |
| What prequalification and warranty do you hold? | Contractor safety prequalification, insurance certificates and a written workmanship warranty. |

For the record, here are our answers. Commercial Painters attends every commercial site before pricing it, holds Cm3 contractor OHS prequalification and Master Painters Australia membership, and is a Dulux Accredited Painter, which supports our five-year workmanship warranty. Low-VOC systems are our standard in occupied workplaces.

## About this job

Commercial Painters is a commercial painting contractor based at 1 Turbo Drive, Bayswater North — about six kilometres from Croydon — working across Melbourne. Dealerships and showrooms sit within our [retail painting](/retail-painting/) work, finished jobs are on the [projects page](/projects/), and the full range of [commercial painting services](/commercial/) is set out separately. If you are comparing [commercial painters in Melbourne](/) for a showroom, the questions above are a good place to start.`,
    faqs: [
      {
        question: 'Can a car dealership stay open while it is being painted?',
        answer:
          'Usually, yes. The showroom is split into zones that are painted and handed back one at a time, or the work runs after close or overnight. Commercial Painters agrees the zones and hours at the site assessment, so the dealership knows in advance which areas will be unavailable and when.',
      },
      {
        question: 'Do display vehicles have to be moved before a showroom is painted?',
        answer:
          'Not always. In the photographs from the Toyota dealership in Croydon, display vehicles stayed on the showroom floor close to the walls being rolled. Anything within reach of the work should be moved or covered, and that is decided zone by zone before painting starts.',
      },
      {
        question: 'What paint is best for a car showroom?',
        answer:
          'A low-VOC system, which is standard for occupied workplaces and keeps odour down for staff and customers, with a harder-wearing washable finish on high-contact walls such as counter fronts and corridors. The exact system should be matched to the existing coating and surface, which is assessed on site.',
      },
      {
        question: 'How long does it take to repaint a car dealership?',
        answer:
          'It depends less on floor area than on how much of the building can be released at once. A showroom released in full over a weekend moves quickly; the same area released one zone at a time takes more weeks for the same amount of work. Commercial Painters prices both options at the site assessment.',
      },
      {
        question: 'Who painted the Toyota dealership in Croydon?',
        answer:
          'Commercial Painters, a Melbourne commercial painting contractor based in Bayswater North, about six kilometres from Croydon. The crew rolled and cut in walls, columns and ceiling bulkheads across the showroom, reception and offices, with displays sheeted and floors masked.',
      },
    ],
  },
];
