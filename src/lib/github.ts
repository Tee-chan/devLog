const DEFAULT_API_VERSION = "2022-11-28";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

type GithubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      name: string | null;
      date: string;
    } | null;
  };
};

export async function fetchRecentCommits(options: {
  owner: string;
  repo: string;
  perPage?: number;
  since?: string;
}) {
  const { owner, repo, perPage = 30, since } = options;

  const searchParams = new URLSearchParams();
  searchParams.set("per_page", String(perPage));
  if (since) searchParams.set("since", since);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": DEFAULT_API_VERSION,
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?${searchParams.toString()}`,
    { headers }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GitHub API error (${res.status} ${res.statusText}): ${text}`
    );
  }

  const data = (await res.json()) as GithubCommit[];
  return data;
}

