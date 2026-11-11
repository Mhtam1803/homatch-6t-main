# HOMATCH Batch 5 — Commute matching

## Summary

Batch 5 adds estimated commute matching without changing the existing
top-level hybrid formula:

```text
finalScore = 0.60 * semanticScore + 0.40 * criteriaScore
```

The criteria score now includes commute only when a verified destination and a
reachable OpenRouteService result are available. The route profile is
`driving-car`; results are explicitly labelled as estimated driving time, not
motorbike or live traffic time.

No listings, images, authentication, deployment, billing, or remote services
were modified.

## Changed files

- `data/location-references.ts`
  - Adds documented verified references for UEL and Vietnam National University
    HCMC, with aliases, coordinates, and source URLs.
  - Unknown free-text destinations resolve to `null`; no coordinates are
    invented.
- `lib/ai/commute.ts`
  - Server-only ORS Matrix client.
  - Uses one matrix request for eligible listings and one destination.
  - Uses `[longitude, latitude]` coordinates.
  - Adds 10-second timeout, one bounded 429 retry, 403/429/provider handling,
    five-minute in-memory cache, coordinate validation, and unreachable-route
    handling.
- `lib/ai/hybrid.ts`
  - Applies hard constraints before commute requests.
  - Adds commute score to the internal criteria average only when available.
- `app/api/recommendations/route.ts`
  - Resolves verified destinations, calculates eligible-listing commute, and
    returns commute status without exposing the ORS credential.
- `types/listing.ts`
  - Adds the shared `CommuteEstimate` response type.
- `components/results/result-card.tsx`
  - Displays estimated driving minutes and distance, or `Commute unavailable`.
- `components/results/results-view.tsx`
  - Passes commute data to cards and updates the ranking explanation.
- `tests/ai-pipeline.test.ts`
  - Adds destination, score, 429 retry, unreachable-route, and missing-coordinate
    tests.
- `.env.example`
  - Documents server-only `ORS_API_KEY`.

## Architecture and API endpoints

Browser flow:

1. User enters a destination such as `UEL`.
2. Existing Groq intent parsing and browser E5 embedding run unchanged.
3. `POST /api/recommendations` receives the validated intent and query vector.
4. The Node.js route filters hard constraints.
5. A verified destination reference is resolved locally.
6. ORS Matrix is called once for eligible listing coordinates and that
   destination:

```text
POST https://api.heigit.org/openrouteservice/v2/matrix/driving-car
```

7. TypeScript cosine/hybrid ranking returns listing IDs, scores, and commute
   estimates.

The ORS key is read only from `process.env.ORS_API_KEY` in the server module.
It is never sent to the browser or included in response payloads.

## Destination references

| ID | Destination | Coordinates | Source |
|---|---|---|---|
| `uel` | University of Economics and Law (UEL) | `10.8712, 106.77846` | `https://mapcarta.com/W1024454546` |
| `vnuhcm` | Vietnam National University Ho Chi Minh City | `10.868562, 106.796312` | `https://en.wikipedia.org/wiki/Vietnam_National_University,_Ho_Chi_Minh_City` |

Coordinates are stored as `{ lat, lng }` in the reference file and converted
to `[lng, lat]` only when constructing the ORS request.

## Scoring implementation

Commute duration is normalized against a 60-minute baseline:

```text
commuteScore = clamp(1 - durationMinutes / 60, 0, 1)
```

The internal criteria score averages the existing boolean/semantic preference
checks and `commuteScore` when a route is available. If commute is unknown,
unreachable, rate-limited, or the key is missing, it is omitted from the
average, so listings are not unfairly penalized. The 60/40 top-level weighting
is unchanged.

## Test cases and results

| Case | Result |
|---|---|
| UEL alias resolves | PASS |
| Unknown destination returns no coordinates | PASS |
| Shorter commute scores higher | PASS |
| Commute affects criteria while semantic remains 60% | PASS |
| ORS HTTP 429 retries once and succeeds | PASS |
| Unreachable route returns unavailable | PASS |
| Missing listing coordinates do not create fake routes | PASS |
| Existing hard budget/pet filtering remains first | PASS |
| `npm run test:ai` | PASS — 10/10 |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |

The ORS tests use a local mocked `fetch`; no live provider request was made by
the automated suite and therefore no ORS quota was consumed.

## API quota and failure behavior

- One Matrix call is made per uncached destination/listing set, rather than one
  route request per listing.
- Results are cached in the current server instance for five minutes.
- HTTP 429 receives at most one retry and respects a bounded `Retry-After`.
- HTTP 403, timeout, malformed/empty matrix data, unreachable routes, missing
  credentials, and provider failures return `Commute unavailable` while
  preserving semantic/rule ranking.
- Vercel instances may have separate memory caches; this is an optimization,
  not a correctness requirement.

## UI behavior

Cards show:

```text
Estimated driving commute to University of Economics and Law (UEL): 12 min (3.4 km)
```

If the destination is typed but not in the verified reference file, or routing
is unavailable, cards show:

```text
Commute unavailable
```

The UI does not claim motorbike-specific or traffic-aware precision.

## Security checks

- `ORS_API_KEY` is server-only and is not prefixed with `NEXT_PUBLIC_`.
- The key is used only in `lib/ai/commute.ts` request headers.
- No key value was logged, returned, committed, or written to this report.
- `.env.local`, Python environments, and local ChromaDB remain ignored.
- The non-secret E5 artifact remains available to the production build.

## Vercel instructions

In the existing Vercel project only:

1. Add `ORS_API_KEY` as a server environment variable for Production and
   Preview as needed.
2. Keep `GROQ_API_KEY` and Supabase variables unchanged.
3. Do not add `NEXT_PUBLIC_ORS_API_KEY`.
4. Deploy only after reviewing and approving the repository changes.
5. Verify with a preview search using `UEL`.
6. Confirm the network shows `/api/recommendations` but never exposes an ORS
   request or authorization key in browser requests.

## Remaining limitations

- Only UEL and the VNU HCMC area have verified coordinate references currently.
  Other universities/workplaces intentionally show `Commute unavailable` until
  a coordinate is verified and added.
- ORS driving-car duration is an estimate and does not model live motorbike
  traffic.
- The free-plan quota and provider availability were not tested live in this
  batch. A valid ORS key is required for production commute results.
- The existing browser E5 first-load cost remains unchanged.
