function validateTestCases(data) {
  if (!data.feature || !Array.isArray(data.test_cases)) {
    throw new Error("Invalid structure: missing 'feature' or 'test_cases'");
  }

  data.test_cases.forEach((tc, index) => {
    if (!tc.id) {
      throw new Error(`Missing 'id' (Test Id) at index ${index}`);
    }
    if (!tc.title) {
      throw new Error(`Missing 'title' (Test Scenario) at index ${index}`);
    }
    if (!Array.isArray(tc.steps) || tc.steps.length === 0) {
      throw new Error(`Missing or empty 'steps' at index ${index}`);
    }
    if (!tc.expected_result) {
      throw new Error(
        `Missing 'expected_result' (Expected Result) at index ${index}`,
      );
    }
    // input_data is optional — allow empty string but ensure field exists
    if (tc.input_data === undefined) {
      tc.input_data = "";
    }
    const validPriorities = ["High", "Medium", "Low"];
    if (!tc.priority || !validPriorities.includes(tc.priority)) {
      throw new Error(
        `Invalid or missing 'priority' at index ${index}. Must be one of: ${validPriorities.join(", ")}`,
      );
    }
    const validTypes = ["Positive", "Negative", "Edge"];
    if (!tc.type || !validTypes.includes(tc.type)) {
      throw new Error(
        `Invalid or missing 'type' (scenario type) at index ${index}. Must be one of: ${validTypes.join(", ")}`,
      );
    }
  });

  return true;
}

module.exports = {
  validateTestCases,
};
