// Converts Jira's Atlassian Document Format (ADF) node tree to plain text
function adfToText(node) {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  if (node.type === "hardBreak") return "\n";
  if (node.type === "mention") return node.attrs?.text || "";
  if (!node.content || !Array.isArray(node.content)) return "";

  switch (node.type) {
    case "paragraph":
      return node.content.map(adfToText).join("") + "\n";
    case "heading":
      return node.content.map(adfToText).join("") + "\n";
    case "bulletList":
    case "orderedList":
      return node.content.map(adfToText).join("");
    case "listItem":
      return "- " + node.content.map(adfToText).join("").trim() + "\n";
    case "blockquote":
    case "panel":
    case "doc":
      return node.content.map(adfToText).join("");
    default:
      return node.content.map(adfToText).join("");
  }
}

// Strategy 1: ACs as a proper ADF bullet/ordered list under an AC heading
function extractFromAdfList(descNode) {
  if (!descNode || !Array.isArray(descNode.content)) return [];

  const criteria = [];
  let inAcSection = false;

  for (const block of descNode.content) {
    const blockText = adfToText(block).toLowerCase().trim();

    if (block.type === "heading" || block.type === "paragraph") {
      if (blockText.includes("acceptance criteria") || blockText.includes("acceptance criterion")) {
        inAcSection = true;
        continue;
      }
      if (inAcSection && block.type === "heading") break; // next heading = end of AC section
    }

    if (inAcSection && (block.type === "bulletList" || block.type === "orderedList")) {
      for (const item of block.content || []) {
        const text = adfToText(item).trim().replace(/^-\s*/, "");
        if (text) criteria.push(text);
      }
      break;
    }
  }

  return criteria;
}

// Strategy 2: ACs embedded as plain text in a paragraph (e.g. "AC1: ...AC2: ...AC3: ...")
function extractFromPlainText(descNode) {
  if (!descNode || !Array.isArray(descNode.content)) return [];

  const fullText = adfToText(descNode);

  // Find the acceptance criteria section in the plain text
  const acSectionMatch = fullText.match(
    /acceptance criteri[ao][^]*?(?=\n[A-Z][a-z]|\nOther information|\nStatus:|$)/i
  );
  if (!acSectionMatch) return [];

  const acBlock = acSectionMatch[0];

  // Split on AC label pattern: AC1:, AC2:, 1., 2., etc.
  const byLabel = acBlock.match(/AC\d+\s*:\s*[^A-Z\n][^]*?(?=AC\d+\s*:|$)/gi);
  if (byLabel && byLabel.length > 0) {
    return byLabel
      .map((s) => s.replace(/^AC\d+\s*:\s*/i, "").trim())
      .filter(Boolean);
  }

  // Fallback: split on numbered list pattern "1. ... 2. ..."
  const byNumber = acBlock.match(/\d+\.\s+[^\d][^]*/g);
  if (byNumber && byNumber.length > 0) {
    return byNumber
      .map((s) => s.replace(/^\d+\.\s+/, "").trim())
      .filter(Boolean);
  }

  return [];
}

function extractAcceptanceCriteria(descNode) {
  // Try structured ADF list first, fall back to plain text parsing
  const fromList = extractFromAdfList(descNode);
  if (fromList.length > 0) return fromList;

  return extractFromPlainText(descNode);
}

function issueToMarkdown(issue) {
  const { key, fields } = issue;
  const summary = fields.summary || "Untitled Story";
  const priority = fields.priority?.name || "Medium";
  const assignee = fields.assignee?.displayName || "Unassigned";
  const today = new Date().toISOString().split("T")[0];

  const desc = fields.description;
  let storyText = "";
  let acceptanceCriteria = [];

  if (desc) {
    storyText = adfToText(desc).trim();
    acceptanceCriteria = extractAcceptanceCriteria(desc);
  }

  if (acceptanceCriteria.length === 0) {
    acceptanceCriteria = ["[No acceptance criteria found — add them here]"];
  }

  const acLines = acceptanceCriteria
    .map((ac, i) => `- [ ] AC${i + 1}: ${ac}`)
    .join("\n");

  return `# ${key}: ${summary}

**Status**: ${fields.status?.name || "To Do"}
**Priority**: ${priority}
**Assigned**: ${assignee}
**Jira Key**: ${key}
**Last Updated**: ${today}

---

## Story

${storyText || `**As a** user\n**I want to** ${summary}\n**So that** I can complete my tasks.`}

---

## Acceptance Criteria

${acLines}

---

**Fetched from Jira: ${key}**
`;
}

module.exports = { issueToMarkdown };
