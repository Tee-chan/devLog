import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchRecentCommits } from "@/lib/github";
import { summarizeCommits } from "@/lib/llm/ollama";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.accessToken || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { owner, repo: repoName, branch } = await req.json();

    if (!owner || !repoName) {
      return NextResponse.json(
        { error: "owner and repo are required" },
        { status: 400 }
      );
    }

    const repoFullName = `${owner}/${repoName}`;

    const repo = await (prisma as any).repo.upsert({
      where: { fullName: repoFullName },
      create: {
        owner,
        name: repoName,
        fullName: repoFullName,
        url: `https://github.com/${repoFullName}`,
        userId: session.user.id,
      },
      update: {},
    });

    const existingLatest = await (prisma as any).commit.findFirst({
      where: { repoId: repo.id },
      orderBy: { authoredAt: "desc" },
    });

    const commits = await fetchRecentCommits({
      owner,
      repo: repoName,
      token: session.accessToken,
      perPage: 50,
      since: existingLatest?.authoredAt.toISOString(),
      branch,
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
            userId: session.user.id,
          },
          update: {},
        })
      )
    );

    const userSettings = await (prisma as any).userSettings.findUnique({
      where: { userId: session.user.id },
    });

    const commitsToSummarize = created.map((c: any) => ({
      sha: c.sha,
      message: c.message,
    }));

    let summary = "";
    if (commitsToSummarize.length > 0) {
      console.log(`[Sync] Attempting to summarize ${commitsToSummarize.length} commits...`);
      console.log(`[Sync] Provider Settings:`, {
        provider: userSettings?.llmProvider,
        baseUrl: userSettings?.llmBaseUrl,
        model: userSettings?.llmModel,
        hasApiKey: !!userSettings?.llmApiKey,
      });

      if (userSettings?.llmProvider === "openai" && userSettings?.llmApiKey) {
        const { summarizeWithOpenAI } = await import("@/lib/llm/openai");
        summary = await summarizeWithOpenAI(commitsToSummarize, {
          apiKey: userSettings.llmApiKey,
          baseUrl: userSettings.llmBaseUrl,
          model: userSettings.llmModel
        });
        console.log(`[Sync] OpenAI Summarization Response length: ${summary.length || "Empty"}`);
      } else {
        summary = await summarizeCommits(
          commitsToSummarize,
          userSettings || undefined
        );
        console.log(`[Sync] Ollama Summarization Response length: ${summary.length || "Empty"}`);
      }
    }

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

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");
    const range = searchParams.get("range") || "all";

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "owner and repo are required" },
        { status: 400 }
      );
    }

    const repoFullName = `${owner}/${repo}`;

    const dbRepo = await (prisma as any).repo.findUnique({
      where: { fullName: repoFullName },
    });

    if (!dbRepo) {
      return NextResponse.json({ commits: [], stats: null });
    }

    let dateFilter = {};
    if (range !== "all") {
      const now = new Date();
      if (range === "1d") now.setDate(now.getDate() - 1);
      else if (range === "7d") now.setDate(now.getDate() - 7);
      else if (range === "30d") now.setDate(now.getDate() - 30);

      dateFilter = {
        authoredAt: { gte: now }
      };
    }

    const commits = await (prisma as any).commit.findMany({
      where: {
        repoId: dbRepo.id,
        userId: session.user.id,
        ...dateFilter
      },
      orderBy: { authoredAt: "desc" },
    });

    const stats = {
      totalCommits: commits.length,
      authors: new Set(commits.map((c: any) => c.authorName)).size,
      lastCommit: commits.length > 0 ? commits[0].authoredAt : null,
    };

    return NextResponse.json({ commits, stats });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch commits" },
      { status: 500 }
    );
  }
}
