# Static SPA Structure Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the HACKCLUB static SPA into focused frontend modules while preserving the current UI, routes, runtime behavior, Supabase contracts, and no-build Netlify deployment.

**Architecture:** Keep `front/index.html` as the static entry and move code out incrementally from `front/app.mjs` into `front/src/`. Preserve existing global handlers during migration by assigning them from module exports onto `window`. Keep tests in `front/*.test.mjs` and update imports as modules move.

**Tech Stack:** Static HTML/CSS/ES modules, Supabase JS browser client, Node `node:test`, Netlify static publish from `front/`.

---

## File Structure Map

Create or modify only these frontend structure files unless a task explicitly says otherwise:

- `front/app.mjs`: temporary compatibility entry while extraction proceeds. It should shrink over time and eventually import from `front/src/main.mjs`.
- `front/index.html`: keep page markup and IDs stable; later replace inline style/script blocks with linked files/modules.
- `front/src/main.mjs`: app bootstrap and initialization order.
- `front/src/state.mjs`: shared mutable state object and state reset helpers used by tests.
- `front/src/dom.mjs`: stable DOM refs, `byIdOrSelector`, and narrow DOM utilities.
- `front/src/router.mjs`: hash parsing, route syncing, page switching, and post detail route helpers.
- `front/src/config.mjs`: config readiness and constants that are not page-specific.
- `front/src/utils/html.mjs`: `escapeHtml`, `escapeAttribute`, `escapeRegExp`, `renderParagraphs`, `highlightMentions`.
- `front/src/utils/format.mjs`: `formatCompact`, `trimText`, `rankClass`, `medal`.
- `front/src/utils/time.mjs`: `formatRelativeTime`, `formatDate`, countdown helpers that do not touch DOM.
- `front/src/utils/avatar.mjs`: emoji/image avatar helpers.
- `front/src/utils/storage.mjs`: localStorage helpers for bookmarks, comment interactions, cookie preferences.
- `front/src/services/supabase-client.mjs`: shared Supabase client/config access.
- `front/src/services/posts-api.mjs`: post feed, detail, create, delete, like, share.
- `front/src/services/comments-api.mjs`: comment load/create/like/share.
- `front/src/services/leaderboard-api.mjs`: leaderboard and ranking data fetches.
- `front/src/services/wallet-api.mjs`: wallet summary, transactions, reward function calls.
- `front/src/services/agents-api.mjs`: Agent dashboard data and auto-reply toggle.
- `front/src/services/storage-api.mjs`: image/avatar uploads.
- `front/src/pages/home.mjs`: home feed render and homepage sidebars.
- `front/src/pages/detail.mjs`: detail render, comments render, detail actions.
- `front/src/pages/create-post.mjs`: create form render and submit orchestration.
- `front/src/pages/leaderboard.mjs`: leaderboard render, row expansion, live refresh.
- `front/src/pages/activity.mjs`: activity filter/cards/modal.
- `front/src/pages/profile.mjs`: profile header, avatar, posts, activity, wallet.
- `front/src/pages/auth.mjs`: login/signup mode and submit.
- `front/src/pages/agents.mjs`: Agent dashboard.
- `front/src/pages/space.mjs`: wrapper for existing space modules.
- `front/src/components/post-card.mjs`: feed/detail post card markup helpers.
- `front/src/components/comment-list.mjs`: comment markup helpers.
- `front/src/components/post-market.mjs`: post market render helpers and controls.
- `front/src/components/support-board.mjs`: support board render helpers.
- `front/src/components/search-box.mjs`: global search dropdown/render helpers.
- `front/src/components/cookie-consent.mjs`: cookie consent UI render/bind helpers.
- `front/src/components/wallet-panel.mjs`: wallet panel render helpers.
- `front/src/features/post-actions.mjs`: like/bookmark/share/delete actions.
- `front/src/features/market-bets.mjs`: post market bet/reward flows.
- `front/src/features/support-board-data.mjs`: bridge or re-export from current support-board modules.
- `front/src/features/lens-agent.mjs`: Lens agent refresh scheduling.
- `front/src/features/leaderboard-live.mjs`: leaderboard polling.
- `front/src/features/cookie-sync.mjs`: backend cookie preference sync.
- `front/styles/base.css`: reset, variables, body, typography, shared primitives.
- `front/styles/layout.css`: nav, global shell, page containers, modal overlay, responsive layout.
- `front/styles/pages/*.css`: page-specific CSS moved in source order.
- `front/health-check.mjs`: update only if script path checks require it.
- `front/*.test.mjs`: update imports and add narrow tests for extracted modules.

Do not change these backend files for this plan unless a test import path proves it is unavoidable:

- `supabase/schema.sql`
- `supabase/migrations/*`
- `supabase/functions/*`

---

## Task 1: Baseline Verification And Safety Snapshot

**Files:**
- Read: `front/app.mjs`
- Read: `front/index.html`
- Read: `front/health-check.mjs`
- No code changes in this task

- [ ] **Step 1: Confirm the dirty worktree before touching code**

Run:

```powershell
git status --short --branch
```

Expected: output may include existing user changes in `front/` and `supabase/`. Record that these are pre-existing and do not revert them.

- [ ] **Step 2: Run current frontend tests**

Run:

```powershell
node --test front/*.test.mjs
```

Expected: PASS, or existing failures documented before the refactor begins. If failures are unrelated and pre-existing, continue only after noting the failing test names.

- [ ] **Step 3: Run current health check**

Run:

```powershell
node front/health-check.mjs
```

Expected: PASS, or existing failures documented before the refactor begins.

- [ ] **Step 4: Capture the current module entry points**

Run:

```powershell
Select-String -Path front\index.html -Pattern '<script|<style|stylesheet|app.mjs'
```

Expected: shows the inline style/script blocks and the current `./app.mjs` module script. Use this as the source-order guide for CSS/script extraction.

- [ ] **Step 5: Commit nothing**

No commit is needed for a read-only baseline task.

---

## Task 2: Add Module Skeleton And Structure Tests

