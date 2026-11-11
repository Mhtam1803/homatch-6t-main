# HOMATCH Batch 4A browser verification report

## Scope

This batch verified the AI Core in a real browser runtime before deployment:
Find a Home, Groq intent parsing, browser E5 inference, hybrid ranking, and
results rendering. No deployment, billing change, push, or secret exposure was
performed.

## Browser test

Local app:

```powershell
npm run dev -- --hostname 127.0.0.1
```

The flow was exercised at `http://localhost:3000/find-home` in the browser,
using the existing form and unchanged visual design. The successful input was:

> Tôi là sinh viên cần phòng yên tĩnh gần trường đại học, dưới 5 triệu mỗi
> tháng và cho phép nuôi mèo.

Observed flow:

1. Find My Home form accepted the Vietnamese request.
2. Matching loader displayed parsing, embedding, ranking, and results states.
3. `/api/ai/intent` returned Groq structured JSON.
4. `Xenova/multilingual-e5-small` loaded in the browser, not Node.
5. `/api/recommendations` returned hybrid results.
6. Results displayed AI ranking and explanations such as
   `pet-friendly`, `quiet environment`, and `within budget`.

Observed top results included real dataset IDs such as `HCM_001`, `HCM_002`,
`HCM_029`, and `HCM_041`. No IDs outside the 100-listing dataset appeared.

## Browser E5 evidence

The browser requested the actual model and runtime assets:

- `https://huggingface.co/Xenova/multilingual-e5-small/resolve/main/config.json`
- `tokenizer_config.json`
- `tokenizer.json`
- `onnx/model_quantized.onnx`
- `onnxruntime-web` SIMD threaded WASM and MJS assets

Measured from browser Resource Timing:

- First model asset load: approximately **26 seconds** total, dominated by
  `model_quantized.onnx` at approximately **24.3 seconds**.
- Browser inference interval after the first successful intent response and
  before `/api/recommendations`: approximately **2.55 seconds**.
- Subsequent cached run: no model or WASM download requests were made;
  `/api/recommendations` completed in approximately **36 ms**. The cached
  inference path completed in the browser and returned AI ranking.

No model download failure, CORS error, ONNX error, or WebAssembly error was
observed. The only browser diagnostics were a Next.js smooth-scroll warning
and an aborted RSC transition request during navigation.

## Network and secret checks

Successful flow network sequence:

1. One `POST /api/ai/intent`
2. Browser model assets, only on the first load
3. One `POST /api/recommendations`

The corrected results effect prevents React development Strict Mode from
issuing duplicate Groq requests. No `Authorization` header or API key appeared
in page text, browser resource URLs, or client code. `GROQ_API_KEY` is read
only by the server route.

## Groq 429 investigation and fix

The earlier burst test produced Groq HTTP 429 responses. A later 12-case run
with 12-second spacing produced 9 successful typed responses and 3 blocked
API responses. The UI correctly entered the visibly labeled rule-based
fallback state when Groq was unavailable.

The Groq client now:

- observes numeric `Retry-After` when supplied;
- waits at least 1 second and at most 10 seconds;
- performs at most one retry for a 429;
- never loops indefinitely or bypasses rate limits;
- returns a controlled rate-limit/degraded error after the bounded retry.

The results page also has a stable criteria guard so one normal search makes
one Groq request even under React Strict Mode.

## 12 representative Vietnamese cases

These were run through the local Groq intent endpoint with 12-second spacing.
The three blocked requests were provider API failures/rate limits, not
fabricated fallback intent results.

| # | Input category | Expected behavior | Observed |
|---:|---|---|---|
| 1 | Student, quiet, budget | budget and quiet retained | PASS, 200 |
| 2 | Premium student, balcony, air conditioning | preferences represented or null if unstated | PASS, 200 |
| 3 | Office worker, near workplace, elevator | workplace/elevator intent | BLOCKED, provider API error |
| 4 | Remote worker, quiet | quiet/work-from-home preferences | PASS, 200 |
| 5 | Couple, 2 bedrooms, balcony | minimum bedrooms and balcony | PASS, 200 |
| 6 | Young family, safe, near school | household/school requirements | PASS, 200 |
| 7 | Family with children, playground/supermarket | family amenities | PASS, 200 |
| 8 | Cat owner, pet-friendly, parking | pet and parking requirements | BLOCKED, provider API error |
| 9 | Student studio near UEL | studio/location intent | PASS, 200 |
| 10 | Premium furnished, 24-hour security | premium/furnishing/security intent | PASS, 200 |
| 11 | Strict budget below 1 million | explicit low budget; possible no-match | BLOCKED, provider API error |
| 12 | Working in Thu Duc, quiet | workplace/location/quiet intent | PASS, 200 |

The successful browser run verified actual semantic matching, hard budget and
pet filtering, and listing-field explanations. A strict no-match result was
covered by the hybrid unit tests and controlled API artifact behavior; live
provider rate limiting blocked a fresh Groq parse for case 11.

## Hybrid score verification

The implementation normalizes cosine similarity from `[-1, 1]` to `[0, 1]`:

```text
semanticScore = clamp((cosine + 1) / 2, 0, 1)
finalScore = round((semanticScore * 0.60 + ruleScore * 0.40) * 100)
```

A unit test with semantic score `1` and rule score `0` asserts a final score
of exactly `60`, confirming the 60/40 weighting.

## Validation commands

| Command | Result |
|---|---|
| `npm run test:ai` | PASS — 5 tests |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| Browser Find Home → Results flow | PASS |
| Browser E5 model inference | PASS |
| Browser cached E5 load | PASS |
| Secret leakage check | PASS |
| 12 spaced Groq cases | PARTIAL — 9 PASS, 3 provider-blocked |

## Remaining blockers

- Groq free-tier/provider availability still produces intermittent 429/API
  failures. The bounded retry and visible fallback are in place, but a
  production quota check is still required.
- First browser E5 load is approximately 26 seconds on this environment.
  Cached loads are much faster, but target-device performance should be
  measured before deployment.
- Vercel deployment has not been performed, as requested.

## Final checklist

- **PASS** — real browser E5 model load and inference
- **PASS** — cached browser E5 path
- **PASS** — Groq → E5 → hybrid → results flow
- **PASS** — one Groq request per normal search after Strict Mode fix
- **PASS** — bounded 429 retry
- **PASS** — 60/40 score normalization and unit verification
- **PASS** — no browser secret leakage observed
- **PARTIAL** — 12-case provider run, 9 successful and 3 rate/provider blocked
- **BLOCKED** — final Vercel performance verification until deployment
