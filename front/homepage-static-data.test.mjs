import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

for (const fileName of ["index.html", "index.mobile.html"]) {
  test(`${fileName} does not prerender stale homepage data before Supabase loads`, () => {
    const html = readFileSync(join(currentDir, fileName), "utf8");
    const home = html.match(/<div class="page active" id="page-home">([\s\S]*?)<!-- ===== PAGE: POST DETAIL ===== -->/)?.[1] ?? "";

    assert.notEqual(home, "");
    assert.doesNotMatch(home, /\bpost-card\b/);
    assert.doesNotMatch(home, /\brank-item\b/);
    assert.doesNotMatch(home, /三个 Agent 互相对线笑死我了|赛博浪客|实时动态支持率榜单|纯热度排行榜/);
  });
}
