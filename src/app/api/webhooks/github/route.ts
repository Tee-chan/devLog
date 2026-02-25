import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchRecentCommits } from "@/lib/github";
import { summarizeCommits } from "@/lib/llm/ollama";

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        const eventType = req.headers.get("x-github-event");
        if (eventType !== "push") {
            return NextResponse.json({ message: "Ignored non-push event." });
        }

        const repoFullName = payload?.repository?.full_name;
        const ref = payload?.ref;

        if (!repoFullName) {
            return NextResponse.json({ error: "Missing repository info" }, { status: 400 });
        }

        let branch = "main";
        if (ref && ref.startsWith("refs/heads/")) {
            branch = ref.replace("refs/heads/", "");
        }
        const repo = await (prisma as any).repo.findUnique({
            where: { fullName: repoFullName },
        });

        if (!repo || !repo.userId) {
            return NextResponse.json({ error: "Repository not tracked" }, { status: 404 });
        }

        const account = await (prisma as any).account.findFirst({
            where: { userId: repo.userId, provider: "github" },
        });

        if (!account || !account.access_token) {
            return NextResponse.json({ error: "GitHub account token missing for user" }, { status: 403 });
        }

        const githubToken = account.access_token;
        const [owner, repoName] = repoFullName.split("/");

        const existingLatest = await (prisma as any).commit.findFirst({
            where: { repoId: repo.id },
            orderBy: { authoredAt: "desc" },
        });
        const commits = await fetchRecentCommits({
            owner,
            repo: repoName,
            token: githubToken,
            perPage: 30,
            since: existingLatest?.authoredAt.toISOString(),
            branch,
        });

        if (!commits.length) {
            return NextResponse.json({ message: "No new commits to sync." });
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
                        userId: repo.userId,
                    },
                    update: {},
                })
            )
        );

        const userSettings = await (prisma as any).userSettings.findUnique({
            where: { userId: repo.userId },
        });

        const commitsToSummarize = created.map((c: any) => ({
            sha: c.sha,
            message: c.message,
        }));

        let summary = "";
        if (commitsToSummarize.length > 0) {
            if (userSettings?.llmProvider === "openai" && userSettings?.llmApiKey) {
                const { summarizeWithOpenAI } = await import("@/lib/llm/openai");
                summary = await summarizeWithOpenAI(commitsToSummarize, {
                    apiKey: userSettings.llmApiKey,
                    baseUrl: userSettings.llmBaseUrl,
                    model: userSettings.llmModel
                });
            } else {
                summary = await summarizeCommits(
                    commitsToSummarize,
                    userSettings || undefined
                );
            }
        }

        if (summary) {
            await (prisma as any).commit.updateMany({
                where: { id: { in: created.map((c: any) => c.id) } },
                data: { summary },
            });
        }

        return NextResponse.json({
            message: "Webhook processed successfully",
            synced: created.length,
        });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed", details: String(error) },
            { status: 500 }
        );
    }
}
