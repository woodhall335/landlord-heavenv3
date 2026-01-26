/**
 * GitHub Integration Module
 *
 * Phase 23: Admin Portal Cron Summary + One-Click "Push PR" Workflow
 *
 * Provides GitHub API integration for:
 * - Creating branches
 * - Committing changes
 * - Creating pull requests
 * - Dispatching workflow runs
 * - Reading PR and check status
 */

import { ChangeSeverity } from './legal-change-events';

// ============================================================================
// TYPES
// ============================================================================

/**
 * GitHub configuration.
 */
export interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  baseBranch: string;
}

/**
 * File change to be committed.
 */
export interface FileChange {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
}

/**
 * PR creation request.
 */
export interface CreatePRRequest {
  title: string;
  body: string;
  branchName: string;
  baseBranch?: string;
  files: FileChange[];
  labels?: string[];
  reviewers?: string[];
  teamReviewers?: string[];
  draft?: boolean;
}

/**
 * PR creation result.
 */
export interface CreatePRResult {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  branchName?: string;
  error?: string;
  sha?: string;
}

/**
 * PR status information.
 */
export interface PRStatus {
  number: number;
  state: 'open' | 'closed' | 'merged';
  url: string;
  title: string;
  body: string;
  mergeable: boolean | null;
  mergeableState: string;
  draft: boolean;
  labels: string[];
  reviewers: string[];
  createdAt: string;
  updatedAt: string;
  checks: CheckStatus[];
  overallCheckStatus: 'pending' | 'success' | 'failure' | 'neutral';
}

/**
 * Check status from GitHub Actions or other checks.
 */
export interface CheckStatus {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | null;
  url?: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Workflow dispatch request.
 */
export interface WorkflowDispatchRequest {
  workflowId: string;
  ref: string;
  inputs?: Record<string, string>;
}

/**
 * Workflow dispatch result.
 */
export interface WorkflowDispatchResult {
  success: boolean;
  workflowRunUrl?: string;
  error?: string;
}

/**
 * Branch information.
 */
export interface BranchInfo {
  name: string;
  sha: string;
  protected: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Get GitHub configuration from environment.
 */
export function getGitHubConfig(): GitHubConfig | null {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const baseBranch = process.env.GITHUB_BASE_BRANCH || 'main';

  if (!owner || !repo || !token) {
    console.warn('[GitHub] Missing required environment variables');
    return null;
  }

  return { owner, repo, token, baseBranch };
}

/**
 * Check if GitHub integration is configured.
 */
export function isGitHubConfigured(): boolean {
  return getGitHubConfig() !== null;
}

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Make a GitHub API request.
 */
async function githubRequest<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: Record<string, unknown>;
    token: string;
  }
): Promise<{ success: true; data: T } | { success: false; error: string; status?: number }> {
  const { method = 'GET', body, token } = options;
  const baseUrl = 'https://api.github.com';
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorText;
      } catch {
        errorMessage = errorText;
      }
      return { success: false, error: errorMessage, status: response.status };
    }

    // Some endpoints return 204 with no content
    if (response.status === 204) {
      return { success: true, data: {} as T };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}

// ============================================================================
// BRANCH OPERATIONS
// ============================================================================

/**
 * Get branch information.
 */
export async function getBranch(
  config: GitHubConfig,
  branchName: string
): Promise<BranchInfo | null> {
  const result = await githubRequest<{
    name: string;
    commit: { sha: string };
    protected: boolean;
  }>(`/repos/${config.owner}/${config.repo}/branches/${branchName}`, {
    token: config.token,
  });

  if (!result.success) {
    return null;
  }

  return {
    name: result.data.name,
    sha: result.data.commit.sha,
    protected: result.data.protected,
  };
}

/**
 * Create a new branch from base.
 */
export async function createBranch(
  config: GitHubConfig,
  branchName: string,
  baseBranch?: string
): Promise<{ success: true; sha: string } | { success: false; error: string }> {
  const base = baseBranch || config.baseBranch;

  // Get the SHA of the base branch
  const baseInfo = await getBranch(config, base);
  if (!baseInfo) {
    return { success: false, error: `Base branch '${base}' not found` };
  }

  // Create the new branch reference
  const result = await githubRequest<{ ref: string; object: { sha: string } }>(
    `/repos/${config.owner}/${config.repo}/git/refs`,
    {
      method: 'POST',
      token: config.token,
      body: {
        ref: `refs/heads/${branchName}`,
        sha: baseInfo.sha,
      },
    }
  );

  if (!result.success) {
    // Check if branch already exists
    if (result.status === 422) {
      return { success: false, error: `Branch '${branchName}' already exists` };
    }
    return { success: false, error: result.error };
  }

  return { success: true, sha: result.data.object.sha };
}

