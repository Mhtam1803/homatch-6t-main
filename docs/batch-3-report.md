# HOMATCH Batch 3 report

## Summary

Batch 3 replaces Gemini intent parsing with Groq `openai/gpt-oss-20b` and
adds a zero-cost semantic hybrid path:

- Groq parses one renter request per search on the server.
- `intfloat/multilingual-e5-small` creates normalized 384-dimensional vectors.
- Listing vectors are generated offline and stored in a portable JSON artifact.
- The browser loads the ONNX-compatible `Xenova/multilingual-e5-small` model
  only when results are requested, then sends one query vector to the server.
- The server applies hard constraints first, then combines E5 cosine similarity
  (60%) with interpretable rule preferences (40%). These are an engineering
  baseline, not scientifically validated weights.
- ChromaDB is local indexing/testing infrastructure only.

The existing UI, authentication, images, 100 synthetic listings, listing IDs,
and original `lib/matching.ts` scoring formula remain intact. The new AI path
is used by the results page when all services and the artifact are available;
otherwise the UI visibly labels its rule-based degraded result.

## Changed files

- `package.json`, `package-lock.json`
- `.env.example`, `.gitignore`
- `types/listing.ts`, `data/listings.ts`
- `lib/ai/errors.ts`
- `lib/ai/groq.ts`
- `lib/ai/e5.ts`
- `lib/ai/browser-e5.ts`
- `lib/ai/artifact.ts`
- `lib/ai/hybrid.ts`
- `app/api/ai/intent/route.ts`
- `app/api/recommendations/route.ts`
- `next.config.mjs`
- `components/results/results-view.tsx`
- `components/search/matching-loader.tsx`
- `scripts/generate-e5-artifact.py`
- `scripts/index-chroma.py`
- `scripts/requirements-ai.txt`
- `tests/ai-pipeline.test.ts`
- `data/embeddings/listings-multilingual-e5-small-384.json`

The obsolete Gemini files and `/api/semantic-search` route were removed.
Batch 1 image/data files outside the typed adapter additions were not changed.

## Groq intent parsing

The server reads `GROQ_API_KEY` and optional `GROQ_MODEL` only. It never sends
personal contact fields to Groq, never logs the credential, and returns
controlled degraded states for missing credentials, invalid credentials,
timeouts, rate limits, and malformed output.

The request uses Groq strict JSON Schema mode with `additionalProperties:false`,
all properties required, and nullable unions for unknown values. The response
is parsed with Zod. The live Vietnamese request returned HTTP 200 and a valid
typed response containing a location, budget, household size, and lifestyle
preferences. No credential or raw authorization header was included in logs
or this report.

## E5 embedding architecture

Offline:

```powershell
.\.venv\Scripts\pip install -r scripts\requirements-ai.txt
.\.venv\Scripts\python.exe scripts\generate-e5-artifact.py
.\.venv\Scripts\python.exe scripts\index-chroma.py
```

The generator encodes listing text with `passage: `, mean pooling, and
normalization. Browser queries use `query: `, the same model, mean pooling,
normalization, and 384 dimensions. The artifact records:

- model: `intfloat/multilingual-e5-small`
- dimensions: `384`
- pooling: `mean`
- normalized: `true`
- 100 unique IDs from `HCM_001` through `HCM_100`

The generated artifact is non-secret and is no longer ignored by Git, so a
normal Vercel build can include it. ChromaDB and `.venv` remain ignored and
must never be deployed.

## Hybrid filtering and explanations

Hard constraints are applied before semantic ranking:

- total monthly cost
- minimum bedrooms
- minimum area
- household capacity
- explicit pet requirement

Results return `score`, `semanticScore`, `ruleScore`, and matched field
explanations. The API returns at most 10 results. A zero eligible count is
reported as a no-match state with a safe suggestion to relax explicit
constraints; it does not invent listings.

## Validation results

