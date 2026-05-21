require("dotenv").config();

function getJiraConfig() {
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    throw new Error(
      "Missing Jira credentials. Add JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN to your .env file."
    );
  }
  return { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN };
}

function authHeaders(JIRA_EMAIL, JIRA_API_TOKEN) {
  const token = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function fetchWithTimeout(url, options, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .catch((err) => {
      if (err.name === "AbortError") throw new Error(`Jira API request timed out after ${timeoutMs / 1000}s`);
      throw err;
    })
    .finally(() => clearTimeout(timer));
}

async function fetchIssue(issueKey) {
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = getJiraConfig();
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`;

  const response = await fetchWithTimeout(url, {
    headers: authHeaders(JIRA_EMAIL, JIRA_API_TOKEN),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Jira API responded with ${response.status} for issue ${issueKey}: ${body}`);
  }

  return response.json();
}

async function getTransitions(issueKey) {
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = getJiraConfig();
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`;

  const response = await fetchWithTimeout(url, {
    headers: authHeaders(JIRA_EMAIL, JIRA_API_TOKEN),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch transitions for ${issueKey}: ${body}`);
  }

  const data = await response.json();
  return data.transitions;
}

async function transitionIssue(issueKey, targetStatusName = "Done") {
  const transitions = await getTransitions(issueKey);

  const match = transitions.find(
    (t) => t.name.toLowerCase() === targetStatusName.toLowerCase()
  );

  if (!match) {
    const available = transitions.map((t) => t.name).join(", ");
    throw new Error(
      `Transition "${targetStatusName}" not found for ${issueKey}. Available: ${available}`
    );
  }

  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = getJiraConfig();
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/transitions`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: authHeaders(JIRA_EMAIL, JIRA_API_TOKEN),
    body: JSON.stringify({ transition: { id: match.id } }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to transition ${issueKey} to "${targetStatusName}": ${body}`);
  }

  return match.name;
}

module.exports = { fetchIssue, getTransitions, transitionIssue };
