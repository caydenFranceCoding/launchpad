import { Octokit } from "@octokit/rest";

export function createGitHubClient(accessToken: string) {
  return new Octokit({ auth: accessToken });
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export async function fetchRepoStats(octokit: Octokit, owner: string, repo: string) {
  const [repoData, commitActivity, languages] = await Promise.allSettled([
    octokit.repos.get({ owner, repo }),
    octokit.repos.getCommitActivityStats({ owner, repo }),
    octokit.repos.listLanguages({ owner, repo }),
  ]);

  const repoInfo = repoData.status === "fulfilled" ? repoData.value.data : null;
  const activity = commitActivity.status === "fulfilled" ? commitActivity.value.data : null;
  const langs = languages.status === "fulfilled" ? languages.value.data : null;

  // Use search API for accurate issue/PR counts
  const [openIssues, closedIssues, openPRs, mergedPRs] = await Promise.allSettled([
    octokit.search.issuesAndPullRequests({ q: `repo:${owner}/${repo} type:issue is:open` }),
    octokit.search.issuesAndPullRequests({ q: `repo:${owner}/${repo} type:issue is:closed` }),
    octokit.search.issuesAndPullRequests({ q: `repo:${owner}/${repo} type:pr is:open` }),
    octokit.search.issuesAndPullRequests({ q: `repo:${owner}/${repo} type:pr is:merged` }),
  ]);

  // Get last 12 weeks of commit activity
  const recentActivity = Array.isArray(activity)
    ? activity.slice(-12).map((week: { week: number; total: number }) => ({
        week: new Date(week.week * 1000).toISOString().split("T")[0],
        count: week.total,
      }))
    : null;

  return {
    stars: repoInfo?.stargazers_count ?? 0,
    forks: repoInfo?.forks_count ?? 0,
    commitCount: Array.isArray(activity)
      ? activity.reduce((sum: number, w: { total: number }) => sum + w.total, 0)
      : 0,
    openIssues: openIssues.status === "fulfilled" ? openIssues.value.data.total_count : 0,
    closedIssues: closedIssues.status === "fulfilled" ? closedIssues.value.data.total_count : 0,
    openPRs: openPRs.status === "fulfilled" ? openPRs.value.data.total_count : 0,
    mergedPRs: mergedPRs.status === "fulfilled" ? mergedPRs.value.data.total_count : 0,
    lastCommitAt: repoInfo?.pushed_at ? new Date(repoInfo.pushed_at) : null,
    commitActivity: recentActivity,
    languages: langs,
  };
}
