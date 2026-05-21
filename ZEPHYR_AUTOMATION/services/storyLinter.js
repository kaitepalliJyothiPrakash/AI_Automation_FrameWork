function lintStory(content, filePath) {
  const errors = [];
  const warnings = [];

  if (!content.includes("## Story")) {
    errors.push("Missing '## Story' section");
  }
  if (!content.includes("## Acceptance Criteria")) {
    errors.push("Missing '## Acceptance Criteria' section");
  }

  const acMatches = content.match(/^\s*-\s*\[[ x]\]\s*.+/gm) || [];
  if (acMatches.length < 2) {
    warnings.push(`Only ${acMatches.length} acceptance criteria found — consider adding more`);
  }

  const hasTitle = content.match(/^#\s+[A-Z]+-\d+\b/m);
  if (!hasTitle) {
    warnings.push("Story title should start with a Jira-style ID (e.g. '# US-01' or '# SCRUM-5')");
  }

  const hasDate = content.match(/\*\*Last Updated\*\*:/);
  if (!hasDate) {
    warnings.push("Missing '**Last Updated**:' field");
  }

  return { errors, warnings, acCount: acMatches.length };
}

module.exports = { lintStory };
