# HOMATCH Batch 4B production-readiness report

## Scope

This batch prepared the verified AI Core for the existing Vercel project
without deploying, pushing, changing billing, or creating a new project.
The 100 synthetic listings, listing IDs, image assets, authentication, and
navigation were preserved.

## Changed files

- `next.config.mjs`
  - Removed `typescript.ignoreBuildErrors`. Production builds now fail on
    TypeScript errors instead of suppressing them.
  - Retains output tracing for the portable E5 artifact.
- `components/results/results-view.tsx`
  - Keeps the existing visual design and adds an accessible live status region.
  - Explains that the first browser search may take longer while the E5 model
    downloads and that it is cached for later searches.
- `docs/batch-4b-report.md`
  - This deployment checklist and evidence report.

## Production architecture readiness

| Component | Status | Evidence / condition |
|---|---|---|
| Groq intent parsing | PASS with provider dependency | `/api/ai/intent` is a Node.js server route. It reads `GROQ_API_KEY` only on the server, uses structured Zod-validated output, timeout handling, and one bounded 429 retry. |
| Browser E5 embeddings | PASS, external asset dependency | `Xenova/multilingual-e5-small` runs in the browser with query-prefixing, mean pooling, normalization, and 384 dimensions. First-load timing was about 26 seconds locally; cached inference was verified. |
| Portable listing artifact | PASS | The artifact contains 100 unique listing IDs and 384-dimensional vectors. The production route loads it read-only from `data/embeddings`. |
| Vercel artifact inclusion | PASS in build trace | `.next/server/app/api/recommendations/route.js.nft.json` references `data/embeddings/listings-multilingual-e5-small-384.json`. |
| Hybrid scoring | PASS | Hard constraints run before ranking; normalized E5 similarity is combined with rule scoring at 60/40. |
| Rule-based fallback | PASS | Groq, model, or recommendation failures are visibly labeled as degraded rule-based results, not AI results. |
| Authentication/navigation | PRESERVED | No authentication, route, or navigation changes were made in this batch. |

## Secret and repository checks

- `.env.local` is ignored by `.gitignore`.
- `.venv/` and `data/chroma/` are ignored.
- The E5 JSON artifact is intentionally not ignored because it is non-secret
  production data required by the recommendation route.
- Only `GROQ_API_KEY` is used for Groq authentication; it is not prefixed with
  `NEXT_PUBLIC_`, included in client code, or returned in API errors.
- `.env.example` contains placeholders only and no credential.
- No credential was printed or included in this report.

## Validation results

| Command / check | Result |
|---|---|
| `npm run test:ai` | PASS — 5/5 |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — TypeScript validation ran during build |
| E5 artifact output-trace reference | PASS |
| `.env.local`, `.venv`, ChromaDB ignore checks | PASS |
| Browser E5 download/inference | PASS locally; production URL not tested in this batch |
| Browser first-load UX message | PASS — embedding status explains model download/cache |

The production build generated 100 listing pages and the dynamic AI routes
`/api/ai/intent` and `/api/recommendations`.

## Required Vercel environment variables

Configure these in the existing Vercel project only; do not overwrite existing
values:

| Variable | Required | Scope |
|---|---|---|
| `GROQ_API_KEY` | Yes for AI intent parsing | Server-only; Production, and Preview if preview AI testing is needed |
| `GROQ_MODEL` | Optional | Server-only; defaults to `openai/gpt-oss-20b` |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing application configuration | Browser-safe public URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Existing application configuration | Browser-safe public client key |

Do not add `NEXT_PUBLIC_GROQ_API_KEY`. The browser must never receive the Groq
credential.

## Exact manual deployment instructions

1. Confirm the working tree and review the Batch 4B diff locally.
2. Commit and push only after explicit approval. Do not include `.env.local`,
   `.venv`, `data/chroma`, or any credential files.
3. In the existing Vercel project for `homatch-6t-main`, open **Settings >
   Environment Variables**.
4. Confirm the existing Supabase variables remain unchanged.
5. Add or update `GROQ_API_KEY` only if the existing server value is absent or
   intentionally being rotated. Select the required deployment environments.
6. Optionally set `GROQ_MODEL=openai/gpt-oss-20b`; omitting it uses the code
   default.
7. Trigger the existing project deployment from the approved Git branch.
   Do not create a new Vercel project.
8. After deployment, open
   `https://homatch-6t-main.vercel.app/find-home`.
9. Run a Vietnamese search such as:
   `Tôi là sinh viên cần phòng yên tĩnh gần trường, dưới 5 triệu và cho phép nuôi mèo.`
10. In browser DevTools, verify one `POST /api/ai/intent`, one model download
    on first use, and one `POST /api/recommendations`.
11. Confirm results show real `HCM_001`–`HCM_100` listings, explanations, and
    no secret in page source, requests, or responses.
12. Repeat the search to confirm cached E5 behavior. Temporarily remove or
    invalidate the Groq variable only in a safe preview environment if fallback
    testing is required; do not alter production variables casually.

## Remaining risks and blockers

- The production URL has not been deployed or tested in this batch, by
  instruction. Vercel runtime and target-device performance remain a manual
  post-deployment check.
- First-use browser E5 download was about 26 seconds in the prior environment.
  Slow networks or mobile devices may take longer.
- Hugging Face model and ONNX runtime assets are external browser downloads;
  availability, cache behavior, and CORS should be checked after deployment.
- Groq free-tier/provider limits can still cause 429 or provider failures.
  The application must retain its labeled rule-based fallback when that
  occurs.
- The non-secret vector artifact must remain in the repository and be included
  in the deployment build. Do not move it to an ignored local-only directory.

## Final checklist

- **PASS** — server-only Groq integration and secret handling reviewed
- **PASS** — browser E5 architecture and first-load UX prepared
- **PASS** — 100-listing artifact traced into the production route
- **PASS** — hybrid scoring and labeled fallback preserved
- **PASS** — tests, type-check, and production build
- **PASS** — local secret/ChromaDB/virtual-environment exclusion
- **BLOCKED** — production URL verification until an approved deployment
- **BLOCKED** — final target-device performance measurement until deployment
