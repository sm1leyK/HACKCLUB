# Static SPA Structure Refactor Design

Date: 2026-04-30

## Goal

Refactor the HACKCLUB static SPA structure without changing the rendered product experience.

The project should remain a static frontend published from `front/`, backed by the existing Supabase schema, views, RPCs, storage bucket, and Edge Functions. The refactor should make the frontend easier to understand and modify by splitting the current oversized `front/app.mjs` and inline-heavy `front/index.html` into clear modules.

## Non-Goals

- Do not migrate to React, Vue, Vite, Next.js, or any other framework.
- Do not add a build step.
- Do not redesign the UI.
- Do not intentionally change page layout, copy, animation timing, routes, auth behavior, Supabase contracts, or Netlify publishing.
- Do not clean up unrelated in-progress user changes.
- Do not make broad backend rewrites as part of the frontend structure pass.

## Current Context

The repository is currently shaped as a static SPA:

- `front/index.html` contains the page shell, many page sections, large inline style/script blocks, and the module entry script.
- `front/app.mjs` contains app bootstrap, state, DOM refs, Supabase reads/writes, routing, page rendering, interactions, formatting helpers, local storage helpers, wallet logic, market betting, support board logic, cookie consent, search, and Agent dashboard behavior.
- Several frontend modules already exist, including support board, post market, odds rewards, Lens agent, space page, cookie consent, and routing tests. These should guide the extraction style.
- `supabase/` contains the database schema, seed data, migrations, Node tests, and Edge Functions.
- `supabase/functions/agent-auto-comment/index.ts` is also large, but backend decomposition is secondary to the frontend SPA refactor.

## Recommended Architecture

Keep `front/index.html` as the static publish entry and keep `front/app.mjs` temporarily as a compatibility bridge while modules are extracted.

Target structure:

```text
front/
  index.html
  styles/
    base.css
    layout.css
    pages/
      home.css
      detail.css
      create.css
      leaderboard.css
      activity.css
      profile.css
      auth.css
      agents.css
      space.css
  src/
    main.mjs
    state.mjs
    dom.mjs
    router.mjs
    config.mjs
    services/
      supabase-client.mjs
      posts-api.mjs
      comments-api.mjs
      leaderboard-api.mjs
      wallet-api.mjs
      agents-api.mjs
      storage-api.mjs
    pages/
      home.mjs
      detail.mjs
      create-post.mjs
      leaderboard.mjs
      activity.mjs
      profile.mjs
      auth.mjs
      agents.mjs
      space.mjs
    components/
      post-card.mjs
      comment-list.mjs
      support-board.mjs
      post-market.mjs
      search-box.mjs
      cookie-consent.mjs
      wallet-panel.mjs
    features/
      post-actions.mjs
      market-bets.mjs
      support-board-data.mjs
      lens-agent.mjs
      leaderboard-live.mjs
      cookie-sync.mjs
    utils/
      avatar.mjs
      format.mjs
      html.mjs
      storage.mjs
      time.mjs
  assets/
    ...
```

The final layout does not need to create every file at once. Files should be introduced only when code is actually moved into them.

Existing `front/*.test.mjs` tests should remain in place during the first pass so the current `node --test front/*.test.mjs` workflow keeps working. A later test-directory move can be handled separately if it becomes useful.

## Module Boundaries

### Entry And State

`src/main.mjs` owns initialization order: config validation, DOM ref setup, route setup, session refresh, data bootstrap, static interactions, and page-specific initialization.

`src/state.mjs` owns shared mutable app state. It should make the existing state object explicit and importable, not introduce a new state management abstraction.

`src/dom.mjs` owns stable DOM lookups and small DOM helper functions. It should preserve existing element IDs and class names.

`src/router.mjs` owns hash route parsing, browser route synchronization, page switching, and post detail route handling. It can wrap or replace the current browser-routing logic, but route formats must stay compatible.

### Services

`src/services/` modules own Supabase and browser storage side effects. Page modules should call services instead of building Supabase queries inline.

Service modules should keep return shapes compatible with existing render functions during migration. Normalization can move into services only when the equivalent behavior is covered by tests.

### Pages

`src/pages/` modules own page-level render and interaction orchestration:

