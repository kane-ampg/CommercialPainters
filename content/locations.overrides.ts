/**
 * Hand-written suburb copy, keyed by `state|slug`, merged over the generated data.
 *
 * Kept separate so scripts/build-locations.mts can be re-run at any time
 * without destroying human writing.
 *
 * Keyed by `state|slug`, not bare slug — 13 locality names exist in both
 * states (Brighton, Newport, Windsor, Fairfield, Albion, Burnside, Clifton
 * Hill, Donnybrook, Gilberton, Heathwood, Middle Park, Sumner, Wishart). A
 * bare-slug key would put Brighton VIC's hand-written copy on Brighton QLD's
 * page — a factual claim about work the business has never done in Queensland.
 */
export type LocalityOverride = {
  intro?: string;
  localNotes?: readonly string[];
};

/**
 * Queensland presence.
 *
 * False because the business has no Queensland address, no completed Queensland
 * projects and no Queensland phone number (spec §9). While this is false:
 * no second LocalBusiness entity, no QLD locality is indexable, and no QLD
 * copy may claim local presence.
 *
 * Flip it only when the client supplies an address or a documented project.
 */
export const qldPresence = false;

/**
 * Suburb-level tier promotions, applied over the generated tier.
 *
 * The generator assigns tiers from the committed seed list. Bayswater North
 * generates at Tier 3 — noindex — which is wrong: it is the business's own registered
 * office, and the spec's own Tier 1 rationale leads
 * with it. The one suburb the business physically operates from cannot be the
 * one suburb it is unable to rank in.
 *
 * Keyed by `state|slug`, because 13 slugs exist in both states.
 */
export const TIER_1_OVERRIDES: Readonly<Record<string, true>> = {
  'VIC|bayswater-north': true,
  /**
   * Brighton carries the exact evidence the tiering exists to demand — a
   * hand-written intro and the documented Newbay Medical clinic project
   * (content/projects.ts, relatedLocationSlugs ['brighton']) — yet generated
   * at Tier 3 because it was never on the seed list. Leaving the suburb with
   * both copy and a project noindex while evidence-free seeds stay indexed
   * would invert the rule. (Noble Park also has a documented project but no
   * hand-written copy yet — write its intro and it earns the same promotion.)
   */
  'VIC|brighton': true,
  /**
   * Croydon has no written-up case study, but it has more evidence on the
   * site than most seed suburbs: two photographed sites inside the suburb
   * (the Toyota dealership, whose naming the client approved, and a
   * kindergarten), a blog post built on the dealership shoot, and the
   * hand-written copy below. It is also one of the busiest suburbs in the
   * client records. Promoted 2026-10-12 on the client's instruction. The copy
   * claims only what those photographs and posts already say.
   */
  'VIC|croydon': true,
  /**
   * Donvale has one photographed site inside the suburb — Our Lady of the
   * Pines Primary School, named by its gallery since that gallery shipped,
   * located from the school's own contact page — a blog post built on that
   * shoot, and the hand-written copy below. Prepared 2026-10-12 on the
   * client's instruction, to ship when the client says so. The copy claims
   * only what the photographs and the post already say.
   */
  'VIC|donvale': true,
};

export const localityOverrides: Readonly<Record<string, LocalityOverride>> = {
  'VIC|vermont': {
    intro:
      'Commercial Painters completed a full interior and exterior repaint at Emmaus College in Vermont, working across a live campus while the school stayed open. Vermont sits in Melbourne’s eastern suburbs, roughly ten minutes from our Bayswater North base.',
    localNotes: [
      'Vermont’s commercial stock is largely low-rise brick and render — schools, childcare, medical suites and light industrial along Canterbury and Boronia Roads — so exterior programmes commonly combine render, brick and metal in a single scope.',
      'The Emmaus College project is documented in full, including the access methods and the coordination required alongside a neighbouring construction site.',
    ],
  },
  'VIC|croydon': {
    intro:
      'Commercial Painters has painted the showroom and offices of a Toyota dealership in Croydon, and a Croydon kindergarten while it was closed to children. Croydon is about six kilometres from our Bayswater North base.',
    localNotes: [
      'At the dealership, photographed on 8 April 2026, the crew rolled and cut in walls, columns and ceiling bulkheads across the showroom, reception and offices. Display vehicles stayed on the floor, desks were sheeted, the tiles were masked at every wall line, and the office walls were sanded with a vacuum-fed sander that draws the dust off at the sanding head.',
      'At the kindergarten, door frames were gap-filled and rolled room by room, with the children’s artwork and photo boards left up on the walls beside them. Both jobs are photographed below, and each has an article on the blog.',
    ],
  },
  'VIC|donvale': {
    intro:
      'Commercial Painters has repainted the doors, door frames and cupboard joinery of a teaching block at Our Lady of the Pines Primary School in Donvale. Donvale is about ten kilometres from our Bayswater North base.',
    localNotes: [
      'At the school, photographed in May 2026, the crew took the frames and doors from a dark blue-green to white, cutting in by brush and rolling with mini rollers. Tape ran down each frame where it meets the classroom pinboard, and the notices and children’s work stayed pinned up beside the doors.',
      'The cupboard doors were taken off and rolled flat on the classroom tables, with the chairs up and the pigeonhole units pulled clear of the walls. The job is photographed below, and the blog has an article on how classroom doors and joinery are repainted.',
    ],
  },
  'VIC|brighton': {
    intro:
      'Commercial Painters completed the painting works for the Newbay Medical clinic fit-out in Brighton. Brighton sits in Melbourne’s bayside, where salt exposure shortens the life of exterior coatings on west- and south-facing elevations.',
    localNotes: [
      'Bayside exteriors weather faster than inland equivalents. Coating selection matters more here than the interval between repaints.',
    ],
  },
};
