# APIPEDIA — Master Prompt (Phase 0)

Status: foundational standards doc. Every later phase must comply with this
file or explicitly amend it. This is a living document — update it when a
standard proves wrong in practice, don't silently drift from it.

## 0. Where we actually are (read this before anything else)

APIPEDIA is not a green-field project. As of this writing the repo contains:

- `src/app/page.js` — a single ~2,200-line client component (`"use client"`)
  that renders the entire product: search, category browser, API detail
  pages, an 8-tab detail view (overview/playground/docs/dna/pain/recipes/
  paths/analytics), a comparison matrix, a command palette, and a keyboard
  shortcut system. All in one file, all in plain JS.
- `src/app/data.js` — a hardcoded array of ~8 API entries (Stripe, OpenAI,
  GitHub, Clerk, Twilio, Razorpay, PayPal, Anthropic, ...) that is the only
  "database" the app has. There is no fetch layer.
- `src/app/utils.js` — pure helper functions for the comparison matrix
  (metric grouping, classification, sorting). This is the one file that's
  already well-factored.
- `backend/` — a Django project and a FastAPI app living side by side.
  Neither is wired to the frontend. Django has no apps beyond the default
  admin/auth scaffolding and uses SQLite. FastAPI exposes `/` and `/health`
  only. Treat both as placeholders, not as the backend described in the
  roadmap's Phase 2.
- Deployment: a `production` branch is live on Vercel, frontend-only,
  serving the mock-data prototype.

**Implication for every phase below:** the roadmap's target stack (TS,
Zustand, TanStack Query, shadcn/ui on the frontend; Fastify, Prisma,
Postgres, Redis, BullMQ on the backend) is a destination, not the current
state. Work proceeds by **evolution, not replacement** — the production app
stays deployable at every step. Concretely:

- Frontend migration path: extract components out of `page.js` first
  (behavior-preserving), then convert file-by-file to TypeScript, then
  introduce Zustand/TanStack Query as real data replaces mock data, then
  adopt shadcn/ui primitives for new/rebuilt UI rather than a big-bang
  redesign.
- Backend migration path: the Django/FastAPI scaffolding is not worth
  incrementally upgrading — it has no domain logic to preserve. Phase 2
  will introduce the Fastify/Prisma/Postgres stack as a new service and
  retire the Python scaffolding once the frontend has something real to
  call. Until that cutover, do not add new features to Django or FastAPI.

## 1. Product philosophy

APIPEDIA's job is to answer, faster than reading the docs would: *"is this
API good, does it fit my stack, and how do I call it right now?"* Every
feature is judged against that job.

- **Mock data is a spec, not a feature.** `data.js`'s shape (vitals, dna,
  painIndex, recipes, paths, analytics) is effectively the first draft of
  the API entity schema. Treat it as a design artifact to formalize in
  Phase 2's database schema, not as sample content to keep hand-editing.
- **Simulated behavior must be labeled and isolated.** The playground's
  `setTimeout`-based fake response and the AI action `setTimeout` canned
  strings are acceptable as UI scaffolding *only* while explicitly
  marked as simulated in code (comment or `MOCK_` prefix) and isolated
  behind a swappable function boundary, so Phase 5/6 can replace them
  without touching rendering code.
- **No feature ships without a real data path in mind.** Before building
  UI for a new metric, know which phase produces that data for real
  (ingestion engine, verification engine, playground runtime, AI engine).
  If no phase produces it, don't hardcode a plausible-looking number.
- **Reduce friction, don't add ceremony.** Every roadmap phase says
  "reduce developer friction" — apply that to our own dev loop too. Don't
  add process, abstraction, or config that doesn't pay for itself yet.

## 2. Developer experience principles

- Keyboard-first: the existing `/`, `Cmd/Ctrl+K`, `g`, `d`, `p`, `c`, `?`
  shortcuts in `page.js` are a real DX asset — preserve and extend this
  pattern (a single documented shortcut table, discoverable via `?`) as
  the app grows rather than inventing a new pattern per feature.
- Every async action needs a loading state, an error state, and an empty
  state before it ships — not just the happy path. The current playground
  send only implements loading + success; this is a gap to close as soon
  as it talks to a real backend (Phase 5).
