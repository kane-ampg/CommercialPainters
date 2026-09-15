/**
 * Council assignment audit — centroid-outlier detection.
 *
 * The upstream dataset's `lgaregion` is wrong for roughly 7% of localities,
 * and no other column in it is a reliable cross-check: `lgacode` mirrors the
 * same bad data, and `sa3name` is right in some of these cases and wrong in
 * others. scripts/build-locations.mts carries hand-verified corrections in
 * COUNCIL_OVERRIDES_BY_LOCALITY; this is the tool that finds what still needs
 * one.
 *
 * WHY CENTROIDS
 *
 * Council boundary polygons are not in this repository, so "is this locality
 * inside its council" cannot be answered directly. What can be answered is
 * whether a locality sits nearer the middle of some *other* council than the
 * middle of its own — which is what a mis-assignment looks like from the
 * outside. Centroids are computed as coordinate medians rather than means, so
 * a council that already contains a few bad assignments still reports an
 * honest centre.
 *
 * Nearest-neighbour smoothing was tried upstream and rejected: bad assignments
 * cluster, so the voting neighbours are themselves wrong. Comparing against a
 * whole council's centre is resistant to that in a way that polling adjacent
 * suburbs is not.
 *
 * WHAT IT WILL NOT DO
 *
 * It reports; it never edits. Every correction lands in build-locations.mts by
 * hand, because a council renders on an indexable page as a stated fact and a
 * plausible-looking automatic reassignment is exactly how a wrong fact ships
 * quietly. A flagged locality is a question, not a verdict — councils are not
 * discs, and a legitimately long or L-shaped council will surface its own
 * extremities here.
 *
 * Usage:
 *   node scripts/audit-councils.mjs            # VIC + QLD
 *   node scripts/audit-councils.mjs --state VIC
 *   node scripts/audit-councils.mjs --state VIC --indexable-only
 */

import { readFileSync } from 'node:fs';

const EARTH_KM = 6371;

function haversine(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

function median(values) {
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const args = process.argv.slice(2);
const stateArg = args.includes('--state') ? args[args.indexOf('--state') + 1] : null;
const indexableOnly = args.includes('--indexable-only');

const { localities } = JSON.parse(
  readFileSync(new URL('../content/locations.generated.json', import.meta.url), 'utf8'),
);

const scoped = localities.filter((l) => (stateArg ? l.state === stateArg : true));

// Centroids are per council *per state*: council names are not unique across
// states in this dataset, and averaging a Victorian council with a Queensland
// one of the same name would put its centre in the Tasman Sea.
const byCouncil = new Map();
for (const l of scoped) {
  const key = `${l.state}|${l.council}`;
  if (!byCouncil.has(key)) byCouncil.set(key, []);
  byCouncil.get(key).push(l);
}

const centroids = new Map();
for (const [key, members] of byCouncil) {
  centroids.set(key, {
    lat: median(members.map((m) => m.coords.lat)),
    lng: median(members.map((m) => m.coords.lng)),
    size: members.length,
  });
}

const findings = [];
for (const l of scoped) {
  if (indexableOnly && l.tier !== 1) continue;
  const ownKey = `${l.state}|${l.council}`;
  const own = centroids.get(ownKey);
  // A single-locality council is its own centroid; there is nothing to test.
  if (!own || own.size < 3) continue;

  const ownDist = haversine(l.coords, own);

  let best = null;
  for (const [key, c] of centroids) {
    if (key === ownKey) continue;
    if (!key.startsWith(`${l.state}|`)) continue;
    if (c.size < 3) continue;
    const d = haversine(l.coords, c);
    if (!best || d < best.dist) best = { council: key.split('|')[1], dist: d };
  }
  if (!best) continue;

  // Flagged when another council's centre is materially nearer. The 1.5x
  // margin and the 2km floor together keep ordinary boundary suburbs — which
  // are legitimately near two centres — out of the report.
  if (ownDist > best.dist * 1.5 && ownDist - best.dist > 2) {
    findings.push({
      name: l.name,
      state: l.state,
      tier: l.tier,
      assigned: l.council,
      assignedDist: ownDist,
      nearest: best.council,
      nearestDist: best.dist,
      ratio: ownDist / best.dist,
    });
  }
}

findings.sort((a, b) => b.ratio - a.ratio);

const scope = [stateArg ?? 'VIC+QLD', indexableOnly ? 'tier 1 only' : 'all tiers'].join(', ');
console.log(`Council audit — ${scoped.length} localities (${scope})`);
console.log(`${findings.length} flagged\n`);

if (findings.length) {
  console.log(
    'tier  locality              assigned council      km   nearest council       km   ratio',
  );
  console.log('-'.repeat(94));
  for (const f of findings) {
    console.log(
      `  ${f.tier}   ${f.name.padEnd(21)} ${f.assigned.padEnd(21)} ${f.assignedDist.toFixed(1).padStart(4)}  ` +
        `${f.nearest.padEnd(21)} ${f.nearestDist.toFixed(1).padStart(4)}  ${f.ratio.toFixed(1)}x`,
    );
  }
  console.log(
    '\nEach row is a question, not a verdict. Verify by hand, then add confirmed\n' +
      'corrections to COUNCIL_OVERRIDES_BY_LOCALITY in scripts/build-locations.mts\n' +
      'and re-run `npm run locations:build`.',
  );
}
