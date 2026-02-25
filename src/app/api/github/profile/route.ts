import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const GITHUB_API = "https://api.github.com";

export async function GET() {
  const session = await auth();
  const token = session?.accessToken;

  if (!token) {
    return NextResponse.json(
      { error: "Not signed in or no GitHub access token" },
      { status: 401 }
    );
  }

  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `GitHub API error: ${res.status}`, details: text },
      { status: res.status }
    );
  }

  const profile = await res.json();
  return NextResponse.json(profile);
}
