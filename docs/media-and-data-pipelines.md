# Media and data pipelines

Four offline tools under `scripts/` produce committed artefacts from sources that are not committed.
None of them run during `next build`. Each is run by hand when its input changes, and the output is
reviewed as a diff.

## Site photography: `scripts/build-gallery-images.mjs`

```
npm run gallery:build
```

|          |                                                                                                                                                                                                                |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input    | `media/photography/<site folder>/*.jpg`, the photographer's masters (537 MB, frames up to 9169x13754). Gitignored.                                                                                             |
| Output   | `public/images/gallery/<slug>/<slug>-NN.webp` (long edge 1800px, quality 78, source order preserved) and `content/galleries.generated.json` (per frame: `src`, `width`, `height`, `blurDataURL`, `sourceFile`) |
| Result   | 54 frames across 7 sites, 6.6 MB                                                                                                                                                                               |
| Requires | `sharp`, which Next already depends on                                                                                                                                                                         |

Decisions baked in:

1. **Allow-list, not a directory scan.** `SITES` names the seven commercial shoots. Two delivered
   shoots of private dwellings are excluded and would be quietly re-admitted by a scan.
2. **No cropping.** Half the frames are portrait. Real dimensions go into the manifest and the
   filmstrip carousel sizes each slide from its own aspect ratio.
3. **Per-frame exclusion by name.** One Toyota frame shows the previous brand's name and domain
   legibly on a van and is held back in `exclude`.
4. **Alt text is not written here.** It lives in `content/galleries.ts`, keyed by the
   photographer's file name (not the positional output name, which shifts when a frame is added or
   removed). `sourceFile` in the manifest is the join.

The masters were originally delivered inside `public/` under a folder named for the previous
brand. That failed `brand.test.ts` on all 79 file names and would have deployed 537 MB. They were
moved to `media/photography/` untouched.

## Hero reel: `scripts/encode-hero-video.mjs`

```
node scripts/encode-hero-video.mjs
```

|          |                                                                                                    |
| -------- | -------------------------------------------------------------------------------------------------- |
| Input    | `media/hero-master.mp4`, 3840x2160, 57 s, 50 Mbps, 342 MB. Gitignored.                             |
| Output   | `public/video/hero-1080.mp4`, `public/video/hero-720.mp4`, `public/images/hero/banner-poster.webp` |
| Requires | `ffmpeg` on PATH, or the `ffmpeg-static` package if installed                                      |

The cut ends at 28.767 s on a scene boundary, the last frame before the reel moves to residential
work. Audio is stripped. H.264 only (VP9 saved 4 to 9 percent and was not worth a second set of
binaries).

## Suburb dataset: `scripts/build-locations.mts`

```
npm run locations:build             # uses .cache/ if present
npm run locations:build -- --fetch  # re-download first
```

|           |                                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input     | `australian_postcodes.json` from `matthewproctor/australianpostcodes` on GitHub, cached at `.cache/`. Gitignored.                                                                                               |
| Output    | `content/locations.generated.json`: 1,387 localities (583 VIC, 804 QLD) with slug, name, state, postcodes, coordinates, council, nearest anchor, distance, region, rural-fringe flag, tier, six neighbour hrefs |
| Committed | Yes. Builds are deterministic and offline. Prettier ignores the file.                                                                                                                                           |

The script **fails rather than degrades**. `EXPECTED_TOTAL = 1387` is a verified count, not a
target: if the pipeline stops matching it, a human looks at the diff. Two documented reductions
(1,527 to 1,440 on 24 August 2026, then to 1,387 on 26 August) removed Australia Post artefacts
that are not suburbs: post offices, delivery centres, shopping centres, universities, hospitals,
RAAF bases.

Other rules in the script: `NON_SUBURB_LOCALITIES` and `NON_SUBURB_PATTERNS` exclusions, a
single-locality-council allow-list, impossible-council checks, and `COUNCIL_OVERRIDES_BY_LOCALITY`
for hand-verified council corrections (the upstream `lgaregion` is wrong for roughly 7 percent of
localities). Every locality's council must have a note in `content/councils.ts` or the build
throws.

Distances are measured with `lib/geo/haversine.ts` from the anchors in `lib/geo/anchors.ts`. The
Victorian anchor is the Bayswater North suburb centroid, which must agree with the office suburb in
`lib/site.ts`.

Hand-written copy is never in the generated file. It lives in `content/locations.overrides.ts` so
the generator can be re-run without destroying writing.

## Council audit: `scripts/audit-councils.mjs`

```
node scripts/audit-councils.mjs --state VIC
node scripts/audit-councils.mjs --state VIC --indexable-only
```

Written 14 September 2026 after three council errors were found in the Tier 3 set (Coburg and
Northcote swapped, Dandenong tagged Casey). It computes each council's centroid as a coordinate
median and flags localities that sit nearer another council's centre than their own.

It **reports and never edits**. A flagged row is a question; corrections land by hand in
`COUNCIL_OVERRIDES_BY_LOCALITY`. Known blind spot: it finds distant mis-assignments, not
neighbourly swaps between adjoining councils. Known false positives: Chirnside Park (western edge
of the large Yarra Ranges) and Tullamarine (deliberately pinned to Brimbank because the rule for
split suburbs is the council covering the commercial core, which a centroid cannot see).
`tests/unit/tier1-councils.test.ts` and `council-overrides.test.ts` pin the verified answers.

## Build-time image generation

Not scripts, but generated artefacts worth knowing about:

- `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`: favicons, committed files built from
  `public/images/company/favicon.webp` by `scripts/build-icons.mjs` (`npm run icons:build`)
- `app/brand/logo.png/route.tsx`: 512px stacked lockup for `Organization.logo`
- `app/(site)/opengraph-image.tsx`: the default social card
- `public/fonts/og/`: the font files those renderers read, via `lib/brand/og-fonts.ts`
- Next's image optimiser serves AVIF and WebP variants of every committed image with a one-year
  cache TTL (`next.config.ts`), because a committed file only changes with a deploy
