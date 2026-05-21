function extractTypeScript(text) {
  const fenceMatch = text.match(/```(?:typescript|ts)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return text.trim();
}

module.exports = { extractTypeScript };
