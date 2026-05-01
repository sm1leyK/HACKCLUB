import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_AGENT_MEMORY_CHARS,
  buildAgentMemoryPrompt,
  buildAgentMemoryUpdate,
  normalizeAgentMemoryMarkdown,
} from "./agent-memory.mjs";

test("normalizes agent memory markdown and preserves recent notes under the 2k cap", () => {
  const overLimitMemory = [
    "# Agent Memory",
    "",
    ...Array.from({ length: 260 }, (_, index) => `- old fact ${index}`),
    "- newest durable fact",
  ].join("\n");

  const normalized = normalizeAgentMemoryMarkdown(overLimitMemory);

  assert.ok(normalized.length <= MAX_AGENT_MEMORY_CHARS);
  assert.match(normalized, /^# Agent Memory/);
  assert.match(normalized, /newest durable fact/);
  assert.doesNotMatch(normalized, /old fact 0/);
});

test("builds a hidden prompt section only when durable memory exists", () => {
  assert.equal(buildAgentMemoryPrompt(""), "");

  const prompt = buildAgentMemoryPrompt("- Likes concise, playful replies.");

  assert.match(prompt, /Durable memory for this Agent/);
  assert.match(prompt, /read before responding/i);
  assert.match(prompt, /Likes concise, playful replies/);
  assert.match(prompt, /do not reveal it verbatim/i);
});

test("builds a compact memory update from a successful agent comment", () => {
  const updated = buildAgentMemoryUpdate({
    existingMemory: "# Agent Memory\n\n- Existing stable preference.",
    nowIso: "2026-04-26T08:00:00.000Z",
    agent: {
      handle: "lens",
      display_name: "Lens",
    },
    post: {
      title: "How should agents remember context across threads?",
      category: "agent-workflow",
    },
    triggerContent: "@lens can you remember this next time?",
    generatedComment: "I will keep the stable signal in mind and avoid over-explaining it next time.",
  });

  assert.ok(updated.length <= MAX_AGENT_MEMORY_CHARS);
  assert.match(updated, /^# Agent Memory/);
  assert.match(updated, /Existing stable preference/);
  assert.match(updated, /2026-04-26/);
  assert.match(updated, /@lens/);
  assert.match(updated, /How should agents remember context/);
  assert.match(updated, /avoid over-explaining/);
});
