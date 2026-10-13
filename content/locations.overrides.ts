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
  /**
   * The sixteen homepage service-area suburbs (content/service-areas.ts) that
   * were still noindex, promoted 2026-10-12 on the client's instruction. Each
   * is one of the suburbs with the most active sites in the client records,
   * which the homepage already says in so many words, and the homepage and
   * /commercial/ link to every one. Three also have photographed work:
   * Cheltenham, Noble Park (a case study) and Frankston (part of the NDIS
   * programme). The copy below claims the records, the photographs and the
   * case studies, and otherwise describes the suburb, never invented work.
   */
  'VIC|lilydale': true,
  'VIC|boronia': true,
  'VIC|mitcham': true,
  'VIC|mooroolbark': true,
  'VIC|ringwood-east': true,
  'VIC|forest-hill': true,
  'VIC|melbourne': true,
  'VIC|south-yarra': true,
  'VIC|st-kilda': true,
  'VIC|cheltenham': true,
  'VIC|caulfield-north': true,
  'VIC|mentone': true,
  'VIC|noble-park': true,
  'VIC|clyde-north': true,
  'VIC|frankston': true,
  'VIC|point-cook': true,
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
  /*
   * The homepage service-area suburbs, 12 October 2026. "One of the suburbs
   * where we have the most active sites" is the client records' claim, the
   * one the homepage makes for the whole list. Everything else about each
   * place was checked against the council, the venue or the suburb's own
   * record before it was written down.
   */
  'VIC|lilydale': {
    intro:
      'Lilydale is one of the suburbs where Commercial Painters has the most active sites. It is the commercial centre of the Yarra Ranges: the council’s civic offices on Anderson Street, the Main Street shops, the Box Hill Institute campus at Lilydale Lakeside, and the industrial estates on the edge of town.',
    localNotes: [
      'The work runs from Main Street shopfronts, painted around trading hours and a busy footpath, to factory and warehouse units on the industrial estates, where the yard has to stay open for trucks and deliveries while the crew works.',
    ],
  },
  'VIC|boronia': {
    intro:
      'Boronia adjoins Bayswater, a couple of kilometres from our Bayswater North base, and is one of the suburbs where we have the most active sites. Its commercial centre is the cluster of shopping centres and street shops around Boronia station, Boronia Junction and Boronia Mall among them, along Dorset and Boronia Roads.',
    localNotes: [
      'Around the shops sit medical and allied-health suites, offices, childcare centres and schools. Retail tenancies are painted shopfront by shopfront, early in the morning or after close, with the walkways kept open and each tenancy cleaned down before it trades again.',
    ],
  },
  'VIC|mitcham': {
    intro:
      'Mitcham is one of the suburbs where we have the most active sites. Its commercial buildings line Whitehorse Road and cluster around Mitcham station: shops, offices and medical suites, with car yards and showrooms along the highway and Mitcham Private Hospital to the north.',
    localNotes: [
      'Showrooms on Whitehorse Road trade behind large areas of glazing with stock on the floor, so interiors are painted in sections with the floor and vehicles protected and the doors open to customers. Clinical rooms are painted between sessions with low-odour systems.',
    ],
  },
  'VIC|mooroolbark': {
    intro:
      'Mooroolbark, between Croydon and Lilydale, is one of the suburbs where we have the most active sites. Its commercial buildings are the shops and offices around Mooroolbark station and Brice Avenue, schools and childcare centres, and light industrial units.',
    localNotes: [
      'Schools and childcare centres here are painted in the holidays or at weekends, room by room, with low-odour coatings and the rooms cleaned and aired before children come back. The shops and offices around the station are painted early or after close so they trade as normal.',
    ],
  },
  'VIC|ringwood-east': {
    intro:
      'Ringwood East is about three kilometres from our Bayswater North base and one of the suburbs where we have the most active sites. Its largest building is Maroondah Hospital; around it are the shops near Ringwood East station, medical and allied-health suites, schools and childcare centres.',
    localNotes: [
      'Clinical work is painted around patients and staff: one area at a time, low-odour coatings, and each room cleaned and handed back before the next is opened up.',
    ],
  },
  'VIC|forest-hill': {
    intro:
      'Forest Hill is one of the suburbs where we have the most active sites. Two shopping centres anchor it, Forest Hill Chase on Canterbury Road and Brentford Square, with offices, medical suites, schools and childcare centres around them.',
    localNotes: [
      'Shopping-centre tenancies are painted to the centre’s own rules: outside trading hours, after a contractor induction, and with the shared malls and floors protected, because they belong to the landlord rather than the tenant.',
    ],
  },
  'VIC|melbourne': {
    intro:
      'The CBD is one of the places where Commercial Painters has the most active sites. Work in the Hoddle Grid runs from office floors and lobbies in the towers to shopfronts, arcades, hotels and the older buildings along the laneways.',
    localNotes: [
      'Most of it is interior work done out of hours: an office floor repainted overnight or over a weekend so it opens on Monday as normal, or a vacant floor turned around between one tenant leaving and the next fitting out.',
    ],
  },
  'VIC|south-yarra': {
    intro:
      'South Yarra is one of the suburbs where we have the most active sites. Its commercial buildings run along Chapel Street and Toorak Road, shops, cafés, restaurants, bars and offices, and around them stands one of Melbourne’s densest concentrations of apartment buildings, each with common areas run by an owners corporation.',
    localNotes: [
      'Strata work here is lobbies, corridors, stairwells and car parks, painted while the people who live there come and go. It is scheduled through the building manager and the owners corporation, with the lifts protected and each floor handed back as it is finished.',
      'The suburb is split at Punt Road: the City of Melbourne to the west, the City of Stonnington to the east, where Chapel Street and Toorak Road are. Which side a building is on decides whose permits and heritage controls apply.',
    ],
  },
  'VIC|st-kilda': {
    intro:
      'St Kilda is one of the suburbs where we have the most active sites. Its commercial buildings face the bay or line Fitzroy and Acland Streets: hotels, bars, restaurants and cafés, shopfronts and offices, among a large stock of apartment blocks with shared common areas.',
    localNotes: [
      'Fitzroy and Acland Streets trade from breakfast until late, so a hospitality venue here is usually painted early in the morning or on the day it is closed, and the room is cleaned down before service.',
      'Large parts of St Kilda are under heritage overlays, so a change of colour on an older frontage can need a planning permit before any work starts.',
    ],
  },
  'VIC|cheltenham': {
    intro:
      'Commercial Painters has painted office suites in a commercial unit development on Christensen Street, Cheltenham, and Cheltenham is one of the suburbs where we have the most active sites. The suburb holds Westfield Southland, the shops on Charman Road, and business and light industrial units in the streets around them.',
    localNotes: [
      'At Christensen Street the crew rolled walls and ceilings through office suites under fitout: off extension poles at floor level, and in harness from an elevated work platform at the bulkheads under the exposed roof framing. Kitchenettes and window frames were masked, and the finished suites, with the floors clear, are photographed below.',
    ],
  },
  'VIC|caulfield-north': {
    intro: 'PENDING',
    localNotes: [],
  },
  'VIC|mentone': {
    intro:
      'Mentone is one of the suburbs where we have the most active sites. Its commercial centre is the shopping strip around Mentone station, on Como Parade and Balcombe Road, and it holds several large schools, among them Mentone Grammar and Kilbreda College.',
    localNotes: [
      'School buildings are painted in term breaks and at weekends, block by block, so classrooms are ready for the first day back. The shops by the station are painted early in the morning or after close, one tenancy at a time.',
    ],
  },
  'VIC|noble-park': {
    intro:
      'Commercial Painters has repainted the exterior of a working factory in Noble Park in the client’s brand colours, without stopping production. Noble Park is also one of the suburbs where we have the most active sites.',
    localNotes: [
      'The factory’s walls were washed down and the render repaired before two coats of exterior paint went on. Access was matched to each part of the building, with boom lifts for the high areas, scissor lifts for the mid-level walls and scaffolding for the tight corners, and the work was timed around the factory’s peak periods.',
      'The job is written up as a case study and photographed below, and the blog has an article on how it was done.',
    ],
  },
  'VIC|clyde-north': {
    intro:
      'Clyde North is one of Melbourne’s newest suburbs and one of the places where we have the most active sites. Its commercial buildings have gone up with the estates around them: childcare centres, schools, medical centres and the shops of new neighbourhood centres.',
    localNotes: [
      'Childcare centres are painted while they are closed, at weekends or over the summer shutdown, with low-odour coatings and the rooms cleaned and aired before children return. Schools are painted in the term breaks.',
    ],
  },
  'VIC|frankston': {
    intro:
      'Commercial Painters repainted the Frankston office of a disability services provider, one of eleven offices painted for that organisation across Melbourne under a single contract. Frankston is also one of the suburbs where we have the most active sites.',
    localNotes: [
      'At Frankston, photographed in July 2025, the open-plan floor was painted with the desks and monitors left in place: walls rolled off extension poles, ceilings cut in from stepladders, and drop sheets down the corridors and the stair. Across the programme, much of the work ran outside business hours so staff could keep working.',
      'Beyond that office, Frankston’s commercial stock takes in the city centre’s shops and offices, Bayside Shopping Centre, Frankston Hospital, and the Monash University and Chisholm campuses.',
    ],
  },
  'VIC|point-cook': {
    intro:
      'Point Cook, on the bay side of Wyndham, is one of the suburbs where we have the most active sites. Most of its commercial buildings have gone up since the late 1990s: Point Cook Town Centre, the Sanctuary Lakes shopping centre, childcare and medical centres, and schools. RAAF Base Williams and the RAAF Museum are in the suburb too.',
    localNotes: [
      'Town-centre tenancies are painted around the centre’s trading hours and the landlord’s rules, out of hours where required, with the shared walkways protected and each tenancy handed back clean.',
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
