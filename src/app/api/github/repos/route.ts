import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createGitHubClient } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const octokit = createGitHubClient(session.accessToken);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  });

  const repos = data.map((r) => ({
    fullName: r.full_name,
    name: r.name,
    owner: r.owner.login,
    url: r.html_url,
    homepage: r.homepage || null,
    description: r.description,
    private: r.private,
    updatedAt: r.updated_at,
  }));

  return NextResponse.json(repos);
}