| Check | Result | Evidence |
|---|---|---|
| Groq Vietnamese intent request | PASS | Local endpoint returned 200 and typed JSON |
| One intent call per normal UI search | PASS | Results flow makes one `/api/ai/intent` request |
| E5 model download/inference | PASS | Node Transformers runtime returned 384 dimensions |
| Listing artifact | PASS | 100 vectors, 100 unique IDs, all 384 dimensions |
| ChromaDB | PASS | ChromaDB 1.5.9 indexed and verified 100 vectors |
| Student query | PASS | `HCM_008`, `HCM_005`, `HCM_016` |
| Working professional query | PASS | `HCM_032`, `HCM_031`, `HCM_095` |
| Family query | PASS | `HCM_081`, `HCM_085`, `HCM_041` |
| Local Groq + E5 + recommendation flow | PASS | 384-d query, intent 200, recommendations 200 |
| 12 representative Vietnamese cases | PARTIAL | 5 completed 200, later requests hit Groq HTTP 429 |
| Missing/invalid artifact behavior | PASS | API returns controlled degraded response |
| Hard constraint hybrid test | PASS | Unit test excludes impossible budget/pet matches |
| `npm run test:ai` | PASS | 4 tests passed |
| `npx tsc --noEmit` | PASS | exit code 0 |
| `npm run build` | PASS | Next.js build completed with both AI routes |
| Dataset integrity | PASS | 100 listings and 100 unique IDs preserved |
| Secret exposure scan | PASS | No `NEXT_PUBLIC_GROQ_API_KEY`; key is server-only |

The 12-case run covered student, premium student, office worker, remote
worker, couple, young family, family with children, pet owner, studio,
premium, strict-budget/no-match, and working-professional queries. Five
completed with real Groq/E5 recommendations before Groq rate limiting caused
the remaining cases to enter the documented degraded state. No fabricated
results were used.

## Production and cost caveats

- Groq free-tier rate limits can interrupt bursts of manual tests. The UI
  shows a degraded rule-based state rather than claiming Groq output.
- Browser E5 inference downloads model assets on first semantic search and
  caches them in the browser. The tested Node runtime produced a 384-vector;
  final Vercel/browser validation should measure first-load latency on the
  target devices. No lexical fallback is labeled as E5.
- The production listing artifact is approximately 1.2 MB and contains no
  secret. It must remain present in the repository/build context.
- ChromaDB is not part of Vercel runtime.
- No paid service, billing change, deployment, or remote write was performed.

## Manual Vercel verification

1. Add `GROQ_API_KEY` and optional `GROQ_MODEL=openai/gpt-oss-20b` as server
   environment variables. Never use a `NEXT_PUBLIC_` prefix.
2. Confirm `data/embeddings/listings-multilingual-e5-small-384.json` is
   included in the deployed source/build.
3. Run a Vietnamese search from **Find a Home**.
4. Confirm the results status says AI ranking, not degraded ranking.
5. Inspect the browser Network panel: only the intent and recommendation
   endpoints are called; the Groq credential must never appear.
6. Test a strict impossible budget and confirm a no-match/degraded message,
   not an invented home.
7. Verify Browse Homes, details, favorites, map, authentication, and images.

## Remaining blockers

- Groq quota/rate limiting prevented all 12 live cases from completing in one
  burst; repeat them with spacing or an approved quota.
- Browser first-load performance on the deployed target still needs manual
  measurement. The model path is implemented and locally exercised, but no
  deployment was performed.
- The final Vercel project must include the non-secret vector artifact and a
  valid server-side Groq environment variable.

## Final checklist

- **PASS** — Groq server-only structured intent parsing
- **PASS** — E5 offline artifact with 100 normalized 384-d vectors
- **PASS** — ChromaDB local indexing and three semantic retrieval queries
- **PASS** — browser-compatible E5 query path and local end-to-end ranking
- **PASS** — hard constraints, interpretable hybrid breakdown, explanations
- **PASS** — existing UI/data/images/auth and original rule matcher preserved
- **PASS** — tests, typecheck, and production build
- **PARTIAL** — 12 live cases, limited by Groq HTTP 429 rate limiting
- **BLOCKED** — final Vercel browser performance verification until deployment