- `home.mjs`: feed, hot posts, active actors, predictions, homepage support board.
- `detail.mjs`: post detail, media, comments, actions, odds, support trend.
- `create-post.mjs`: create form, image preview/upload, support toggle/deadline, publish.
- `leaderboard.mjs`: leaderboard tabs, row rendering, live refresh, preview.
- `activity.mjs`: static activity filtering, cards, modal behavior.
- `profile.mjs`: profile header, avatar update, profile posts/activity, wallet panel.
- `auth.mjs`: login/signup mode and submit flow.
- `agents.mjs`: Agent dashboard and auto-reply toggle.
- `space.mjs`: reuse existing space modules with minimal path updates.

Page modules may depend on components, features, services, state, DOM refs, and utilities.

### Components And Features

`src/components/` should hold reusable render units that return markup or update a contained DOM node, such as post cards, comments, market cards, search UI, support board UI, cookie UI, and wallet panel UI.

`src/features/` should hold larger behavior that crosses page/component boundaries, such as market betting, post actions, Lens agent refresh, leaderboard live polling, and cookie sync.

### Utilities

`src/utils/` should hold pure helpers first: escaping, formatting, avatar rendering helpers, time helpers, storage helpers, compact number formatting, and text trimming.

Utilities must stay small and should not depend on app state or DOM unless their filename makes that dependency explicit.

## HTML And CSS Extraction

`front/index.html` should keep the same semantic page containers and IDs during the first implementation pass. This lowers visual and behavioral risk because existing selectors and tests can continue to work.

CSS should be moved from inline style blocks into linked CSS files under `front/styles/`. Extraction should preserve selector text and declaration order as much as practical. Any intentional selector rename should be avoided unless required by duplicate IDs or broken markup.

Inline scripts in `index.html` should be moved only after the equivalent module entry points exist. The final `index.html` should load CSS files and `src/main.mjs`.

## Supabase Scope

The first implementation plan should not restructure the whole backend.

Allowed backend work:

- Update frontend imports and tests if paths move.
- Keep existing Supabase schema, migrations, RPC names, view names, and Edge Function routes unchanged.
- Optionally extract a very small helper from `supabase/functions/agent-auto-comment/index.ts` only if needed for tests touched by the frontend split.

Deferred backend work:

- Full decomposition of `agent-auto-comment/index.ts`.
- Schema file splitting.
- Migration rewrites.

## Migration Strategy

Use incremental, testable moves:

1. Create `front/src/` and move pure helpers into `utils/`.
2. Move state, DOM refs, and routing into `state.mjs`, `dom.mjs`, and `router.mjs`.
3. Move Supabase access into `services/` modules without changing query behavior.
4. Move existing feature-sized logic into `features/`, using already existing modules where possible.
5. Move page render/orchestration functions into `pages/`.
6. Move reusable markup/render helpers into `components/`.
7. Extract CSS from `index.html` into `styles/`.
8. Replace `front/app.mjs` with a small compatibility entry or remove it after `index.html` points to `src/main.mjs`.

Each step should keep the app runnable.

## Testing And Verification

Keep the existing `node --test` test style. Prefer updating imports and adding narrow structure tests over introducing new tooling.

Verification should include:

- `node --test front/*.test.mjs`
- `node --test supabase/*.test.mjs supabase/functions/*/*.test.mjs` when backend-adjacent files are touched
- `node front/health-check.mjs`
- A local static server smoke check for `front/`
- Browser verification of core routes: home, detail, create, leaderboard, activity, profile, agents, space, auth

Visual verification should compare page screenshots before and after meaningful CSS or HTML extraction. The expected result is no intentional visible difference.

## Risks And Mitigations

- Risk: Moving functions breaks implicit global access from inline handlers.
  Mitigation: Preserve needed globals temporarily through explicit `window` assignments until handlers are converted.

- Risk: Splitting CSS changes cascade order.
  Mitigation: Extract CSS in source order and link files in the same order.

- Risk: Tests assume old import paths.
  Mitigation: Update tests in the same step as the module move and run focused tests immediately.

- Risk: Existing dirty working tree contains unrelated user changes.
  Mitigation: Stage only files changed for the refactor and avoid reverting unrelated edits.

- Risk: Large moves make regressions hard to isolate.
  Mitigation: Commit or checkpoint in small batches after passing the relevant verification.

## Acceptance Criteria

- The app remains a static SPA served directly from `front/`.
- Netlify can still publish `front/` without a build command.
- Existing routes and hash URLs keep working.
- The visible UI and core interactions remain unchanged.
- `front/app.mjs` and `front/index.html` are substantially smaller or become compatibility shells.
- Core behavior is organized by entry/state/router/services/pages/components/features/utils.
- Relevant existing tests and health checks pass.
- No unrelated user work is reverted or overwritten.
