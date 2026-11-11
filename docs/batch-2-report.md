# Batch 2 AI pipeline report

## 1. Summary

Batch 2 adds a server-only Gemini intent parser, an offline Gemini embedding
generator, local ChromaDB indexing scripts, and a separate semantic-search
API. The existing rule-based matcher and its Hybrid Scoring weights were not
changed. Semantic search is not part of Hybrid Scoring in this batch.

## 2. Changed files

- `lib/ai/constants.ts`, `errors.ts`, `gemini.ts`, `intent.ts`, `embeddings.ts`
- `app/api/ai/intent/route.ts`
- `app/api/semantic-search/route.ts`
- `scripts/generate-embeddings.mjs`
- `scripts/index-chroma.py`
- `scripts/requirements-ai.txt`
- `tests/ai-pipeline.test.ts`
- `.env.example`, `.gitignore`, `package.json` and `package-lock.json`

Batch 1 dataset, images, adapter, and matching code were preserved.

## 3. Architecture implemented

1. The browser may call `POST /api/ai/intent` with validated structured
   criteria. The route sends only non-contact search fields to Gemini.
2. Gemini returns schema-constrained JSON. Empty input returns an explicit
   empty intent without an API call. Structured budget and selected features
   override conflicting model values.
3. `POST /api/semantic-search` embeds a query as `RETRIEVAL_QUERY`, validates
   the artifact metadata and 768 dimensions, then ranks precomputed listing
   vectors with TypeScript cosine similarity.
4. ChromaDB is offline-only. Vercel does not need a ChromaDB server.

## 4. Gemini model IDs

- Intent parsing: `gemini-2.5-flash`
- Embeddings: `gemini-embedding-001`, 768 dimensions
- Document task: `RETRIEVAL_DOCUMENT`
- Query task: `RETRIEVAL_QUERY`

Model selection follows the official Gemini structured-output and embeddings
documentation reviewed during implementation. Free-tier availability can
change, so verify the account's current model quota before generation.

## 5. API endpoints

- `POST /api/ai/intent`
  - Body: `{ "criteria": SearchCriteria }`
  - Returns validated intent JSON or a controlled error code.
- `POST /api/semantic-search`
  - Body: `{ "query": string }`
  - Returns up to 20 `{ id, score }` results.

## 6. Embedding generation status

**BLOCKED** in this environment. `.env.local` contains a non-empty
`GEMINI_API_KEY`, and `scripts/generate-embeddings.mjs` now securely loads it
when no process environment variable is present. The key is never printed.
The live Gemini request was rejected with HTTP 403 because the project has no
Gemini free-tier access and enabling billing would be required. Generation
stopped at `HCM_001`; **0 real embeddings** were generated and no artifact was
created. The generator remains resumable: it skips matching saved IDs and
writes after each successful listing. No fake vectors were created.

## 7. ChromaDB indexing status

**BLOCKED** because the embedding artifact is unavailable. A local Python
virtual environment was created and ChromaDB **1.5.9** was installed
successfully. `npm run chroma:index` then stopped before indexing because the
real artifact is missing; **0 vectors** are currently in ChromaDB. After
generating the real vectors, run the command again. The script requires
exactly 100 unique listing IDs and verifies self-retrieval.

## 8. Test results

| Check | Result | Evidence |
|---|---|---|
| `npm run test:ai` | PASS | 7 tests passed |
| `npx tsc --noEmit` | PASS | exit code 0 |
| `npm run build` | PASS | Next.js build completed; AI routes listed |
| Dataset count | PASS | 100 records |
| Dataset IDs | PASS | 100 unique IDs, 0 duplicate groups |
| Gemini credential naming | PASS | only `GEMINI_API_KEY`; no `NEXT_PUBLIC_GEMINI_API_KEY` |
| Live Vietnamese Gemini intent request | BLOCKED | HTTP 403: free tier unavailable for this project |
| Real embedding generation | BLOCKED | stopped at HCM_001; 0 vectors generated |
| ChromaDB installation | PASS | ChromaDB 1.5.9 in `.venv` |
| Chroma indexing | BLOCKED | missing real embedding artifact; 0 vectors indexed |
| `POST /api/semantic-search` | BLOCKED | controlled 502 because Gemini rejected the credential |
| Three semantic retrieval queries | BLOCKED | no query embeddings or indexed vectors available |
| Production artifact availability | FAIL | source and `.next` artifact are both absent |

The automated tests cover Vietnamese and English prompt preservation, empty
intent handling, malformed JSON, missing credentials, structured-form
priority, cosine similarity, and dimension validation. Live Gemini tests are
blocked until a credential is supplied.

## 9. Known limitations

- Intent parsing is available as a backend service but is not yet used to
  alter the existing results ranking.
- Embedding artifacts are intentionally ignored by Git and must be generated
  locally or in a controlled offline build step.
- API rate limits, credentials, and model availability depend on the Gemini
  account's current free tier.
- The current test suite does not call external Gemini services.

## 10. Run locally

```powershell
npm install
$env:GEMINI_API_KEY = "your-key" # server-side shell variable only
npm run embeddings
python -m venv .venv
.\.venv\Scripts\pip install -r scripts\requirements-ai.txt
npm run chroma:index
npm run dev
```

Do not commit `.env.local`, API keys, generated vectors, or the Chroma
database. The direct Node generator loads `.env.local` only as a fallback to
the process environment. If the file or key is missing, configure a
server-side `GEMINI_API_KEY`; do not send it in chat or prefix it with
`NEXT_PUBLIC_`.

## 10a. Reproducible production artifact approach

The current production build does **not** contain the vector artifact because
the file is gitignored and generation was blocked. Do not deploy yet. A
reproducible, non-secret approach is to generate the artifact once in a
controlled, quota-approved offline job, validate its model/version/dimension
metadata and 100 IDs, publish that exact versioned JSON as a build artifact,
and copy it into `data/embeddings/` before `next build` in the deployment
pipeline. The artifact contains no credential. The build should fail or keep
the endpoint explicitly unavailable when that artifact is absent; ChromaDB
remains local-only and is not deployed.

## 11. Remaining tasks for Batch 3

- Add a controlled UI action for optional intent parsing and display its
  status/error state.
- Decide and test how semantic candidates should be combined with, or kept
  separate from, Hybrid Scoring.
- Add a reproducible CI/offline artifact publication workflow if permitted.
- Add live integration tests using a separately managed test credential and
  quota.

## Final checklist

- **PASS** — server-only Gemini integration and secret handling
- **PASS** — schema-validated intent endpoint and explicit fallback behavior
- **PASS** — resumable, non-fabricating embedding generator
- **PASS** — cosine semantic-search API with compatibility checks
- **PASS** — local ChromaDB script and dependency declaration
- **PASS** — existing Hybrid Scoring and Batch 1 dataset preserved
- **PASS** — TypeScript, unit tests, build, dataset, and secret-name checks
- **BLOCKED** — live Gemini access is unavailable for this project without
  enabling billing; 0 embeddings and 0 Chroma vectors were produced
- **FAIL** — the current production build does not contain the vector artifact