- Copy-to-clipboard, code generation, and export actions (CSV/Markdown/PDF
  share link in the compare view) should give visible confirmation without
  blocking (`alert()` is a placeholder, not the standard — replace with a
  toast when the design system's feedback primitive exists).
- Prefer one obvious way to do a thing over configurability. The compare
  view's sort/hide-identical/pin controls are the right amount of
  configurability for that surface; don't add more knobs without a
  concrete user need.

## 3. Design language

Current visual system, extracted from `page.js`/`layout.js` (treat this as
v0 of the token set Phase 8 will formalize):

- Background `#0B0D10`, surface `#121417`, surface-alt `#181B20`, border
  `#24272C`, text primary `#F4F4F5`/zinc-100, text muted zinc-400/500.
- Accent `#4F8CFF` (links, active tab underline, focus rings, primary
  highlights). Semantic colors: emerald-500 (good/healthy), amber-500
  (warning/medium), rose-500 (bad/error) — used consistently for
  health/difficulty/risk indicators today; keep that mapping fixed.
- Typography: `Inter` for UI text, `Geist Mono` for anything code-like,
  identifiers, metrics, or terminal-flavored chrome (already wired via
  `--font-sans`/`--font-mono` in `layout.js`).
- Density: compact, information-dense cards (`text-[10px]`–`text-sm`),
  mono uppercase micro-labels for field names. This is a deliberate
  "developer terminal" register — don't soften it into generic SaaS
  marketing style.
- Dark-only for now (`className="... dark"` hardcoded in `layout.js`).
  Light mode is out of scope until Phase 8 defines the token system
  needed to support both without a rewrite.

Phase 8 will turn this into a real token file (colors, spacing, elevation,
motion) and a component library; until then, new UI should match these
values by convention, not invent new ones.

## 4. Architecture standards

- **Frontend today:** Next.js App Router, single client component tree.
  Target: server components for anything that doesn't need interactivity
  (static API metadata, docs pages) once data is real, client components
  only for stateful surfaces (playground, compare, command palette).
- **State:** currently all `useState` in one component. As components are
  extracted, state should move to the lowest common owner; only promote
  to a global store (Zustand, per roadmap) when genuinely cross-cutting
  (e.g. command palette open/close, active API selection driving the URL).
- **Data fetching:** none exists yet beyond the mock array. When Phase 2's
  backend exists, all data access goes through TanStack Query hooks, never
  ad-hoc `fetch` in components.
- **Backend today:** two disconnected Python scaffolds. Target: a single
  Fastify service per Phase 2, domain-driven module boundaries
  (api-catalog, auth, playground, ingestion, moderation, ai, search), each
  owning its own Prisma models/migrations.
- **Contracts:** once a real backend exists, the frontend must consume it
  through a typed client (generated from OpenAPI or tRPC-style inference),
  never hand-written `fetch` + `any`.

## 5. Coding standards

- Language target: TypeScript for all new/touched frontend files. `.js`
  files under `src/` are legacy until converted; don't add new logic to
  them — add new code as `.ts`/`.tsx` and import it in.
- No default exports for components once TS lands (named exports only) —
  not yet enforced in the current `.js` codebase, but apply to every new
  file from Phase 1 onward.
- No unused state or dead branches — the current `page.js` has some
  vestigial state (e.g. `collapsedGroups` declared but check usage before
  copying patterns forward).
- Comments only where the *why* isn't obvious from code (existing example
  worth keeping: the note in `page.js` about event-based `selectApi`
  avoiding cascading render lint errors — that's the right kind of comment).
- No `alert()`/`window.print()` as permanent UX in new code — those are
  acceptable stopgaps already in the codebase, not a pattern to extend.

## 6. Folder conventions

Current:
```
src/app/            # Next.js App Router root — currently one giant page.js
src/app/playground/  # non-route helper module (requestBuilder.js, currently empty)
backend/config/      # Django project
backend/fastapi_app/ # FastAPI scaffold
__tests__/           # frontend unit tests (moved out of src/app to avoid
                      # bundling the node test runner into the Vercel build)
```
Target (introduced incrementally as `page.js` is decomposed, not rewritten
in one shot):
```
src/
  app/                # routes only (page.tsx per route, layout.tsx)
  components/         # shared UI primitives (design system, Phase 8)
  features/           # feature-scoped components + hooks
    search/
    api-detail/
    playground/
    compare/
    command-palette/
  lib/                 # data access, utils, types
  types/
```
Rule while migrating: a file only moves when it's being meaningfully
touched anyway (extracted, converted, or fixed) — no drive-by mass moves.

## 7. Testing standards

- Existing precedent: `__tests__/utils.test.js` runs via Node's built-in
  test runner (`node --test` style, invoked as `node __tests__/utils.test.js`
  per `package.json`'s `test` script) — no external test framework yet.
  Keep using this for pure-function tests (`utils.js`-style logic) until a
  real framework (Vitest, per typical Next.js/TS setups) is introduced
  alongside the TS migration.
- Every extracted pure function (metric classification, sorting, filtering,
  formatting) gets a unit test at extraction time — don't extract now, test
  later.
- Component tests are deferred until components are real (post-extraction,
  post-TS) — don't write brittle tests against the current monolith.
- Backend: `backend/tests/test_main.py` (pytest) covers the FastAPI
  scaffold; this suite is disposable once Phase 2 replaces the backend —
  don't invest further in it.

## 8. Accessibility requirements

Gaps to fix as each surface is touched (not a blocking rewrite today):
- Keyboard shortcuts that check `document.activeElement.tagName` should
  also respect `contentEditable` elements and ARIA roles, not just
  `INPUT`/`TEXTAREA`.
- Icon-only / symbol-only controls (`[?]`, `[Copy Code]`) need `aria-label`
  or visible accessible text — currently rely on title attributes only.
- Color-coded status (emerald/amber/rose) must not be the only signal —
  pair with text labels, which the current UI mostly already does
  (`Difficulty: Easy/Medium/Hard` as text) — keep that pattern.
- Focus management: command palette and keyboard-shortcut modal need
  focus trap + restore-on-close once they're extracted into real
  components (Phase 1).
- Target: WCAG 2.1 AA for all new/rebuilt components.

## 9. Performance requirements

- `page.js` currently re-renders the whole tree on most state changes
  (single component, no memo boundaries beyond a couple of
  `useCallback`s). Decomposition in Phase 1 should introduce natural
  memoization boundaries as a side effect — don't add manual `memo()`
  scaffolding to the monolith itself.
- Mock data is small (~8 entries) so current perf is a non-issue; treat
  any perf work before Phase 2's real data volume as premature.
- Once real data exists: paginate/virtualize the API list, don't ship
  the "load everything into one array" pattern past prototype scale.

## 10. Security requirements

- `backend/config/settings.py` has `DEBUG = True` and a hardcoded
  `SECRET_KEY` committed to the repo — both are fine for the disposable
  Django scaffold but must never be copied into the real Phase 2 backend.
  Flag if this settings file is ever pointed at a real deployment.
- No secrets belong in `data.js` or any frontend file — current mock API
  keys in code examples (`sk_test_51Nz...`) are clearly fake placeholders;
  keep new examples obviously fake the same way.
- `.env*` is already gitignored — keep it that way; real backend config
  (Phase 2) reads from environment, never hardcodes credentials.
- Once real auth exists (Phase 2 Better Auth/JWT), the "Login" button
  currently rendered as a no-op in the header becomes a real entry point —
  don't wire it to anything until that backend exists.

## 11. Deployment strategy

- Current: Vercel builds the Next.js app directly from repo root
  (`production` branch), per the git history's move to "restructure
  project to move next.js frontend directly to root directory to fix
  vercel out-of-the-box build." Don't reintroduce a monorepo root build
  step that breaks Vercel's zero-config detection without also updating
  `vercel.json` deliberately.
- `engines.node: "22.x"` is pinned in `package.json` — match this in any
  CI config introduced later.
- Backend has no deployment target yet — out of scope until Phase 2
  produces a real service to deploy (containerized, per the roadmap's
  Docker/Kubernetes-readiness goal).
- Every phase's changes must keep `production` deployable — no phase
  should require a "big bang" cutover merge. Land behind incremental,
  reviewable commits.

---

Next: **Phase 1 — Frontend.** First concrete steps, in order: (1) extract
`page.js` into route + feature components without changing behavior,
(2) convert extracted files to TypeScript as they're created, (3) replace
`alert()`/inline mock-response logic with clearly-marked mock service
functions at the `lib/` boundary so Phase 5 can swap them for real calls.