/**
 * Delete a branch.
 */
export async function deleteBranch(
  config: GitHubConfig,
  branchName: string
): Promise<{ success: boolean; error?: string }> {
  const result = await githubRequest<Record<string, never>>(
    `/repos/${config.owner}/${config.repo}/git/refs/heads/${branchName}`,
    {
      method: 'DELETE',
      token: config.token,
    }
  );

  return result.success ? { success: true } : { success: false, error: result.error };
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Get file content from repository.
 */
export async function getFileContent(
  config: GitHubConfig,
  path: string,
  ref?: string
): Promise<{ content: string; sha: string } | null> {
  const query = ref ? `?ref=${ref}` : '';
  const result = await githubRequest<{
    content: string;
    sha: string;
    encoding: string;
  }>(`/repos/${config.owner}/${config.repo}/contents/${path}${query}`, {
    token: config.token,
  });

  if (!result.success) {
    return null;
  }

  const content =
    result.data.encoding === 'base64'
      ? Buffer.from(result.data.content, 'base64').toString('utf-8')
      : result.data.content;

  return { content, sha: result.data.sha };
}

/**
 * Create or update a file in the repository.
 */
export async function createOrUpdateFile(
  config: GitHubConfig,
  path: string,
  content: string,
  message: string,
  branch: string,
  existingSha?: string
): Promise<{ success: true; sha: string } | { success: false; error: string }> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
  };

  if (existingSha) {
    body.sha = existingSha;
  }

  const result = await githubRequest<{
    content: { sha: string };
    commit: { sha: string };
  }>(`/repos/${config.owner}/${config.repo}/contents/${path}`, {
    method: 'PUT',
    token: config.token,
    body,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, sha: result.data.commit.sha };
}

/**
 * Commit multiple files at once using Git tree API.
 */
