# Stable API error contract — proposal

All failures use `{ "data": null, "error": { "code": "...", "message": "safe text", "requestId": "opaque", "retryable": false } }`. Never include tokens, source, prompts, private resource names, answer keys, or stack traces. A foreign-owned ID is `RESOURCE_NOT_FOUND` regardless of its existence. Retryable `429` and `503` responses carry `Retry-After` where known. Validation details may name safe field paths only.

| Code | HTTP | Safe meaning | Retry |
|---|---:|---|---|
| `AUTH_REQUIRED` | 401 | Sign in for this persistent or private operation. | After sign-in |
| `AUTHORIZATION_FAILED` | 403 | This operation is not allowed for this caller. | After access change |
| `CONSENT_REQUIRED` | 403 | Code-sharing consent is needed for this AI operation. | After consent |
| `RESOURCE_NOT_FOUND` | 404 | The requested resource is unavailable. | No |
| `REPOSITORY_NOT_FOUND` | 404 | GitHub could not find this public repository. | No |
| `REPOSITORY_INACCESSIBLE` | 403 | GitHub access or authorization is unavailable. | After authorization |
| `GITHUB_RATE_LIMITED` | 429 | GitHub temporarily limited requests. | Yes, after retry time |
| `GITHUB_UNAVAILABLE` | 503 | GitHub could not be reached. | Yes |
| `UNSUPPORTED_LANGUAGE` | 422 | This file has no supported analyzer. | No |
| `FILE_TOO_LARGE` | 413 | A source file exceeds the configured analysis limit. | No; narrower selection |
| `ANALYSIS_FAILED` | 500 | This analysis could not complete. | Conditional new run |
| `ANALYSIS_CANCELLED` | 409 | This run was cancelled. | New run |
| `AI_UNAVAILABLE` | 503 | The explanation service is temporarily unavailable. | Yes |
| `AI_OUTPUT_INVALID` | 502 | A generated result failed validation. | Conditional retry |
| `AI_RATE_LIMITED` | 429 | This AI operation is temporarily limited. | Yes, after retry time |
| `AI_BUDGET_EXHAUSTED` | 429 | This managed-AI usage allowance is exhausted. | After budget reset |
| `ASSESSMENT_UNAVAILABLE` | 409 | No valid assessment is available for this analysis. | Conditional regeneration |
| `INVALID_ATTEMPT` | 422 | The answer or attempt cannot be accepted. | After correction |
| `INVALID_REQUEST` | 400 | Request fields or URL are invalid. | After correction |
| `IDEMPOTENCY_CONFLICT` | 409 | This key was already used with different input. | With a new key |
| `RATE_LIMITED` | 429 | This caller has reached the application limit. | Yes, after retry time |

The service may map a broad internal failure to one of these public codes. Do not leak whether a private GitHub repository exists: without a valid authorization, use `REPOSITORY_INACCESSIBLE` with generic text. `ANALYSIS_FAILED` is a terminal run status and not a blanket HTTP response for a successful status lookup.
