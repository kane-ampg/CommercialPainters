import type { Review } from '@/lib/content/types';

/**
 * Reviews.
 *
 * Two different things live in this file, and keeping them apart is the whole
 * point of it.
 *
 * **Google reviews** (`firstParty: false`). Reproduced from the Google Business
 * Profile, with the Google attribution intact and a link back to the profile,
 * and excluded from `aggregateRating` markup. That exclusion is deliberate:
 * Google's review snippet guidelines want ratings collected by the site itself,
 * and marking up reviews read back off Google is a well-worn route to a manual
 * action.
 *
 * Only reviews that read as commercial or sector-neutral are carried, and only
 * ones that can be reproduced word for word under the current trading name.
 * Quotes are never edited: a review that names something else is left out
 * rather than reworded, because a reworded quotation is not a quotation.
 *
 * **First-party reviews** (`firstParty: true`). None yet. These are reviews
 * given to the business directly, with the reviewer's agreement to reproduce
 * them. Only these reach `aggregateRating`, and adding the first one switches
 * the structured data on by itself.
 *
 * `date` is null on all of them because the widget the quotes were read from
 * does not expose review dates — they are readable on the Google Business
 * Profile and worth backfilling, since an undated review ages invisibly.
 */

/**
 * The Google Business Profile aggregate, as the profile itself reports it.
 *
 * Displayed as an attributed third-party figure — "5.0 on Google, from 70
 * reviews" — and never emitted as `aggregateRating`, for the reason above.
 * Re-read it off the profile when it drifts; nothing derives it.
 */
export const googleAggregate = {
  rating: 5.0,
  count: 70,
  /** Where the number was read, and where a visitor can check it. */
  url: 'https://search.google.com/local/reviews?placeid=ChIJnV9lqRIw1moRftY3Ankvfdw',
  /** Date the figure above was last read off the profile. */
  asOf: '2026-08-24',
} as const;

export const reviews: readonly Review[] = [
  {
    id: 'google-jordan',
    rating: 5,
    quote:
      'I have been working with Reece for a number of weeks, maybe months, to begin works on having our building painted. Our store had seen better days and Reece and his team worked around many of my setbacks with the utmost professionalism. Reece was receptive and quick to communicate via phone or email. The team got the job done quickly and even went back in to do some final touch ups a day or two after. I can’t thank Reece and the team enough. We appreciate you bringing our building and our store back to life!',
    attribution: 'Jordan',
    date: null,
    audience: 'commercial',
    source: 'Google Business Profile',
    firstParty: false,
    verified: true,
  },
  {
    id: 'google-christopher-hayward',
    rating: 5,
    quote:
      'Couldn’t be happier with the service! Communication was excellent from the start, prompt, professional, and easy to deal with. The quality of the work was outstanding could not recommend enough. These guys made the whole process easy and stress free',
    attribution: 'Christopher Hayward',
    date: null,
    audience: 'commercial',
    source: 'Google Business Profile',
    firstParty: false,
    verified: true,
  },
  {
    id: 'google-peter-other',
    rating: 5,
    quote:
      'Great workmanship with excellent communication and planning. Everything that was requested was delivered with high quality and no questions asked. The team was hard working and very friendly. Highly recommended.',
    attribution: 'Peter Other',
    date: null,
    audience: 'commercial',
    source: 'Google Business Profile',
    firstParty: false,
    verified: true,
  },
] as const;

export const verifiedReviews = reviews.filter((review) => review.verified);

/** Google reviews, reproduced with attribution. Never marked up as ratings. */
export const googleReviews = verifiedReviews.filter((review) => !review.firstParty);

/**
 * Reviews given to the business directly, with permission to reproduce.
 *
 * The only reviews `aggregateRating` may be derived from. Empty today.
 */
export const firstPartyReviews = verifiedReviews.filter((review) => review.firstParty);

/**
 * Average of first-party reviews, or null when there are none.
 *
 * Returns null rather than 0 so a caller cannot accidentally render "0 out of
 * 5" for a business that simply has not published any first-party reviews yet.
 *
 * Deliberately blind to the Google reviews above. If this counted them, the
 * site would emit an aggregate over reviews it does not host — the exact thing
 * the split in this file exists to prevent.
 */
export function averageRating(): number | null {
  if (firstPartyReviews.length === 0) return null;
  const total = firstPartyReviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / firstPartyReviews.length) * 10) / 10;
}