export async function commitMultipleFiles(
  config: GitHubConfig,
  files: FileChange[],
  message: string,
  branch: string
): Promise<{ success: true; sha: string } | { success: false; error: string }> {
  // Get the current branch ref
  const branchInfo = await getBranch(config, branch);
  if (!branchInfo) {
    return { success: false, error: `Branch '${branch}' not found` };
  }

  // Create blobs for each file
  const blobPromises = files.map(async (file) => {
    const content =
      file.encoding === 'base64' ? file.content : Buffer.from(file.content).toString('base64');

    const result = await githubRequest<{ sha: string }>(
      `/repos/${config.owner}/${config.repo}/git/blobs`,
      {
        method: 'POST',
        token: config.token,
        body: {
          content,
          encoding: 'base64',
        },
      }
    );

    if (!result.success) {
      throw new Error(`Failed to create blob for ${file.path}: ${result.error}`);
    }

    return {
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      sha: result.data.sha,
    };
  });

  let treeItems: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string }>;
  try {
    treeItems = await Promise.all(blobPromises);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create blobs' };
  }

  // Create a new tree
  const treeResult = await githubRequest<{ sha: string }>(
    `/repos/${config.owner}/${config.repo}/git/trees`,
    {
      method: 'POST',
      token: config.token,
      body: {
        base_tree: branchInfo.sha,
        tree: treeItems,
      },
    }
  );

  if (!treeResult.success) {
    return { success: false, error: `Failed to create tree: ${treeResult.error}` };
  }

  // Create the commit
  const commitResult = await githubRequest<{ sha: string }>(
    `/repos/${config.owner}/${config.repo}/git/commits`,
    {
      method: 'POST',
      token: config.token,
      body: {
        message,
        tree: treeResult.data.sha,
        parents: [branchInfo.sha],
      },
    }
  );

  if (!commitResult.success) {
    return { success: false, error: `Failed to create commit: ${commitResult.error}` };
  }

  // Update the branch ref
  const refResult = await githubRequest<{ object: { sha: string } }>(
    `/repos/${config.owner}/${config.repo}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      token: config.token,
      body: {
        sha: commitResult.data.sha,
      },
    }
  );

  if (!refResult.success) {
    return { success: false, error: `Failed to update branch ref: ${refResult.error}` };
  }

  return { success: true, sha: commitResult.data.sha };
}

// ============================================================================
// PULL REQUEST OPERATIONS
// ============================================================================

/**
 * Create a pull request with files.
 */
export async function createPullRequest(
  config: GitHubConfig,
  request: CreatePRRequest
): Promise<CreatePRResult> {
  const { title, body, branchName, baseBranch, files, labels, reviewers, teamReviewers, draft } =
    request;

  // Create the branch
  const branchResult = await createBranch(config, branchName, baseBranch);
  if (!branchResult.success) {
    // If branch exists, try to use it
    if (!branchResult.error.includes('already exists')) {
      return { success: false, error: branchResult.error };
    }
  }

  // Commit files
  if (files.length > 0) {
    const commitResult = await commitMultipleFiles(
      config,
      files,
      `${title}\n\nAutomated commit from legal change event.`,
      branchName
    );

    if (!commitResult.success) {
      return { success: false, error: commitResult.error };
    }
  }

  // Create the PR
  const prResult = await githubRequest<{
    number: number;
    html_url: string;
  }>(`/repos/${config.owner}/${config.repo}/pulls`, {
    method: 'POST',
    token: config.token,
    body: {
      title,
      body,
      head: branchName,
      base: baseBranch || config.baseBranch,
      draft: draft ?? false,
    },
  });

  if (!prResult.success) {
    return { success: false, error: prResult.error, branchName };
  }

  const prNumber = prResult.data.number;
  const prUrl = prResult.data.html_url;

  // Add labels if specified
  if (labels && labels.length > 0) {
    await githubRequest<unknown>(
      `/repos/${config.owner}/${config.repo}/issues/${prNumber}/labels`,
      {
        method: 'POST',
        token: config.token,
        body: { labels },
      }
    );
  }

  // Request reviewers if specified
  if ((reviewers && reviewers.length > 0) || (teamReviewers && teamReviewers.length > 0)) {
    await githubRequest<unknown>(
      `/repos/${config.owner}/${config.repo}/pulls/${prNumber}/requested_reviewers`,
      {
        method: 'POST',
        token: config.token,
        body: {
          reviewers: reviewers || [],
          team_reviewers: teamReviewers || [],
        },
      }
    );
  }

  return {
    success: true,
    prUrl,
    prNumber,
    branchName,
    sha: branchResult.success ? branchResult.sha : undefined,
  };
}

/**
 * Get PR status.
 */
export async function getPRStatus(
  config: GitHubConfig,
  prNumber: number
): Promise<PRStatus | null> {
  // Get PR details
  const prResult = await githubRequest<{
    number: number;
    state: 'open' | 'closed';
    merged: boolean;
    html_url: string;
    title: string;
    body: string;
    mergeable: boolean | null;
    mergeable_state: string;
    draft: boolean;
    labels: Array<{ name: string }>;
    requested_reviewers: Array<{ login: string }>;
    created_at: string;
    updated_at: string;
    head: { sha: string };
  }>(`/repos/${config.owner}/${config.repo}/pulls/${prNumber}`, {
    token: config.token,
  });

  if (!prResult.success) {
    return null;
  }

  const pr = prResult.data;

  // Get check runs for the PR's head SHA
  const checksResult = await githubRequest<{
    check_runs: Array<{
      name: string;
      status: 'queued' | 'in_progress' | 'completed';
      conclusion:
        | 'success'
        | 'failure'
        | 'neutral'
        | 'cancelled'
        | 'skipped'
        | 'timed_out'
        | null;
      html_url?: string;
      started_at?: string;
      completed_at?: string;
    }>;
  }>(`/repos/${config.owner}/${config.repo}/commits/${pr.head.sha}/check-runs`, {
    token: config.token,
  });

  const checks: CheckStatus[] = checksResult.success
    ? checksResult.data.check_runs.map((check) => ({
        name: check.name,
        status: check.status,
        conclusion: check.conclusion,
        url: check.html_url,
        startedAt: check.started_at,
        completedAt: check.completed_at,
      }))
    : [];

  // Determine overall check status
  let overallCheckStatus: 'pending' | 'success' | 'failure' | 'neutral' = 'success';
  if (checks.some((c) => c.status !== 'completed')) {
    overallCheckStatus = 'pending';
  } else if (checks.some((c) => c.conclusion === 'failure')) {
    overallCheckStatus = 'failure';
  } else if (checks.every((c) => c.conclusion === 'neutral' || c.conclusion === 'skipped')) {
    overallCheckStatus = 'neutral';
  }

  return {
    number: pr.number,
    state: pr.merged ? 'merged' : pr.state,
    url: pr.html_url,
    title: pr.title,
    body: pr.body || '',
    mergeable: pr.mergeable,
    mergeableState: pr.mergeable_state,
    draft: pr.draft,
    labels: pr.labels.map((l) => l.name),
    reviewers: pr.requested_reviewers.map((r) => r.login),
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    checks,
    overallCheckStatus,
  };
}

/**
 * Update PR description.
 */
export async function updatePRDescription(
  config: GitHubConfig,
  prNumber: number,
  title?: string,
  body?: string
): Promise<{ success: boolean; error?: string }> {
  const updates: Record<string, string> = {};
  if (title) updates.title = title;
  if (body) updates.body = body;

  if (Object.keys(updates).length === 0) {
    return { success: true };
  }

  const result = await githubRequest<unknown>(
    `/repos/${config.owner}/${config.repo}/pulls/${prNumber}`,
    {
      method: 'PATCH',
      token: config.token,
      body: updates,
    }
  );

  return result.success ? { success: true } : { success: false, error: result.error };
}

/**
 * Close a PR.
 */
export async function closePR(
  config: GitHubConfig,
  prNumber: number
): Promise<{ success: boolean; error?: string }> {
  const result = await githubRequest<unknown>(
    `/repos/${config.owner}/${config.repo}/pulls/${prNumber}`,
    {
      method: 'PATCH',
      token: config.token,
      body: { state: 'closed' },
    }
  );

  return result.success ? { success: true } : { success: false, error: result.error };
}

// ============================================================================
// WORKFLOW DISPATCH
// ============================================================================

/**
 * Trigger a workflow run.
 */
export async function dispatchWorkflow(
  config: GitHubConfig,
  request: WorkflowDispatchRequest
): Promise<WorkflowDispatchResult> {
  const result = await githubRequest<Record<string, never>>(
    `/repos/${config.owner}/${config.repo}/actions/workflows/${request.workflowId}/dispatches`,
    {
      method: 'POST',
      token: config.token,
      body: {
        ref: request.ref,
        inputs: request.inputs || {},
      },
    }
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // GitHub doesn't return the workflow run URL directly, but we can construct one
  const workflowRunUrl = `https://github.com/${config.owner}/${config.repo}/actions/workflows/${request.workflowId}`;

  return { success: true, workflowRunUrl };
}