**Files:**
- Create: `front/src/main.mjs`
- Create: `front/src/state.mjs`
- Create: `front/src/dom.mjs`
- Create: `front/src/router.mjs`
- Create: `front/src/config.mjs`
- Create: `front/src/utils/html.mjs`
- Create: `front/src/utils/format.mjs`
- Create: `front/src/utils/time.mjs`
- Create: `front/src/utils/avatar.mjs`
- Create: `front/src/utils/storage.mjs`
- Create: `front/src/services/supabase-client.mjs`
- Create: `front/src/pages/home.mjs`
- Create: `front/src/components/post-card.mjs`
- Create: `front/src/features/post-actions.mjs`
- Create: `front/static-spa-structure.test.mjs`

- [ ] **Step 1: Write the failing structure test**

Create `front/static-spa-structure.test.mjs`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";

const expectedModules = [
  "front/src/main.mjs",
  "front/src/state.mjs",
  "front/src/dom.mjs",
  "front/src/router.mjs",
  "front/src/config.mjs",
  "front/src/utils/html.mjs",
  "front/src/utils/format.mjs",
  "front/src/utils/time.mjs",
  "front/src/utils/avatar.mjs",
  "front/src/utils/storage.mjs",
  "front/src/services/supabase-client.mjs",
  "front/src/pages/home.mjs",
  "front/src/components/post-card.mjs",
  "front/src/features/post-actions.mjs",
];

