import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await (prisma as any).userSettings.findUnique({
            where: { userId: session.user.id },
        });

        return NextResponse.json(settings || {});
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { llmBaseUrl, llmModel, llmApiKey, llmProvider } = body;

        const settings = await (prisma as any).userSettings.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                llmBaseUrl,
                llmModel,
                llmApiKey,
                llmProvider,
            },
            update: {
                llmBaseUrl,
                llmModel,
                llmApiKey,
                llmProvider,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to save settings" },
            { status: 500 }
        );
    }
}