/**
 * Get workflow run status.
 */
export async function getWorkflowRunStatus(
  config: GitHubConfig,
  runId: number
): Promise<{
  id: number;
  status: string;
  conclusion: string | null;
  url: string;
} | null> {
  const result = await githubRequest<{
    id: number;
    status: string;
    conclusion: string | null;
    html_url: string;
  }>(`/repos/${config.owner}/${config.repo}/actions/runs/${runId}`, {
    token: config.token,
  });

  if (!result.success) {
    return null;
  }

  return {
    id: result.data.id,
    status: result.data.status,
    conclusion: result.data.conclusion,
    url: result.data.html_url,
  };
}

// ============================================================================
// BRANCH NAME GENERATION
// ============================================================================

/**
 * Generate a branch name for a legal change event.
 */
export function generateBranchName(eventId: string, title: string): string {
  // Sanitize title for branch name
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);

  const shortEventId = eventId.replace(/^lce_/, '').substring(0, 8);

  return `legal-change/${shortEventId}-${sanitized}`;
}

/**
 * Get the appropriate PR template based on severity.
 */
export function getPRTemplatePath(severity: ChangeSeverity): string {
  const templateMap: Record<ChangeSeverity, string> = {
    emergency: '.github/PULL_REQUEST_TEMPLATE/validation-emergency.md',
    legal_critical: '.github/PULL_REQUEST_TEMPLATE/validation-legal-critical.md',
    behavioral: '.github/PULL_REQUEST_TEMPLATE/validation-behavioral.md',
    clarification: '.github/PULL_REQUEST_TEMPLATE/validation-safe.md',
  };

  return templateMap[severity] || '.github/PULL_REQUEST_TEMPLATE/validation-safe.md';
}

/**
 * Get labels for a legal change PR based on severity.
 */
export function getPRLabels(severity: ChangeSeverity): string[] {
  const baseLabels = ['legal-change', 'automated'];

  const severityLabels: Record<ChangeSeverity, string[]> = {
    emergency: ['priority:critical', 'requires-review', 'emergency'],
    legal_critical: ['priority:high', 'requires-legal-review', 'legal-critical'],
    behavioral: ['priority:medium', 'requires-product-review'],
    clarification: ['priority:low', 'documentation'],
  };

  return [...baseLabels, ...(severityLabels[severity] || [])];
}

/**
 * Get reviewers for a legal change PR based on severity and jurisdictions.
 */
export function getPRReviewers(
  severity: ChangeSeverity,
  jurisdictions: string[]
): { users: string[]; teams: string[] } {
  const teams: string[] = ['validation-team'];

  switch (severity) {
    case 'emergency':
      teams.push('on-call-team', 'engineering-lead');
      break;
    case 'legal_critical':
      teams.push('engineering-team');
      for (const jurisdiction of jurisdictions) {
        if (jurisdiction === 'england') teams.push('legal-team-england');
        if (jurisdiction === 'wales') teams.push('legal-team-wales');
        if (jurisdiction === 'scotland') teams.push('legal-team-scotland');
      }
      break;
    case 'behavioral':
      teams.push('product-team');
      break;
  }

  return { users: [], teams: [...new Set(teams)] };
}
