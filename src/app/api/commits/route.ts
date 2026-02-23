import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchRecentCommits } from "@/lib/github";
import { summarizeCommits } from "@/lib/llm/ollama";

const DEFAULT_OWNER = process.env.DEFAULT_REPO_OWNER;
const DEFAULT_REPO = process.env.DEFAULT_REPO_NAME;

export async function POST() {
  try {
    if (!DEFAULT_OWNER || !DEFAULT_REPO) {
      return NextResponse.json(
        {
          error:
            "DEFAULT_REPO_OWNER and DEFAULT_REPO_NAME must be set in .env.local",
        },
        { status: 400 }
      );
    }

    const repoFullName = `${DEFAULT_OWNER}/${DEFAULT_REPO}`;

    const repo = await (prisma as any).repo.upsert({
      where: { fullName: repoFullName },
      create: {
        owner: DEFAULT_OWNER,
        name: DEFAULT_REPO,
        fullName: repoFullName,
        url: `https://github.com/${repoFullName}`,
      },
      update: {},
    });

    const existingLatest = await (prisma as any).commit.findFirst({
      where: { repoId: repo.id },
      orderBy: { authoredAt: "desc" },
    });

    const commits = await fetchRecentCommits({
      owner: DEFAULT_OWNER,
      repo: DEFAULT_REPO,
      perPage: 50,
      since: existingLatest?.authoredAt.toISOString(),
    });

    if (!commits.length) {
      return NextResponse.json({ updated: 0 });
    }

    const created = await prisma.$transaction(
      commits.map((c: any) =>
        (prisma as any).commit.upsert({
          where: { sha: c.sha },
          create: {
            sha: c.sha,
            message: c.commit.message,
            authorName: c.commit.author?.name ?? null,
            authoredAt: new Date(c.commit.author?.date ?? new Date().toISOString()),
            committedAt: null,
            url: c.html_url,
            repoId: repo.id,
          },
          update: {},
        })
      )
    );

    const summary = await summarizeCommits(
      created.map((c: any) => ({ sha: c.sha, message: c.message }))
    );

    if (summary) {
      await (prisma as any).commit.updateMany({
        where: { id: { in: created.map((c: any) => c.id) } },
        data: { summary },
      });
    }

    return NextResponse.json({
      updated: created.length,
      summarized: Boolean(summary),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to sync commits" },
      { status: 500 }
    );
  }
}

