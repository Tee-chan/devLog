const DEFAULT_API_VERSION = "2022-11-28";

export type GithubCommit = {
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

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  updated_at: string;
};

export async function fetchUserRepos(token: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": DEFAULT_API_VERSION,
    Authorization: `Bearer ${token}`,
  };

  const res = await fetch(
    `https://api.github.com/user/repos?sort=updated&per_page=10`,
    { headers }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GitHub API error (${res.status} ${res.statusText}): ${text}`
    );
  }

  const data = (await res.json()) as GithubRepo[];
  return data;
}

export async function fetchRecentCommits(options: {
  owner: string;
  repo: string;
  token: string;
  perPage?: number;
  since?: string;
  branch?: string;
}) {
  const { owner, repo, token, perPage = 30, since, branch } = options;

  const searchParams = new URLSearchParams();
  searchParams.set("per_page", String(perPage));
  if (since) searchParams.set("since", since);
  if (branch) searchParams.set("sha", branch);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": DEFAULT_API_VERSION,
    Authorization: `Bearer ${token}`,
  };

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

