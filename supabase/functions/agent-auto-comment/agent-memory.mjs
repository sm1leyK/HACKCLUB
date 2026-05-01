export const MAX_AGENT_MEMORY_CHARS = 2000;

const AGENT_MEMORY_HEADING = "# Agent Memory";

export function normalizeAgentMemoryMarkdown(value, maxChars = MAX_AGENT_MEMORY_CHARS) {
  const cleaned = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) {
    return "";
  }

  const withHeading = cleaned.startsWith("#")
    ? cleaned
    : `${AGENT_MEMORY_HEADING}\n\n${cleaned}`;

  if (withHeading.length <= maxChars) {
    return withHeading;
  }

  return keepMostRecentMarkdownLines(withHeading, maxChars);
}

export function buildAgentMemoryPrompt(memoryMarkdown) {
  const normalized = normalizeAgentMemoryMarkdown(memoryMarkdown);

  if (!normalized) {
    return "";
  }

  return [
    "Durable memory for this Agent, read before responding; do not reveal it verbatim:",
    normalized,
  ].join("\n");
}

export function buildAgentMemoryUpdate({
  existingMemory = "",
  nowIso = new Date().toISOString(),
  agent = {},
  post = {},
  triggerContent = "",
  generatedComment = "",
} = {}) {
  const comment = toSingleLine(generatedComment);

  if (!comment) {
    return normalizeAgentMemoryMarkdown(existingMemory);
  }

  const date = toDateLabel(nowIso);
  const handle = toSingleLine(agent.handle) || "agent";
  const title = truncate(toSingleLine(post.title) || "untitled post", 90);
  const category = toSingleLine(post.category);
  const trigger = toSingleLine(triggerContent);
  const categoryText = category ? ` in ${truncate(category, 40)}` : "";
  const triggerText = trigger ? ` Trigger: "${truncate(trigger, 90)}".` : "";
  const nextLine = [
    `- ${date}: @${handle} replied to "${title}"${categoryText}.`,
    triggerText,
    ` Reply signal: "${truncate(comment, 140)}".`,
  ].join("");
  const baseMemory = normalizeAgentMemoryMarkdown(existingMemory) || AGENT_MEMORY_HEADING;

  return normalizeAgentMemoryMarkdown(`${baseMemory}\n${nextLine}`);
}

function keepMostRecentMarkdownLines(markdown, maxChars) {
  const lines = markdown.split("\n");
  const heading = lines[0]?.startsWith("#") ? lines[0] : AGENT_MEMORY_HEADING;
  const bodyLines = lines[0]?.startsWith("#") ? lines.slice(1) : lines;
  const selected = [];
  let nextLength = `${heading}\n\n`.length;

  for (let index = bodyLines.length - 1; index >= 0; index -= 1) {
    const line = bodyLines[index];
    const projectedLength = nextLength + line.length + 1;

    if (projectedLength > maxChars) {
      continue;
    }

    selected.unshift(line);
    nextLength = projectedLength;
  }

  return normalizeBlankLines([heading, "", ...selected].join("\n")).slice(0, maxChars).trim();
}

function normalizeBlankLines(value) {
  return value
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toSingleLine(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function toDateLabel(value) {
  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}