describe("static SPA module structure", () => {
  for (const path of expectedModules) {
    it(`${path} exists`, async () => {
      await assert.doesNotReject(() => access(path));
    });
  }
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```powershell
node --test front/static-spa-structure.test.mjs
```

Expected: FAIL with missing file errors for `front/src/...`.

- [ ] **Step 3: Create minimal module skeletons**

Create the files with these exact exports:

`front/src/main.mjs`

```js
export function initApp() {
  return null;
}
```

`front/src/state.mjs`

```js
export const state = {};

export function resetState(nextState = {}) {
  for (const key of Object.keys(state)) {
    delete state[key];
  }
  Object.assign(state, nextState);
  return state;
}
```

`front/src/dom.mjs`

```js
export const byIdOrSelector = (id, selector = "") =>
  document.getElementById(id) || (selector ? document.querySelector(selector) : null);
```

`front/src/router.mjs`

```js
export function readRouteFromHash(hash = "") {
  return { page: hash.replace(/^#\/?/, "") || "home", postId: null };
}
```

`front/src/config.mjs`

```js
export const APP_CONFIG = Object.freeze({});
```

`front/src/utils/html.mjs`

```js
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
```

`front/src/utils/format.mjs`

```js
export function trimText(text, maxLength) {
  const value = String(text ?? "");
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
```

`front/src/utils/time.mjs`

```js
export function toDate(value) {
  return value ? new Date(value) : null;
}
```

`front/src/utils/avatar.mjs`

```js
export function isEmojiAvatar(value) {
  return typeof value === "string" && value.startsWith("emoji:");
}
```

`front/src/utils/storage.mjs`

```js
export function readJsonStorage(storage, key, fallback) {
  try {
    const rawValue = storage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}
```

`front/src/services/supabase-client.mjs`

```js
export function getSupabaseClient(client) {
  return client;
}
```

`front/src/pages/home.mjs`

```js
export function renderHome() {
  return null;
}
```

`front/src/components/post-card.mjs`

```js
export function renderPostCard() {
  return "";
}
```

`front/src/features/post-actions.mjs`

```js
export function createPostActions() {
  return {};
}
```

- [ ] **Step 4: Run the structure test**

Run:

```powershell
node --test front/static-spa-structure.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run existing frontend tests**

Run:

```powershell
node --test front/*.test.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 6: Commit the skeleton**

Run:

```powershell
git add -- front/src front/static-spa-structure.test.mjs
git commit -m "refactor: add static spa module skeleton"
```

Expected: commit contains only skeleton files and the structure test.

---

## Task 3: Extract Pure Utility Helpers

**Files:**
- Modify: `front/src/utils/html.mjs`
- Modify: `front/src/utils/format.mjs`
- Modify: `front/src/utils/time.mjs`
- Modify: `front/src/utils/avatar.mjs`
- Modify: `front/src/utils/storage.mjs`
- Modify: `front/app.mjs`
- Create: `front/utils-extraction.test.mjs`

- [ ] **Step 1: Write utility tests before moving code**

Create `front/utils-extraction.test.mjs`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, escapeAttribute, escapeRegExp, renderParagraphs } from "./src/utils/html.mjs";
import { formatCompact, trimText } from "./src/utils/format.mjs";
import { isEmojiAvatar, getEmojiAvatar } from "./src/utils/avatar.mjs";
import { readJsonStorage } from "./src/utils/storage.mjs";

describe("extracted HTML utilities", () => {
  it("escapes HTML-sensitive characters", () => {
    assert.equal(escapeHtml(`<b title="x">A&B</b>`), "&lt;b title=&quot;x&quot;&gt;A&amp;B&lt;/b&gt;");
  });

  it("escapes attribute-sensitive characters", () => {
    assert.equal(escapeAttribute(`"A&B"`), "&quot;A&amp;B&quot;");
  });

  it("escapes regular expression syntax", () => {
    assert.equal(escapeRegExp("a+b?"), "a\\+b\\?");
  });

  it("renders paragraphs from newline-separated text", () => {
    assert.equal(renderParagraphs("one\n\ntwo"), "<p>one</p><p>two</p>");
  });
});

describe("extracted formatting utilities", () => {
  it("trims long text", () => {
    assert.equal(trimText("abcdef", 4), "abcd...");
  });

  it("formats compact numbers", () => {
    assert.equal(formatCompact(1200), "1.2K");
  });
});

describe("extracted avatar utilities", () => {
  it("recognizes emoji avatars", () => {
    assert.equal(isEmojiAvatar("emoji:🔥"), true);
    assert.equal(getEmojiAvatar("emoji:🔥"), "🔥");
  });
});

describe("extracted storage utilities", () => {
  it("returns fallback on malformed JSON", () => {
    const storage = { getItem: () => "not json" };
    assert.deepEqual(readJsonStorage(storage, "x", []), []);
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```powershell
node --test front/utils-extraction.test.mjs
```

Expected: FAIL for missing exports such as `escapeAttribute`, `escapeRegExp`, `formatCompact`, and `getEmojiAvatar`.

- [ ] **Step 3: Move the matching helper implementations from `front/app.mjs`**

Move these existing functions without behavior changes:

- `escapeHtml` to `front/src/utils/html.mjs`
- `escapeAttribute` to `front/src/utils/html.mjs`
- `escapeRegExp` to `front/src/utils/html.mjs`
- `renderParagraphs` to `front/src/utils/html.mjs`
- `highlightMentions` to `front/src/utils/html.mjs`
- `trimText` to `front/src/utils/format.mjs`
- `formatCompact` to `front/src/utils/format.mjs`
- `rankClass` to `front/src/utils/format.mjs`
- `medal` to `front/src/utils/format.mjs`
- `formatRelativeTime` to `front/src/utils/time.mjs`
- `formatDate` to `front/src/utils/time.mjs`
- `isEmojiAvatar` to `front/src/utils/avatar.mjs`
- `getEmojiAvatar` to `front/src/utils/avatar.mjs`
- storage JSON read/write helpers to `front/src/utils/storage.mjs`

Update `front/app.mjs` to import the moved helpers:

```js
import {
  escapeAttribute,
  escapeHtml,
  escapeRegExp,
  highlightMentions,
  renderParagraphs,
} from "./src/utils/html.mjs";
import { formatCompact, medal, rankClass, trimText } from "./src/utils/format.mjs";
import { formatDate, formatRelativeTime } from "./src/utils/time.mjs";
import { getEmojiAvatar, isEmojiAvatar } from "./src/utils/avatar.mjs";
```

Remove the old local function declarations from `front/app.mjs` only after imports are added.

- [ ] **Step 4: Run the utility test**

Run:

```powershell
node --test front/utils-extraction.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run focused existing tests that import utility-adjacent modules**

Run:

```powershell
node --test front/post-media-render.test.mjs front/support-board-render.test.mjs front/agent-insights-render.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Run all frontend tests**

Run:

```powershell
node --test front/*.test.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 7: Commit utility extraction**

Run:

```powershell
git add -- front/app.mjs front/src/utils front/utils-extraction.test.mjs
git commit -m "refactor: extract frontend utility helpers"
```

Expected: commit contains only helper moves, imports, and utility tests.

---

## Task 4: Extract State, DOM References, And Config

**Files:**
- Modify: `front/src/state.mjs`
- Modify: `front/src/dom.mjs`
- Modify: `front/src/config.mjs`
- Modify: `front/app.mjs`
- Create: `front/state-dom-config.test.mjs`

- [ ] **Step 1: Write tests for state and DOM helpers**

Create `front/state-dom-config.test.mjs`:

```js
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { state, resetState } from "./src/state.mjs";
import { byIdOrSelector, getRequiredElement } from "./src/dom.mjs";
import { getConfigReady } from "./src/config.mjs";

describe("shared state module", () => {
  beforeEach(() => resetState());

  it("resets and replaces state keys", () => {
    state.old = true;
    resetState({ activePage: "home" });
    assert.deepEqual(state, { activePage: "home" });
  });
});

describe("DOM helpers", () => {
  it("finds by id before selector", () => {
    global.document = {
      getElementById: (id) => (id === "target" ? { id } : null),
      querySelector: () => ({ id: "fallback" }),
    };
    assert.deepEqual(byIdOrSelector("target", ".fallback"), { id: "target" });
  });

  it("throws a clear error for required missing elements", () => {
    global.document = {
      getElementById: () => null,
      querySelector: () => null,
    };
    assert.throws(() => getRequiredElement("missing"), /Missing required element: missing/);
  });
});

describe("config readiness", () => {
  it("requires a URL-like Supabase URL and anon key", () => {
    assert.equal(getConfigReady("https://example.supabase.co", "anon"), true);
    assert.equal(getConfigReady("", "anon"), false);
    assert.equal(getConfigReady("example", "anon"), false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node --test front/state-dom-config.test.mjs
```

Expected: FAIL for missing `getRequiredElement` and `getConfigReady`.

- [ ] **Step 3: Move state initialization into `front/src/state.mjs`**

Move the current `const state = { ... }` initializer from `front/app.mjs` into `front/src/state.mjs` and export it:

```js
export const state = {
  // paste the existing state object properties from front/app.mjs unchanged
};

export function resetState(nextState = {}) {
  for (const key of Object.keys(state)) {
    delete state[key];
  }
  Object.assign(state, nextState);
  return state;
}
```

Update `front/app.mjs`:

```js
import { state } from "./src/state.mjs";
```

Remove the local `const state = { ... }` declaration from `front/app.mjs`.

- [ ] **Step 4: Move DOM helpers and element references**

Update `front/src/dom.mjs`:

```js
export const byIdOrSelector = (id, selector = "") =>
  document.getElementById(id) || (selector ? document.querySelector(selector) : null);

export function getRequiredElement(id, selector = "") {
  const element = byIdOrSelector(id, selector);
  if (!element) {
    throw new Error(`Missing required element: ${id}`);
  }
  return element;
}

export function createElementRefs() {
  return {
    // paste the existing els object properties from front/app.mjs unchanged
  };
}
```

Update `front/app.mjs`:

```js
import { byIdOrSelector, createElementRefs } from "./src/dom.mjs";

const els = createElementRefs();
```

Remove the local `byIdOrSelector` and local `const els = { ... }` declarations from `front/app.mjs`.

- [ ] **Step 5: Move config constants that are not page-specific**

Update `front/src/config.mjs`:

```js
export function getConfigReady(supabaseUrl, supabaseAnonKey) {
  return Boolean(supabaseUrl && supabaseAnonKey && /^https?:\/\//.test(supabaseUrl));
}

export const FEATURE_GATES = Object.freeze({
  // paste existing FEATURE_GATES values unchanged
});
```

Update `front/app.mjs` imports:

```js
import { FEATURE_GATES, getConfigReady } from "./src/config.mjs";

const configReady = getConfigReady(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Remove the local `FEATURE_GATES` and inline `configReady` expression after import.

- [ ] **Step 6: Run the new tests**

Run:

```powershell
node --test front/state-dom-config.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Run all frontend tests and health check**

Run:

```powershell
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 8: Commit state, DOM, and config extraction**

Run:

```powershell
git add -- front/app.mjs front/src/state.mjs front/src/dom.mjs front/src/config.mjs front/state-dom-config.test.mjs
git commit -m "refactor: extract app state and DOM setup"
```

Expected: commit contains state, DOM, and config moves only.

---

## Task 5: Extract Router While Preserving Global Navigation Handlers

**Files:**
- Modify: `front/src/router.mjs`
- Modify: `front/app.mjs`
- Modify: `front/hash-router.test.mjs`

- [ ] **Step 1: Extend router tests around existing route compatibility**

Update `front/hash-router.test.mjs` to import route helpers from `front/src/router.mjs` and assert these cases:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readRouteFromHash } from "./src/router.mjs";

describe("SPA hash router compatibility", () => {
  it("maps an empty hash to home", () => {
    assert.deepEqual(readRouteFromHash(""), { page: "home", postId: null });
  });

  it("maps page hashes", () => {
    assert.deepEqual(readRouteFromHash("#/leaderboard"), { page: "leaderboard", postId: null });
  });

  it("maps post detail hashes", () => {
    assert.deepEqual(readRouteFromHash("#/post/post-001"), { page: "detail", postId: "post-001" });
  });
});
```

If the existing test file already covers these cases with different helper names, keep the existing assertions and add imports from `src/router.mjs` instead of duplicating whole suites.

- [ ] **Step 2: Run router tests to verify failure or compatibility gap**

Run:

```powershell
node --test front/hash-router.test.mjs
```

Expected: FAIL if `readRouteFromHash` does not yet support post detail hashes.

- [ ] **Step 3: Move routing helpers from `front/app.mjs` to `front/src/router.mjs`**

Move these functions unchanged where possible:

- `initBrowserRouting`
- `handleBrowserRouteChange`
- `applyBrowserRoute`
- `syncBrowserRoute`
- `syncBrowserRouteForPage`
- `syncBrowserRouteForPost`
- `navigate`
- `openDetailById` only if its data/render dependencies can be passed as callbacks; otherwise leave it in `app.mjs` and let router call a provided `openPostDetail` callback.

Use this exported router shape:

```js
export function readRouteFromHash(hash = "") {
  const cleaned = String(hash || "").replace(/^#\/?/, "");
  if (!cleaned || cleaned === "home") {
    return { page: "home", postId: null };
  }
  const postMatch = cleaned.match(/^post\/(.+)$/);
  if (postMatch) {
    return { page: "detail", postId: decodeURIComponent(postMatch[1]) };
  }
  return { page: cleaned.split("/")[0], postId: null };
}

export function createRouter({
  getWindow = () => window,
  showPage,
  openPostDetail,
  redirectAuthenticatedAuthRoute,
}) {
  function applyBrowserRoute(route = readRouteFromHash(getWindow().location.hash)) {
    if (route.page === "detail" && route.postId) {
      openPostDetail(route.postId, { preserveRoute: true });
      return;
    }
    if (route.page === "auth") {
      redirectAuthenticatedAuthRoute(route.page);
      return;
    }
    showPage(route.page || "home", { preserveRoute: true });
  }

  function syncBrowserRoute(hash, { replace = false } = {}) {
    const nextHash = hash.startsWith("#") ? hash : `#/${hash.replace(/^\/+/, "")}`;
    if (replace) {
      getWindow().history.replaceState(null, "", nextHash);
    } else {
      getWindow().history.pushState(null, "", nextHash);
    }
  }

  return {
    applyBrowserRoute,
    syncBrowserRoute,
    syncBrowserRouteForPage(page, options = {}) {
      syncBrowserRoute(page === "home" ? "#/home" : `#/${page}`, options);
    },
    syncBrowserRouteForPost(postId, options = {}) {
      syncBrowserRoute(`#/post/${encodeURIComponent(postId)}`, options);
    },
  };
}
```

Preserve any existing route edge cases from `front/app.mjs` if they differ from the skeleton above.

- [ ] **Step 4: Rebind global handlers from `front/app.mjs`**

After importing router helpers in `front/app.mjs`, preserve inline HTML handlers:

```js
import { createRouter } from "./src/router.mjs";

const router = createRouter({
  showPage: navigate,
  openPostDetail: openDetailById,
  redirectAuthenticatedAuthRoute,
});

window.navigate = navigate;
```

If `navigate` itself moves into `router.mjs`, assign the imported function:

```js
window.navigate = navigate;
```

- [ ] **Step 5: Run router and frontend tests**

Run:

```powershell
node --test front/hash-router.test.mjs
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 6: Commit router extraction**

Run:

```powershell
git add -- front/app.mjs front/src/router.mjs front/hash-router.test.mjs
git commit -m "refactor: extract static spa routing"
```

Expected: commit contains router extraction and route test updates only.

---

## Task 6: Extract Supabase And Browser Side-Effect Services

**Files:**
- Create: `front/src/services/posts-api.mjs`
- Create: `front/src/services/comments-api.mjs`
- Create: `front/src/services/leaderboard-api.mjs`
- Create: `front/src/services/wallet-api.mjs`
- Create: `front/src/services/agents-api.mjs`
- Create: `front/src/services/storage-api.mjs`
- Modify: `front/src/services/supabase-client.mjs`
- Modify: `front/app.mjs`
- Create: `front/services-contract.test.mjs`

- [ ] **Step 1: Write service contract tests**

Create `front/services-contract.test.mjs`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createSupabaseRestService } from "./src/services/supabase-client.mjs";
import { createPostsApi } from "./src/services/posts-api.mjs";

describe("Supabase service contracts", () => {
  it("passes through table selects without changing row shape", async () => {
    const calls = [];
    const client = {
      from(table) {
        calls.push(["from", table]);
        return {
          select(columns) {
            calls.push(["select", columns]);
            return {
              order(column, options) {
                calls.push(["order", column, options]);
                return Promise.resolve({ data: [{ id: "post-1", title: "Hello" }], error: null });
              },
            };
          },
        };
      },
    };

    const api = createPostsApi(client);
    const rows = await api.listFeedPosts();

    assert.deepEqual(rows, [{ id: "post-1", title: "Hello" }]);
    assert.deepEqual(calls[0], ["from", "feed_posts"]);
  });

  it("throws Supabase errors with the original message", async () => {
    const service = createSupabaseRestService({
      from() {
        return {
          select() {
            return Promise.resolve({ data: null, error: { message: "boom" } });
          },
        };
      },
    });

    await assert.rejects(() => service.select("feed_posts", "*"), /boom/);
  });
});
```

- [ ] **Step 2: Run service tests to verify failure**

Run:

```powershell
node --test front/services-contract.test.mjs
```

Expected: FAIL for missing exports.

- [ ] **Step 3: Implement shared Supabase client helpers**

Update `front/src/services/supabase-client.mjs`:

```js
export function getSupabaseClient(client) {
  return client;
}

export function assertSupabaseResult(result) {
  if (result?.error) {
    throw new Error(result.error.message || "Supabase request failed");
  }
  return result?.data ?? null;
}

export function createSupabaseRestService(client) {
  return {
    async select(table, columns = "*") {
      const result = await client.from(table).select(columns);
      return assertSupabaseResult(result);
    },
  };
}
```

- [ ] **Step 4: Implement `posts-api` first**

Create `front/src/services/posts-api.mjs`:

```js
import { assertSupabaseResult } from "./supabase-client.mjs";

export function createPostsApi(client) {
  return {
    async listFeedPosts() {
      const result = await client
        .from("feed_posts")
        .select("*")
        .order("created_at", { ascending: false });
      return assertSupabaseResult(result) ?? [];
    },
  };
}
```

Then move existing post-related Supabase calls from `front/app.mjs` into this API one method at a time: detail load, post create, post delete, like/unlike, share record, market bet RPC wrappers if they are post-specific.

- [ ] **Step 5: Add remaining service modules as thin wrappers**

Each service module should export a factory and use the exact table/RPC names already used in `front/app.mjs`:

```js
export function createCommentsApi(client) {
  return {};
}
```

```js
export function createLeaderboardApi(client) {
  return {};
}
```

```js
export function createWalletApi(client) {
  return {};
}
```

```js
export function createAgentsApi(client) {
  return {};
}
```

```js
export function createStorageApi(client, bucketName) {
  return {};
}
```

Replace `{}` with moved existing behavior only as the call sites are migrated. Do not invent new API return shapes.

- [ ] **Step 6: Update `front/app.mjs` to instantiate services**

Add imports and service construction near Supabase client setup:

```js
import { createPostsApi } from "./src/services/posts-api.mjs";
import { createCommentsApi } from "./src/services/comments-api.mjs";
import { createLeaderboardApi } from "./src/services/leaderboard-api.mjs";
import { createWalletApi } from "./src/services/wallet-api.mjs";
import { createAgentsApi } from "./src/services/agents-api.mjs";
import { createStorageApi } from "./src/services/storage-api.mjs";

const postsApi = createPostsApi(supabase);
const commentsApi = createCommentsApi(supabase);
const leaderboardApi = createLeaderboardApi(supabase);
const walletApi = createWalletApi(supabase);
const agentsApi = createAgentsApi(supabase);
const storageApi = createStorageApi(supabase, STORAGE_BUCKET);
```

Replace inline Supabase calls with the matching service method only after that method has a focused test or an unchanged render-level test covering the call.

- [ ] **Step 7: Run service and frontend tests**

Run:

```powershell
node --test front/services-contract.test.mjs
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 8: Commit service extraction**

Run:

```powershell
git add -- front/app.mjs front/src/services front/services-contract.test.mjs
git commit -m "refactor: extract frontend data services"
```

Expected: commit contains service files and call-site updates only.

---

## Task 7: Extract Existing Feature Modules And Bridges

**Files:**
- Modify: `front/src/features/support-board-data.mjs`
- Modify: `front/src/features/lens-agent.mjs`
- Modify: `front/src/features/market-bets.mjs`
- Modify: `front/src/features/leaderboard-live.mjs`
- Modify: `front/src/features/cookie-sync.mjs`
- Modify: `front/src/features/post-actions.mjs`
- Modify: `front/app.mjs`
- Modify: existing related `front/*.test.mjs`

- [ ] **Step 1: Re-export already extracted support board and Lens modules**

Use the existing files instead of duplicating logic:

`front/src/features/support-board-data.mjs`

```js
export * from "../../support-board-data.mjs";
export * from "../../support-board-render.mjs";
```

`front/src/features/lens-agent.mjs`

```js
export * from "../../lens-agent-remote.mjs";
export * from "../../agent-insights.mjs";
export * from "../../agent-insights-render.mjs";
```

- [ ] **Step 2: Run related tests**

Run:

```powershell
node --test front/support-board-data.test.mjs front/support-board-render.test.mjs front/lens-agent-remote.test.mjs front/agent-insights.test.mjs front/agent-insights-render.test.mjs
```

Expected: PASS.

- [ ] **Step 3: Move post action helpers**

Move these existing functions from `front/app.mjs` into `front/src/features/post-actions.mjs`, preserving signatures:

- `recordPostShare`
- `shareCurrentPost`
- `deleteCurrentPost`
- `toggleBookmark`
- `toggleLike`
- `canDeleteCurrentPost`
- `setDetailActionStatus`

Export a factory if the functions need state/services:

```js
export function createPostActions({ state, els, postsApi, renderDetailActions, renderFeed, setStatus }) {
  async function shareCurrentPost() {
    // paste existing function body and replace closed-over dependencies with parameters above
  }

  return {
    shareCurrentPost,
    deleteCurrentPost,
    toggleBookmark,
    toggleLike,
    renderDetailActions,
  };
}
```

Keep the old `window.shareCurrentPost` or click bindings working by assigning returned functions in `front/app.mjs`.

- [ ] **Step 4: Move market bet helpers**

Move these existing functions into `front/src/features/market-bets.mjs`, preserving behavior:

- `handlePostSideStake`
- `handleFeedPostSideStake`
- `submitPostBet`
- `claimPostMarketRewards`
- `tryPostBetRpc`
- market deadline helpers if they are used only by market betting/rendering

Use a factory:

```js
export function createMarketBets({ state, walletApi, postsApi, renderFeed, renderDetail, setStatus }) {
  return {
    handlePostSideStake,
    handleFeedPostSideStake,
    submitPostBet,
    claimPostMarketRewards,
  };
}
```

Paste existing function bodies and replace closed-over dependencies with parameters.

- [ ] **Step 5: Move leaderboard polling**

Move `startLeaderboardLiveUpdates`, `refreshLiveLeaderboard`, `setLeaderboardLiveStatus`, and `debounce` into `front/src/features/leaderboard-live.mjs`:

```js
export function createLeaderboardLive({ loadLeaderboardData, renderLeaderboard, getContextKey, setStatus }) {
  return {
    startLeaderboardLiveUpdates,
    refreshLiveLeaderboard,
  };
}
```

Preserve timer intervals and status text.

- [ ] **Step 6: Move cookie sync**

Move backend sync functions into `front/src/features/cookie-sync.mjs`:

- `syncCookieConsentWithBackend`
- `syncCookieConsentToBackend`
- cookie preference load/save helpers only if they are not already in `utils/storage.mjs`

Keep UI open/close/render behavior in the page/component layer.

- [ ] **Step 7: Run related tests and full frontend tests**

Run:

```powershell
node --test front/post-actions.test.mjs front/wallet-rewards.test.mjs front/post-market-rates.test.mjs front/cookie-consent.test.mjs
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 8: Commit feature extraction**

Run:

```powershell
git add -- front/app.mjs front/src/features front/*.test.mjs
git commit -m "refactor: extract frontend feature flows"
```

Expected: commit contains feature modules and focused test import updates.

---

## Task 8: Extract Page Modules

**Files:**
- Modify: `front/src/pages/home.mjs`
- Modify: `front/src/pages/detail.mjs`
- Modify: `front/src/pages/create-post.mjs`
- Modify: `front/src/pages/leaderboard.mjs`
- Modify: `front/src/pages/activity.mjs`
- Modify: `front/src/pages/profile.mjs`
- Modify: `front/src/pages/auth.mjs`
- Modify: `front/src/pages/agents.mjs`
- Modify: `front/src/pages/space.mjs`
- Modify: `front/app.mjs`
- Create: `front/pages-contract.test.mjs`

- [ ] **Step 1: Write page contract tests**

Create `front/pages-contract.test.mjs`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const pageModules = {
  home: "./src/pages/home.mjs",
  detail: "./src/pages/detail.mjs",
  createPost: "./src/pages/create-post.mjs",
  leaderboard: "./src/pages/leaderboard.mjs",
  activity: "./src/pages/activity.mjs",
  profile: "./src/pages/profile.mjs",
  auth: "./src/pages/auth.mjs",
  agents: "./src/pages/agents.mjs",
  space: "./src/pages/space.mjs",
};

describe("page modules", () => {
  for (const [name, path] of Object.entries(pageModules)) {
    it(`${name} exports a createPage factory`, async () => {
      const module = await import(path);
      assert.equal(typeof module.createPage, "function");
    });
  }
});
```

- [ ] **Step 2: Run page contract tests to verify failure**

Run:

```powershell
node --test front/pages-contract.test.mjs
```

Expected: FAIL for missing modules or missing `createPage`.

- [ ] **Step 3: Add page factory shell to each page**

Each page file should export a `createPage` factory with the same shape:

```js
export function createPage(deps) {
  return {
    init() {},
    render() {},
  };
}
```

Use this shell in every listed page module before moving behavior.

- [ ] **Step 4: Move home page functions**

Move these from `front/app.mjs` into `front/src/pages/home.mjs`:

- `loadHomepageData`
- `renderFeed`
- `renderHomeHotPosts`
- `renderHomeActiveActors`
- `renderHomePredictions`
- `renderFeedTabsHeader`
- `renderFeedSearchBanner`
- home support board render/bind functions if not already in component/feature modules

Use:

```js
export function createPage({ state, els, postsApi, leaderboardApi, renderPostCard, scheduleLensRefresh }) {
  async function loadHomepageData(options = {}) {
    // paste existing body and replace closed-over dependencies with deps
  }

  return {
    init() {},
    loadHomepageData,
    render: renderFeed,
  };
}
```

- [ ] **Step 5: Move detail page functions**

Move these into `front/src/pages/detail.mjs`:

- `loadDetailData`
- `renderDetail`
- `renderDetailActions`
- `renderDetailComments`
- `submitComment`
- `openDetailById` if not owned by router
- detail support trend and odds render orchestration

Preserve existing DOM IDs and status text.

- [ ] **Step 6: Move create/auth/profile/leaderboard/activity/agents page groups**

Move functions by page boundary:

- `create-post.mjs`: `getCreateImageFile`, `setCreateImagePreview`, `submitPost`, `uploadSelectedImage`, `syncCreateSupportControls`.
- `auth.mjs`: `toggleAuth`, `renderAuthMode`, `renderAuthModeCompat`, `submitAuth`, `mapAuthError`, `redirectAuthenticatedAuthRoute`.
- `profile.mjs`: `loadProfile`, `uploadProfileAvatar`, `updateProfileAvatar`, `renderProfilePosts`, `setProfileTab`, `renderProfileActivity`, `renderProfileAvatar`, `renderProfileWallet`.
- `leaderboard.mjs`: `loadLeaderboardData`, `renderLeaderboard`, `getLeaderboardRows`, `buildAgentPredictionRows`, `renderLeaderboardRow`, `toggleLbRow`, `getLeaderboardContextKey`.
- `activity.mjs`: `filterActivity`, `toggleActivityCard`, `toggleJoin`, `openActivityModal`, `closeActivityModal`, `showUserPreview`, `hideUserPreview`.
- `agents.mjs`: `loadAgentDashboard`, `toggleAgentAutoReply`.
- `space.mjs`: call existing `space-page.mjs`, `space-scene.mjs`, `space-data.mjs`, and `space-logic.mjs` rather than duplicating.

For each moved page, instantiate it in `front/app.mjs` and keep existing global functions:

```js
const homePage = createHomePage({ state, els, postsApi });
window.navigate = navigate;
window.toggleAuth = authPage.toggleAuth;
```

- [ ] **Step 7: Run page contract and existing page tests**

Run:

```powershell
node --test front/pages-contract.test.mjs front/auth-session.test.mjs front/post-actions.test.mjs front/nav-feature-gates.test.mjs front/space-page.test.mjs
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 8: Commit page extraction**

Run:

```powershell
git add -- front/app.mjs front/src/pages front/pages-contract.test.mjs front/*.test.mjs
git commit -m "refactor: extract static spa page modules"
```

Expected: commit contains page modules and call-site updates only.

---

## Task 9: Extract Reusable Render Components

**Files:**
- Modify: `front/src/components/post-card.mjs`
- Modify: `front/src/components/comment-list.mjs`
- Modify: `front/src/components/post-market.mjs`
- Modify: `front/src/components/support-board.mjs`
- Modify: `front/src/components/search-box.mjs`
- Modify: `front/src/components/cookie-consent.mjs`
- Modify: `front/src/components/wallet-panel.mjs`
- Modify: relevant `front/src/pages/*.mjs`
- Create: `front/components-contract.test.mjs`

- [ ] **Step 1: Write component contract tests**

Create `front/components-contract.test.mjs`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderPostCard } from "./src/components/post-card.mjs";
import { renderCommentList } from "./src/components/comment-list.mjs";
import { renderWalletPanel } from "./src/components/wallet-panel.mjs";

describe("render components", () => {
  it("renders post card markup as a string", () => {
    const html = renderPostCard({ id: "p1", title: "Hello", body: "World" });
    assert.equal(typeof html, "string");
    assert.match(html, /Hello|post/i);
  });

  it("renders comment list markup as a string", () => {
    const html = renderCommentList([{ id: "c1", body: "Nice" }]);
    assert.equal(typeof html, "string");
    assert.match(html, /Nice/);
  });

  it("renders wallet panel markup as a string", () => {
    const html = renderWalletPanel({ balance: 10, transactions: [] });
    assert.equal(typeof html, "string");
  });
});
```

- [ ] **Step 2: Run component test to verify failure**

Run:

```powershell
node --test front/components-contract.test.mjs
```

Expected: FAIL for missing exports.

- [ ] **Step 3: Move render-only markup helpers**

Move render-only markup helpers from page modules or `front/app.mjs` into components:

- Feed card and post item markup to `post-card.mjs`.
- Comment list/item markup to `comment-list.mjs`.
- Market card/control markup to `post-market.mjs`.
- Support board markup to `support-board.mjs` or re-export existing `support-board-render.mjs`.
- Search dropdown markup to `search-box.mjs`.
- Cookie modal/bar render helpers to `cookie-consent.mjs`.
- Wallet summary/transactions markup to `wallet-panel.mjs`.

Each component should accept plain data and return HTML or update a passed container. It should not directly fetch data.

- [ ] **Step 4: Wire page modules to components**

Replace local page markup assembly with component imports:

```js
import { renderPostCard } from "../components/post-card.mjs";
import { renderCommentList } from "../components/comment-list.mjs";
```

Keep class names, IDs, data attributes, and text unchanged.

- [ ] **Step 5: Run component, render, and full frontend tests**

Run:

```powershell
node --test front/components-contract.test.mjs front/support-board-render.test.mjs front/post-media-render.test.mjs front/agent-insights-render.test.mjs
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 6: Commit component extraction**

Run:

```powershell
git add -- front/src/components front/src/pages front/app.mjs front/components-contract.test.mjs front/*.test.mjs
git commit -m "refactor: extract static spa render components"
```

Expected: commit contains render component extraction only.

---

## Task 10: Move Bootstrap From `app.mjs` To `src/main.mjs`

**Files:**
- Modify: `front/src/main.mjs`
- Modify: `front/app.mjs`
- Modify: `front/index.html`
- Modify: `front/health-check.mjs`

- [ ] **Step 1: Move initialization order into `src/main.mjs`**

Update `front/src/main.mjs` to import extracted modules and own startup:

```js
export function initApp() {
  initGlobals();
  initBrowserRouting();
  initStaticInteractions();
  bootstrapData();
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", initApp, { once: true });
}
```

Use the existing startup calls from `front/app.mjs` and preserve their order exactly.

- [ ] **Step 2: Turn `front/app.mjs` into a compatibility entry**

After all imports are in `src/main.mjs`, reduce `front/app.mjs` to:

```js
export { initApp } from "./src/main.mjs";
import "./src/main.mjs";
```

Do this only after all globals needed by inline handlers are assigned by modules imported from `src/main.mjs`.

- [ ] **Step 3: Keep `index.html` pointing to `app.mjs` for one verification pass**

Do not change the script tag yet. Keep:

```html
<script type="module" src="./app.mjs"></script>
```

- [ ] **Step 4: Run full frontend verification**

Run:

```powershell
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 5: Point `index.html` to `src/main.mjs`**

Change the module script in `front/index.html`:

```html
<script type="module" src="./src/main.mjs"></script>
```

Update `front/health-check.mjs` only if it explicitly expects `app.mjs`.

- [ ] **Step 6: Run verification again**

Run:

```powershell
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 7: Commit entry extraction**

Run:

```powershell
git add -- front/app.mjs front/index.html front/src/main.mjs front/health-check.mjs
git commit -m "refactor: move app bootstrap to src main"
```

Expected: commit contains entry-point changes only.

---

## Task 11: Extract Inline CSS Without Visual Changes

**Files:**
- Create: `front/styles/base.css`
- Create: `front/styles/layout.css`
- Create: `front/styles/pages/home.css`
- Create: `front/styles/pages/detail.css`
- Create: `front/styles/pages/create.css`
- Create: `front/styles/pages/leaderboard.css`
- Create: `front/styles/pages/activity.css`
- Create: `front/styles/pages/profile.css`
- Create: `front/styles/pages/auth.css`
- Create: `front/styles/pages/agents.css`
- Create: `front/styles/pages/space.css`
- Modify: `front/index.html`
- Modify: `front/health-check.mjs`
- Create: `front/css-links.test.mjs`

- [ ] **Step 1: Write CSS link test**

Create `front/css-links.test.mjs`:

```js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const expectedLinks = [
  "./styles/base.css",
  "./styles/layout.css",
  "./styles/pages/home.css",
  "./styles/pages/detail.css",
  "./styles/pages/create.css",
  "./styles/pages/leaderboard.css",
  "./styles/pages/activity.css",
  "./styles/pages/profile.css",
  "./styles/pages/auth.css",
  "./styles/pages/agents.css",
  "./styles/pages/space.css",
];

describe("CSS extraction links", () => {
  it("loads extracted CSS files from index.html", async () => {
    const html = await readFile("front/index.html", "utf8");
    for (const href of expectedLinks) {
      assert.match(html, new RegExp(`<link[^>]+href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    }
  });
});
```

- [ ] **Step 2: Run CSS link test to verify failure**

Run:

```powershell
node --test front/css-links.test.mjs
```

Expected: FAIL because CSS files are not linked yet.

- [ ] **Step 3: Move CSS in source order**

Extract CSS from `front/index.html` into files while preserving declaration order:

- Variables, reset, body, typography, shared button/input/card primitives to `front/styles/base.css`.
- App shell, nav, global page visibility, modal, cookie shell, responsive layout to `front/styles/layout.css`.
- Selectors that are clearly scoped to `#page-home`, feed, home sidebars, and homepage support board to `front/styles/pages/home.css`.
- Detail page selectors to `front/styles/pages/detail.css`.
- Create page selectors to `front/styles/pages/create.css`.
- Leaderboard selectors to `front/styles/pages/leaderboard.css`.
- Activity selectors to `front/styles/pages/activity.css`.
- Profile selectors to `front/styles/pages/profile.css`.
- Auth selectors to `front/styles/pages/auth.css`.
- Agent dashboard selectors to `front/styles/pages/agents.css`.
- Space selectors to `front/styles/pages/space.css`, unless they already live in existing space modules.

Do not rename selectors. Do not rewrite values.

- [ ] **Step 4: Add stylesheet links in the same cascade order**

Add these links before the module script in `front/index.html`:

```html
<link rel="stylesheet" href="./styles/base.css">
<link rel="stylesheet" href="./styles/layout.css">
<link rel="stylesheet" href="./styles/pages/home.css">
<link rel="stylesheet" href="./styles/pages/detail.css">
<link rel="stylesheet" href="./styles/pages/create.css">
<link rel="stylesheet" href="./styles/pages/leaderboard.css">
<link rel="stylesheet" href="./styles/pages/activity.css">
<link rel="stylesheet" href="./styles/pages/profile.css">
<link rel="stylesheet" href="./styles/pages/auth.css">
<link rel="stylesheet" href="./styles/pages/agents.css">
<link rel="stylesheet" href="./styles/pages/space.css">
```

Remove only the CSS that was moved from inline `<style>` blocks.

- [ ] **Step 5: Run CSS and frontend checks**

Run:

```powershell
node --test front/css-links.test.mjs
node --test front/*.test.mjs
node front/health-check.mjs
```

Expected: PASS or same pre-existing failures from Task 1.

- [ ] **Step 6: Start a local static server for visual smoke**

Run:

```powershell
py -m http.server 5173 -d front
```

Expected: server starts at `http://127.0.0.1:5173/`. If port `5173` is busy, use `5174`.

- [ ] **Step 7: Browser-smoke the core routes**

Open these routes and compare against the baseline captured before CSS extraction:

```text
http://127.0.0.1:5173/#/home
http://127.0.0.1:5173/#/leaderboard
http://127.0.0.1:5173/#/activity
http://127.0.0.1:5173/#/profile
http://127.0.0.1:5173/#/agents
http://127.0.0.1:5173/#/space
http://127.0.0.1:5173/#/auth
```

Expected: no intentional visible differences, no overlapping UI introduced by CSS extraction, and route navigation still works.

- [ ] **Step 8: Commit CSS extraction**

Run:

```powershell
git add -- front/index.html front/styles front/health-check.mjs front/css-links.test.mjs
git commit -m "refactor: extract static spa styles"
```

Expected: commit contains CSS files, index link changes, and test updates only.

---

## Task 12: Final Cleanup, Verification, And Handoff

**Files:**
- Modify only files already touched by prior tasks if final import cleanup is required.
- Do not move test files out of `front/`.
- Do not restructure Supabase backend files.

- [ ] **Step 1: Search for duplicated local helper definitions**

Run:

```powershell
Select-String -Path front\app.mjs,front\src\**\*.mjs -Pattern 'function escapeHtml|function formatRelativeTime|function navigate|const state =|const els ='
```

Expected: helper definitions exist in their target modules only, with `front/app.mjs` either empty compatibility entry or no duplicate definitions.

- [ ] **Step 2: Search for broken old imports**

Run:

```powershell
Select-String -Path front\*.mjs,front\src\**\*.mjs -Pattern 'from "\./app\.mjs"|from "./support-board-data.mjs"|from "./agent-insights'
```

Expected: no imports from `./app.mjs`. Existing top-level module imports are allowed only where the bridge modules intentionally re-export old files.

- [ ] **Step 3: Run full frontend test suite**

Run:

```powershell
node --test front/*.test.mjs
```

Expected: PASS or same documented pre-existing failures from Task 1. New refactor tests must pass.

- [ ] **Step 4: Run frontend health check**

Run:

```powershell
node front/health-check.mjs
```

Expected: PASS.

- [ ] **Step 5: Run backend-adjacent tests only if backend imports were touched**

If no `supabase/` files were modified, skip this step. If any backend-adjacent imports changed, run:

```powershell
node --test supabase/*.test.mjs supabase/functions/*/*.test.mjs
```

Expected: PASS or same documented pre-existing failures from Task 1.

- [ ] **Step 6: Inspect final diff for accidental behavior changes**

Run:

```powershell
git diff --stat
git diff -- front/index.html front/app.mjs front/src
```

Expected: diff shows moves/extractions/import rewiring. No UI copy rewrites, route rewrites, Supabase table/RPC renames, or schema changes.

- [ ] **Step 7: Final commit if cleanup changed files**

Run only if Step 1 or Step 2 required edits:

```powershell
git add -- front/app.mjs front/src front/*.test.mjs front/health-check.mjs
git commit -m "refactor: finalize static spa module split"
```

Expected: final cleanup commit contains no unrelated files.

---

## Self-Review Notes

- Spec coverage: The plan keeps the app static, keeps tests in `front/*.test.mjs`, preserves Netlify no-build deployment, keeps UI and routes stable, avoids backend restructuring, and organizes frontend behavior into entry/state/router/services/pages/components/features/utils.
- Placeholder scan: No task uses unresolved placeholder markers or unspecified "write tests" language. Each test task includes concrete test code and expected commands.
- Type consistency: Factories consistently use `createX` naming, page modules consistently export `createPage`, and shared helpers use the same names across tests and implementation steps.
