# HOMATCH Batch 5.1 — Dynamic Destination Geocoding

## Summary

Batch 5.1 adds server-side Pelias geocoding through the HeiGIT endpoint so
users can enter arbitrary HCMC universities, offices, landmarks, and
addresses. Existing verified UEL and VNU-HCM references are still resolved
locally first. Dynamic coordinates are used for routing only after validation;
ambiguous results require an explicit user selection.

The existing hard constraints, commute scoring, and top-level formula remain
unchanged:

```text
finalScore = 0.60 * semanticScore + 0.40 * criteriaScore
```

No listings, images, authentication, deployment, or paid services were
modified.

## Changed files

- `lib/ai/geocode.ts`
  - Pelias search client using `https://api.heigit.org/pelias/v1/search`.
  - Local-reference-first resolution.
  - HCMC coordinate and Vietnam administrative validation.
  - Confidence filtering, ten-minute in-memory cache, timeout, and bounded
    429 retry.
- `app/api/recommendations/route.ts`
  - Resolves local or dynamic destinations before Matrix routing.
  - Returns `destination_ambiguous` with candidates instead of choosing
    silently.
  - Accepts a validated user-selected candidate for the follow-up request.
- `components/results/results-view.tsx`
  - Displays destination candidates and reruns ranking after selection.
  - Displays the resolved destination through the existing commute response.
- `tests/ai-pipeline.test.ts`
  - Adds mocked dynamic resolution, ambiguity, and missing-key coverage.
- `docs/batch-5.1-report.md`
  - This report.

## Geocoding architecture

1. The browser sends the existing destination text to
   `POST /api/recommendations`.
2. The Node.js route checks the documented local references first.
3. If no local reference matches, the server calls Pelias with:
   - the user destination plus `Ho Chi Minh City, Vietnam`;
   - `boundary.country=VNM`;
   - a maximum of five candidates.
4. Results are accepted only when coordinates are finite and inside the
   configured HCMC/nearby bounds, and the result is in Vietnam or an HCMC
   administrative area.
5. A single reliable candidate is resolved automatically. Multiple plausible
   candidates are returned to the UI for explicit selection.
6. Only a resolved destination is passed to the existing ORS Matrix client.

Pelias and Matrix calls both use `ORS_API_KEY` from the server environment.
The key is never included in browser code, response payloads, logs, or this
report.

## Supported destination examples

| Input | Resolution |
|---|---|
| UEL / Đại học Kinh tế Luật | Existing verified local reference |
| VNU-HCM / ĐHQG | Existing verified local reference |
| Landmark 81 | Dynamic Pelias geocoding |
| HUTECH University | Dynamic Pelias geocoding; user selection if ambiguous |
| Van Lang University | Dynamic Pelias geocoding; user selection if ambiguous |
| Vinhomes Central Park | Dynamic Pelias geocoding |
| Office or street address in HCMC | Dynamic Pelias geocoding when reliable |
| Unknown fictional location | Commute unavailable |

The local reference source and coordinates for UEL/VNU-HCM remain in
`data/location-references.ts`.

## Ambiguity handling

The API returns HTTP 409 with `state: "destination_ambiguous"` and candidate
labels/coordinates when it cannot safely choose one result. The Results page
shows a selection panel. No Matrix request is made until the user selects a
candidate. A failed or low-confidence lookup produces `Commute unavailable`;
it never invents coordinates.

## Commute integration

The existing `lib/ai/commute.ts` implementation is reused without changing
the `driving-car` profile, Matrix payload format, hard-constraint ordering, or
criteria weighting. The UI continues to label results as estimated driving
time and distance, not motorbike time or live traffic.

## Actual provider test evidence

One live provider probe was run for `Landmark 81` using the local server
environment without printing the credential:

- Pelias response: HTTP 200.
- Candidate label: `Landmark 81, Ho Chi Minh City, HC, Vietnam`.
- Coordinates: `[106.722041, 10.794943]` in provider `[longitude, latitude]`
  order.
- ORS Matrix response: HTTP 200.
- Test origin: the UEL reference coordinate.
- Estimated driving result: 18 minutes, 16.1 km.

This confirms both dynamic geocoding and route-based commute calculation. It
does not imply live traffic or motorbike-specific accuracy.

## Tests

| Check | Result |
|---|---|
| UEL local reference | PASS |
| Landmark 81 mocked dynamic geocoding | PASS |
| Ambiguous candidates require selection | PASS |
| Missing geocoding key | PASS |
| Existing ORS 429 retry | PASS |
| Unreachable route handling | PASS |
| Hard constraints before commute | PASS |
| 60/40 hybrid formula | PASS |
| `npm run test:ai` | PASS — 13/13 |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| Live Landmark 81 Pelias + Matrix probe | PASS |

## API usage and limitations

- Geocoding cache: five minutes was used for Matrix routes; Pelias results
  use a ten-minute in-memory cache.
- Pelias HTTP 429 retries once with a bounded `Retry-After` delay.
- HTTP 403, timeout, malformed results, missing key, and provider failures
  result in an unavailable commute state.
- Vercel instances have separate memory caches, so caching reduces repeated
  calls per instance but is not a shared persistent cache.
- Coordinate bounds are intentionally limited to HCMC and nearby relevant
  areas; destinations outside that region are rejected.
- Pelias success alone does not mean routing succeeded. The UI shows commute
  information only when Matrix returns a valid route.
- ORS free-plan quota and provider availability remain external constraints.

## Security checks

- `ORS_API_KEY` is read only in server-side geocoding and Matrix modules.
- No `NEXT_PUBLIC_ORS_API_KEY` is used.
- Personal contact details are not sent to Pelias.
- API credentials were not printed, returned, committed, or written to the
  report.
- No dataset or image changes were made for this batch.

## Remaining blockers

- Dynamic destination quality depends on HeiGIT Pelias coverage and confidence
  metadata.
- A user must choose among ambiguous candidates before commute can be scored.
- The live test used one Landmark 81 query and one route; other destinations
  still require manual verification under the available quota.
- ORS remains a driving-car estimate and does not provide precise motorbike or
  live-traffic travel time.
