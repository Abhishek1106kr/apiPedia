# APIPEDIA — Master Prompt (Phase 0)

Status: foundational standards doc. Every later phase must comply with this
file or explicitly amend it. This is a living document — update it when a
standard proves wrong in practice, don't silently drift from it.

**Last verified against the actual repository:** 2026-07-23, on the `docs`
branch (which now carries Phases 0–9; see §0 for exact branch state). If
you're reading this later and something here looks wrong, trust the code
and fix this file — that's the whole point of keeping it a living document.

## 0. Where we actually are (read this before anything else)

APIPEDIA is a real, working, two-service system with a genuine (if narrow)
production-readiness gap, not a green-field project and not a prototype
anymore. Concretely:

**Frontend** (`src/`) — TypeScript, Next.js App Router, ~24 components. The
original single 2,200-line `page.js` monolith is gone; it's now `page.tsx`
plus `src/components/` (Header, HomeView, CategoriesView, BenchmarksView,
CompareView, DocsHubView, Footer) and `src/components/api-detail/` (one
component per detail tab: Overview/Playground/Docs/Dna/Pain/Recipes/Paths/
Analytics). State that's genuinely shared lives in `page.tsx`; state that's
local to one view (e.g. all of Compare's filters/sort/pins) lives in that
component, not lifted up speculatively.

**Data**: `page.tsx` fetches the real catalog via TanStack Query
(`src/hooks/useApis.ts` → `src/lib/api-client.ts` → `GET /api/apis` on the
backend below). `src/app/data.ts` is now former-mock-data-turned-fixture —
`CATEGORIES` (a static filter list) still comes from it; the API array
itself is no longer imported anywhere. Every detail-tab component treats
`vitals`/`dna`/`painIndex`/`analytics`/`endpoints`/`recipes`/`paths` as
**possibly empty** and renders an explicit "no data yet" state rather than
assuming mock-data-style full population — a real, freshly-published
catalog entry legitimately starts with most of that empty.

**Backend** (`server/`) — Fastify 5 + TypeScript + Prisma 6 (driver-adapter
mode, see below) + Postgres + Redis/BullMQ. Six real modules under
`src/modules/`:
- `api-catalog` — `GET /api/apis`, `GET /api/apis/:id`
- `contribution-verification` — submit/list/get/approve/reject/rollback,
  with real spam/duplicate/GitHub checks and a **publish pipeline**: an
  approved `NEW_API`/`CORRECTION` contribution with a structured `payload`
  actually writes into `ApiEntry` (see `publish.ts`). A submission without
  a payload (most early ones) still gets moderated, it just can't
  auto-publish.
- `playground` — `POST /api/playground/execute`, a real sandboxed HTTP
  request runner with an SSRF guard (blocks loopback/RFC1918/link-local/
  cloud-metadata ranges against the *resolved* IP).
- `monitoring` — real, scheduled (every 5 min via BullMQ) reachability
  checks against every known API's `baseUrl`; `GET /api/monitoring/:apiId`
  computes uptime%/avg-latency live from that history.
- `ai` — `POST /api/ai/explain-endpoint`, a real Groq call grounded in the
  live OpenAPI spec for the requested endpoint (fetched via the ingestion
  module below). Refuses rather than hallucinates if the endpoint isn't in
  the real spec.
- `search` — `GET /api/search?q=`, real Postgres full-text search
  (`ts_rank` against a hand-written GIN index). This is the lexical half
  of "hybrid search" only — no vector/semantic search exists; it needs an
  embeddings provider decision (Groq doesn't serve embeddings).

Plus `src/ingestion/` (not under `modules/`, since it's cross-cutting): real
GitHub-metadata + OpenAPI-spec fetchers, a hand-seeded registry
(`seeds.ts`, currently 3 entries — Stripe, GitHub, Clerk), a CLI
(`npm run ingest -- <id>`), and a BullMQ queue/worker for async processing.

**Auth**: `src/plugins/auth.ts` — a single shared `ADMIN_API_TOKEN` bearer
token guards contribution approve/reject/rollback and the manual
monitoring trigger. This is explicitly a stopgap, not RBAC — there are no
user accounts to attach real roles to yet. Every other endpoint is
unauthenticated by design (catalog reads, search, the AI explainer, the
playground) since none of them mutate protected state.

**Cross-cutting**: CORS (`@fastify/cors`, origin from `CORS_ORIGIN`),
rate limiting (`@fastify/rate-limit`, global 100/min, 10/min on the AI
route specifically since it calls a paid API), a global Zod-error-to-400
handler.

**What does NOT exist**, stated plainly rather than left to be discovered:
user accounts/sessions/RBAC, bookmarks/collections/ratings/notifications,
an admin/moderator UI (the moderation API has no frontend yet), vector
search, GraphQL/WebSocket/SSE support, a screenshot generator, a real
crawler (ingestion needs URLs hand-added to `seeds.ts`), any observability
beyond stdout JSON logs (no metrics endpoint, no tracing), and backend
tests (zero — every backend "verified" claim in this project's commit
history is a manual curl/browser check run once, not an automated suite).
See the production-readiness audit (if it's still around in your session
history) for the full list with priorities.

**Deployment / branch state**: `production` (the Vercel-deployed branch)
only has Phase 0 + a partial early snapshot. The `docs` branch has
everything through Phase 9, merged with the frontend decomposition,
verified end-to-end. Nothing described above has been merged into
`production` yet — if you're picking this project back up, that's the
first thing to check, not assume.

**Implication for every phase below:** work proceeds by **evolution, not
replacement**. Don't rebuild what's described above from scratch because
it looks small — verify it still works (most of it has an explicit
"Verified:" note in its commit message describing exactly what was tested)
and build on it.

## 1. Product philosophy

APIPEDIA's job is to answer, faster than reading the docs would: *"is this
API good, does it fit my stack, and how do I call it right now?"* Every
feature is judged against that job.

- **A real data path beats a wide one.** The catalog has 4 real entries
  right now, not 1,000 fabricated ones. Scaling the catalog (apis.guru has
  2,500+ real OpenAPI specs, verified reachable — see the audit) is real,
  planned work; it comes after the plumbing between frontend and backend
  is solid, not before.
- **Simulated behavior must be labeled and isolated, or removed once the
  real thing exists.** The playground UI's old `setTimeout`-based fake
  response and the AI action canned strings predate the real
  `POST /api/playground/execute` and `POST /api/ai/explain-endpoint`
  endpoints — wiring the frontend to call those for real (instead of the
  simulated versions still in `page.tsx`'s `handlePlaygroundSend`/
  `handleAiAction`) is the next concrete integration task, not done yet.
- **No feature ships without a real data path in mind.** Before building
  UI for a new metric, know what actually produces that data (ingestion,
  monitoring, the AI module) and what it looks like when that data is
  genuinely absent — don't hardcode a plausible-looking number, and don't
  let a missing value crash the UI (see every detail-tab component's
  "no data yet" guard for the pattern).
- **Reduce friction, don't add ceremony.** Don't add process, abstraction,
  or config that doesn't pay for itself yet. The admin auth guard is
  deliberately one shared token, not a user/role system, because there's
  no user model yet to make roles meaningful.

## 2. Developer experience principles

- Keyboard-first: `/`, `Cmd/Ctrl+K`, `g`, `d`, `p`, `c`, `?` — real,
  extracted into `useKeyboardShortcuts` + `CommandPalette`/
  `KeyboardShortcutsModal` components, verified working in Chrome.
- Every async action needs a loading state, an error state, and an empty
  state before it ships. `page.tsx`'s catalog fetch now has all three
  (`apisLoading`/`apisError`/empty catalog). The playground and AI actions
  still don't, because they're still calling their simulated versions, not
  the real backend endpoints — that's the gap, tracked above.
- Prefer one obvious way to do a thing over configurability. Don't add
  more knobs to Compare's sort/hide-identical/pin controls without a
  concrete user need.

## 3. Design language

Formalized as real Tailwind v4 theme tokens in `src/app/globals.css`
(Phase 8) — not just documented here anymore, actually applied across
every component:

- `bg-background` (#0B0D10), `bg-surface` (#121417), `bg-surface-2`
  (#181B20), `border-border` (#24272C), `text-foreground` (#F4F4F5).
- `text-accent`/`bg-accent`/`border-accent` (#4F8CFF). Semantic
  `text-good`/`text-warn`/`text-bad` (emerald/amber/rose) — kept separate
  from the accent hue, always paired with a text label, never color alone.
- `duration-fast`/`duration-base` motion tokens are defined in the theme
  but not yet applied anywhere specific — Tailwind's default transition
  durations have been visually fine so far; apply them when a transition
  actually needs a non-default duration, not speculatively.
- Typography: `Inter` (sans) / `Geist Mono` (mono), wired via
  `--font-sans`/`--font-mono`.
- Dark-only. Light mode needs its own token pass, not an invert — not
  started.

New components must use these token classes (`bg-surface`, not
`bg-[#121417]`) — the arbitrary-hex-utility pattern was fully migrated away
from in Phase 8; don't reintroduce it.

## 4. Architecture standards

- **Frontend:** Next.js App Router, client components for anything
  stateful (which is currently everything — no Server Components in use
  yet; revisit once there's server-fetchable data that doesn't need
  client interactivity, e.g. a public API detail page).
- **State:** local to the lowest common owner (Compare's state is fully
  contained in `CompareView`, not lifted to `page.tsx`). No global store
  (Zustand) yet — nothing has needed one; don't add it speculatively.
- **Data fetching:** TanStack Query only, through `src/lib/api-client.ts` +
  `src/hooks/`. No ad-hoc `fetch` in components.
- **Backend:** Fastify, one module per bounded concern under
  `server/src/modules/`, each with its own `routes.ts`/`repository.ts`/
  `schemas.ts`. `src/ingestion/` and `src/plugins/` are cross-cutting, not
  domain modules — don't force them into the `modules/` pattern.
- **Contracts:** `src/lib/api-client.ts` is hand-written, typed against
  `src/types/api.ts` — not generated from the backend's OpenAPI/Zod
  schemas yet. If the two drift, the type-check won't catch it; keep them
  in sync by hand until codegen is worth setting up.

## 5. Coding standards

- TypeScript for all new backend and frontend files. `src/app/data.ts`,
  `layout.js` remain the only non-`.tsx` frontend files of consequence;
  `layout.js` stays a server component deliberately (client state lives in
  `providers.tsx`, wrapped around `{children}`, not in the layout itself).
- No default exports for new components — match the existing named-export
  pattern in `src/components/`.
- Every module that mutates state validates its input with Zod
  (`schema.parse()` in the route handler) and lets the global error
  handler in `app.ts` turn a thrown `ZodError` into a 400 — don't
  try/catch Zod errors locally, that's what bit the contribution routes
  early on (see the commit that added the global handler).
- Comments explain *why*, not *what* — e.g. why the admin auth guard is a
  shared token and not RBAC, why a detail tab shows an empty state instead
  of crashing. If you'd write "this fetches the user" as a comment over
  `fetchUser()`, don't.

## 6. Folder conventions

```
src/
  app/                    # routes (page.tsx, layout.js, providers.tsx, globals.css)
  components/             # shared view components (Header, HomeView, CompareView, ...)
    api-detail/           # one component per API detail sub-tab
  hooks/                  # useApis, useKeyboardShortcuts
  lib/                    # api-client.ts (typed fetch wrapper)
  types/                  # api.ts (ApiEntry and friends)

server/
  src/
    app.ts                # Fastify instance, plugin registration, route mounting
    server.ts             # entrypoint
    plugins/               # prisma.ts, auth.ts — cross-cutting
    ingestion/              # cross-cutting: GitHub/OpenAPI fetchers, seeds, queue
    modules/
      api-catalog/
      contribution-verification/
      playground/
      monitoring/
      ai/
      search/
  prisma/
    schema.prisma
    migrations/            # every migration here was applied against a real
                           # Postgres instance during development — see each
                           # migration's originating commit for what was tested

docs/                      # this file, plus product/brand/website copy
                           # (docs/product/, docs/brand/, docs/website/, docs/ui/)
                           # written separately — not audited for accuracy
                           # by the same process as this file
```

Rule while migrating anything further: a file only moves when it's being
meaningfully touched anyway — no drive-by mass moves.

## 7. Testing standards

- Frontend: `node --test` via `npm test` (`__tests__/utils.test.js`) — 5
  tests, all pure-function tests for the compare view's metric logic.
  Node's native TS type-stripping runs this directly against `.ts` source,
  no build step needed.
- **Backend: zero automated tests.** This is the single biggest
  maintainability risk in the codebase today — every verification claim
  in the commit history came from a one-time manual curl session, which
  proves the code worked *then*, not that it still does after the next
  change. If you're adding backend code, strongly consider adding the
  first real test alongside it rather than deferring further.
- CI (`.github/workflows/api-ci.yml`, `web-ci.yml`) runs lint/build, and
  for the API, applies real migrations against a live Postgres service
  container — genuine verification, not a fake step. Neither workflow has
  actually executed on GitHub's infrastructure yet (triggers on push/PR to
  `main`/`production` only); confirm they pass on the first real PR.

## 8. Accessibility requirements

Known gaps, not yet fixed:
- Icon-only controls (`[?]`, `[Copy Code]`) still rely on `title`
  attributes, not `aria-label`.
- Command palette and keyboard-shortcut modal have no focus trap or
  restore-on-close.
- Target remains WCAG 2.1 AA for all new/rebuilt components — apply it to
  new work even though the backlog above hasn't been cleared.

## 9. Performance requirements

- No Lighthouse run, bundle analysis, or load test has been performed
  against this project at any point — don't cite a performance number
  that wasn't actually measured; say "unmeasured" if it wasn't.
- The catalog is small (4 real rows) so pagination/virtualization isn't
  needed yet — revisit once the catalog is meaningfully larger (see the
  apis.guru scaling plan).
- Ingestion and monitoring both check APIs sequentially, on purpose, to
  avoid bursting third-party rate limits at the current scale (3-4
  known APIs). This will not scale to hundreds without batched
  concurrency + backoff — a known, deliberate limitation, not an oversight.

## 10. Security requirements

- No user accounts/JWT/OAuth/RBAC exist. `src/plugins/auth.ts`'s shared
  `ADMIN_API_TOKEN` is a stopgap for the specific endpoints that mutate
  protected state (contribution moderation, manual monitoring trigger) —
  it is not a general auth system and shouldn't be treated as one.
- Secrets: `.env`/`.env.local` for both `server/` and the frontend root,
  gitignored, never committed. The Groq key and admin token both live
  only in `server/.env`.
- `@fastify/rate-limit` protects the AI route specifically (10/min) since
  it calls a paid, externally-rate-limited API; global default is 100/min.
- The playground's SSRF guard (`server/src/modules/playground/
  ssrfGuard.ts`) is the one control in this codebase verified against
  real attack vectors (localhost, loopback IP, cloud metadata endpoint,
  `file://`) — treat it as the reference pattern if another feature ever
  needs to make outbound requests to caller-supplied URLs.
- No security headers (`@fastify/helmet`) configured yet. No CSRF
  protection (not yet needed — no cookie/session auth exists to attack).

## 11. Deployment strategy

- `production` (Vercel) builds the Next.js app from repo root — don't
  reintroduce a monorepo layout (e.g. moving the frontend into
  `apps/web` for a Turborepo setup) without a corresponding `vercel.json`
  change; this was deliberately tried and reverted before (see git log
  for the "restructure project to move next.js frontend directly to root
  directory" commit).
- `server/` has no deployment target yet — it only runs via
  `npm run dev`/`npm start` locally or in CI. Provisioning a real host is
  planned but not started.
- `engines.node: "22.x"` is pinned in both `package.json`s — match this in
  any tooling added later.
- Every phase's changes must keep `production` deployable — land behind
  incremental, reviewable commits, not a big-bang cutover merge.

---

**Immediate next steps, in priority order** (see the production-readiness
audit for the full reasoning): wire the frontend's playground/AI actions
to the real backend endpoints instead of their simulated
`setTimeout`-based versions; add the first backend test; scale the
catalog via apis.guru once the above is solid; build a minimal moderator
UI for the contribution-verification API that's had no frontend since
Phase 4.
