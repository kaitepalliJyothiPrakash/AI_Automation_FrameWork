require("dotenv").config();

const ZEPHYR_BASE_URL = "https://eu.api.zephyrscale.smartbear.com/v2";

function getZephyrConfig() {
  const { ZEPHYR_API_TOKEN, ZEPHYR_PROJECT_KEY } = process.env;
  if (!ZEPHYR_API_TOKEN || !ZEPHYR_PROJECT_KEY) {
    throw new Error(
      "Missing Zephyr Scale credentials. Add ZEPHYR_API_TOKEN and ZEPHYR_PROJECT_KEY to your .env file."
    );
  }
  return { ZEPHYR_API_TOKEN, ZEPHYR_PROJECT_KEY };
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function fetchWithTimeout(url, options, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .catch((err) => {
      if (err.name === "AbortError") throw new Error(`Zephyr API request timed out after ${timeoutMs / 1000}s`);
      throw err;
    })
    .finally(() => clearTimeout(timer));
}

function mapPriority(p) {
  // Zephyr default priority names: High, Normal, Low
  if (!p) return "Normal";
  const v = p.toLowerCase();
  if (v === "high") return "High";
  if (v === "low") return "Low";
  return "Normal";
}

function buildObjective(tc) {
  const parts = [];
  if (tc.type) parts.push(`Type: ${tc.type}`);
  if (tc.expected_result) parts.push(`Expected: ${tc.expected_result}`);
  if (tc.input_data) parts.push(`Input Data: ${tc.input_data}`);
  return parts.join("\n");
}

async function createTestCase(tc, storyId) {
  const { ZEPHYR_API_TOKEN, ZEPHYR_PROJECT_KEY } = getZephyrConfig();

  const payload = {
    projectKey: ZEPHYR_PROJECT_KEY,
    name: `[${storyId}] ${tc.title}`,
    objective: buildObjective(tc),
    priorityName: mapPriority(tc.priority),
    statusName: "Draft",
  };

  const response = await fetchWithTimeout(`${ZEPHYR_BASE_URL}/testcases`, {
    method: "POST",
    headers: authHeaders(ZEPHYR_API_TOKEN),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zephyr createTestCase failed (${response.status}): ${body}`);
  }

  return response.json(); // { id, key, self }
}

async function addTestSteps(testCaseKey, tc) {
  const steps = Array.isArray(tc.steps) ? tc.steps : (tc.steps ? [tc.steps] : []);
  if (steps.length === 0) return;

  const { ZEPHYR_API_TOKEN } = getZephyrConfig();

  const payload = {
    mode: "OVERWRITE",
    items: steps.map((s, i) => ({
      inline: {
        description: typeof s === "string" ? s : (s.action || JSON.stringify(s)),
        expectedResult: i === steps.length - 1 ? (tc.expected_result || "") : "",
        testData: i === 0 ? (tc.input_data || "") : "",
      },
    })),
  };

  const response = await fetchWithTimeout(
    `${ZEPHYR_BASE_URL}/testcases/${testCaseKey}/teststeps`,
    {
      method: "POST",
      headers: authHeaders(ZEPHYR_API_TOKEN),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zephyr addTestSteps failed for ${testCaseKey} (${response.status}): ${body}`);
  }
}

async function linkToJiraIssue(testCaseKey, jiraIssueKey) {
  const { ZEPHYR_API_TOKEN, ZEPHYR_PROJECT_KEY } = getZephyrConfig();

  // Zephyr requires the numeric Jira issue ID, not the key.
  const jiraIssueId = await fetchJiraIssueId(jiraIssueKey);

  const response = await fetchWithTimeout(
    `${ZEPHYR_BASE_URL}/testcases/${testCaseKey}/links/issues`,
    {
      method: "POST",
      headers: authHeaders(ZEPHYR_API_TOKEN),
      body: JSON.stringify({ issueId: jiraIssueId }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Zephyr linkToJiraIssue failed for ${testCaseKey} → ${jiraIssueKey} (${response.status}): ${body}`);
  }
}

async function fetchJiraIssueId(issueKey) {
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
  const token = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}?fields=summary`;

  const response = await fetchWithTimeout(url, {
    headers: {
      Authorization: `Basic ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Could not resolve Jira issue ID for ${issueKey}: ${body}`);
  }

  const data = await response.json();
  return Number(data.id);
}

async function pushTestCases(testCases, storyId, { linkToJira = true } = {}) {
  const results = { created: [], failed: [] };

  for (const tc of testCases) {
    try {
      const created = await createTestCase(tc, storyId);
      console.log(`Created test case ${created.key} for "${tc.title}"`);
      await addTestSteps(created.key, tc);

      if (linkToJira) {
        try {
          await linkToJiraIssue(created.key, storyId);
        } catch (err) {
          results.failed.push({ tcId: tc.id, key: created.key, error: `link: ${err.message}` });
        }
      }

      results.created.push({ tcId: tc.id, key: created.key });
    } catch (err) {
      results.failed.push({ tcId: tc.id, error: err.message });
    }
  }

  return results;
}

module.exports = { pushTestCases, createTestCase, addTestSteps, linkToJiraIssue };
