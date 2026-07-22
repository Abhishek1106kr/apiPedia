# APIPEDIA Backend — API Reference

Every endpoint below is verified against the actual route/schema files in
`server/src/modules/` as of 2026-07-23 — not written from memory. If this
drifts from the code, trust the code and fix this file.

Base URL: `http://localhost:4000` in local dev (`server/.env`'s `PORT`).
All request/response bodies are JSON unless noted. All mutating endpoints
validate their input with Zod; a validation failure returns:

```json
{ "statusCode": 400, "error": "Bad Request", "message": "field: reason" }
```

## Authentication

Most endpoints are unauthenticated by design (see
`docs/00-master-prompt.md` §0/§10 for why). Endpoints marked **🔒 Admin**
below require:

```
Authorization: Bearer <ADMIN_API_TOKEN>
```

`ADMIN_API_TOKEN` is set in `server/.env` — see `server/.env.example` for
how to generate one. Missing/wrong token returns `401`. If the server has
no token configured at all, these endpoints return `503` (fails closed,
never "allow everyone through").

## Rate limits

Global default: 100 requests/minute per IP. `POST /api/ai/explain-endpoint`
is tighter: 10/minute, since it calls a paid third-party API. Exceeding a
limit returns `429`.

---

## `api-catalog`

### `GET /api/apis`
List every API in the catalog.

```
curl http://localhost:4000/api/apis
```
Returns `ApiEntry[]` (see `src/types/api.ts` on the frontend for the full
shape). Freshly-published entries can have empty `vitals`/`dna`/
`painIndex`/`analytics` objects and empty `endpoints`/`recipes`/`paths`
arrays — that's expected, not a bug.

### `GET /api/apis/:id`
Get one API by id. `404` if it doesn't exist.

```
curl http://localhost:4000/api/apis/stripe
```

---

## `contribution-verification`

Submissions always land `PENDING`. Nothing auto-approves or auto-rejects —
a human calls the moderation endpoints below. Every state transition is
recorded in an audit log, viewable via `GET /api/contributions/:id`.

### `POST /api/contributions`
Submit a contribution. Runs spam detection, duplicate detection, and (if
`sourceUrl` is a GitHub link) verification against the real GitHub API,
synchronously, before responding.

```json
{
  "type": "NEW_API",              // "NEW_API" | "CORRECTION" | "RECIPE"
  "submitterHandle": "someone",
  "title": "Add Twilio",
  "body": "Free-text description a human moderator reads.",
  "sourceUrl": "https://github.com/twilio/twilio-node",   // optional
  "payload": {                     // optional — see "Publishing" below
    "id": "twilio",
    "name": "Twilio",
    "category": "Communication",
    "tagline": "Programmable SMS, voice, and video",
    "description": "...",
    "docsUrl": "https://www.twilio.com/docs",
    "githubUrl": "https://github.com/twilio/twilio-node",
    "baseUrl": "https://api.twilio.com"
  }
}
```

Response includes the computed `spamScore`, `spamFlags`, `isDuplicate`,
`githubVerified`, and `trustScore` (0-100, informational — never used to
auto-decide anything).

**Publishing:** `payload` is optional. Omit it for a plain text
submission (still gets moderated, just can't auto-publish). Include it
and the shape is validated immediately (fail-fast, not at approval time):
- `type: "NEW_API"` → full shape above required (`id`/`name`/`category`/
  `tagline`/`description`/`docsUrl`/`githubUrl`/`baseUrl`; `logoColor`/
  `openapiUrl`/`postmanUrl`/`sandboxAvailable` optional with defaults).
- `type: "CORRECTION"` → any subset of the same fields, requires
  `targetApiId` to be set (which entry to patch).
- `type: "RECIPE"` → payload is rejected (400) — nowhere structured to go.

### `GET /api/contributions?status=PENDING`
List contributions. `status` query param is optional
(`PENDING`/`APPROVED`/`REJECTED`); omit it to list all.

### `GET /api/contributions/:id`
Get one contribution, including its full audit log
(`submitted`/`approved`/`published`/`publish_skipped`/`rejected`/
`rolled_back`, each with actor + optional reason + timestamp). `404` if
it doesn't exist.

### `POST /api/contributions/:id/approve` 🔒 Admin
```json
{ "actor": "moderator_handle", "reason": "optional note" }
```
Sets status to `APPROVED`, then attempts to publish (see above). Response
includes a `publishResult`:
```json
{ "published": true, "apiId": "twilio" }
```
or
```json
{ "published": false, "reason": "No structured payload was submitted with this contribution." }
```
A `false` result is not an error — it's a normal outcome for text-only
contributions.

### `POST /api/contributions/:id/reject` 🔒 Admin
Same body shape as approve. Sets status to `REJECTED`. Never publishes.

### `POST /api/contributions/:id/rollback` 🔒 Admin
Same body shape. Reverts an `APPROVED`/`REJECTED` contribution back to
`PENDING`. Returns `400` if it's already `PENDING` (nothing to roll back).
Does **not** un-publish an already-published `ApiEntry` — the catalog
write from a prior approval is not reversed.

---

## `playground`

### `POST /api/playground/execute`
Runs one real HTTP request server-side and returns the actual response.

```json
{
  "method": "GET",
  "url": "https://api.github.com/repos/stripe/stripe-node",
  "headers": { "Accept": "application/json" },   // optional
  "body": "...",                                   // optional, ignored for GET
  "timeoutMs": 10000                               // optional, 1000-30000, default 10000
}
```

Response:
```json
{
  "status": 200,
  "statusText": "",
  "headers": { "content-type": "application/json", "...": "..." },
  "body": "...",
  "latencyMs": 158,
  "truncated": false
}
```

**SSRF guard:** requests to `localhost`, loopback (`127.0.0.1`), private
(RFC1918: `10.x`, `172.16-31.x`, `192.168.x`), link-local/cloud-metadata
(`169.254.x`, including the AWS/GCP metadata endpoint), and non-http(s)
protocols (`file://`, etc.) are rejected with `400` — checked against the
*resolved* IP, not just the hostname string, so a public-looking domain
that DNS-rebinds to a private address is still caught. Redirects are not
auto-followed, for the same reason.

Body is read fully into memory before the ~200KB (`MAX_BODY_CHARS`) text
truncation applies — no true streaming byte cap yet (documented limitation
in `executor.ts`).

---

## `monitoring`

Real reachability checks against every API in `src/ingestion/seeds.ts`
(currently: `stripe`, `github`, `clerk`), on a recurring 5-minute BullMQ
schedule (`npm run monitor:worker`). "Up" means any HTTP response came
back — a `401`/`404` still proves the endpoint is reachable; only a
network/DNS failure counts as down.

### `GET /api/monitoring`
Dynamic stats (computed live from stored check history, not cached) for
every known API at once:
```json
[{
  "apiId": "stripe",
  "currentlyUp": true,
  "uptimePercent": 100,
  "avgLatencyMs": 86,
  "totalChecks": 5,
  "lastCheckedAt": "2026-07-22T05:52:43.467Z",
  "windowHours": 24
}]
```
`currentlyUp`/`uptimePercent`/etc. are `null` if no checks have been
recorded yet for that API — not `0`, which would falsely imply "down."

### `GET /api/monitoring/:apiId`
Same stats shape, for one API. `404` if `apiId` isn't in `seeds.ts`.

### `GET /api/monitoring/:apiId/history?limit=50`
Raw check history, newest first. `limit` is 1-200, default 50.

### `POST /api/monitoring/run-now` 🔒 Admin
Runs one real check round against every known API immediately and
returns the results — for manual refresh without waiting for the
scheduler's next tick.

---

## `ai`

### `POST /api/ai/explain-endpoint`
```json
{ "apiId": "stripe", "path": "/v1/payment_intents", "method": "POST" }
```
Fetches the real, live OpenAPI spec for `apiId` (must be in
`seeds.ts` with an `openapiUrl`), finds the matching operation, and asks
Groq to explain it — grounded only in what the spec actually says.

```json
{
  "apiId": "stripe",
  "path": "/v1/payment_intents",
  "method": "POST",
  "explanation": "The POST /v1/payment_intents endpoint creates a PaymentIntent object...",
  "groundedOn": {
    "specUrl": "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
    "operationSummary": "Create a PaymentIntent"
  }
}
```

Returns `400` (not a fabricated explanation) if `apiId` is unknown, has no
`openapiUrl`, or the `path`+`method` combination isn't in the real spec.
Rate-limited to 10/minute (see above) — this calls Groq per request, with
no response caching yet.

---

## `search`

### `GET /api/search?q=payments&limit=20`
Real Postgres full-text search (`ts_rank` against name/tagline/
description/category). `limit` is 1-50, default 20.

```json
[{ "id": "stripe", "name": "Stripe", "category": "Payments", "tagline": "...", "logoColor": "#635BFF", "rank": 0.0608 }]
```

This is lexical search only — no vector/semantic ranking exists yet (see
`docs/00-master-prompt.md` §0 for why).

---

## `GET /health`

No prefix, no auth, no rate limit beyond the global default. Returns
`{ "status": "ok" }`. Does not check the database or Redis connection —
it only confirms the Fastify process itself is up.
