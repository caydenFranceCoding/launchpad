import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { createGitHubClient, fetchRepoStats, fetchRecentCommits } from "@/lib/github";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true, repoOwner: true, repoName: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!project.repoOwner || !project.repoName) {
    return NextResponse.json({ error: "No repository linked" }, { status: 400 });
  }

  // Rate guard: max once per 5 minutes
  const existing = await prisma.gitHubCache.findUnique({ where: { projectId } });
  if (existing) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (existing.syncedAt > fiveMinAgo) {
      return NextResponse.json(
        { error: "Please wait before syncing again", retryAfter: existing.syncedAt.getTime() + 300000 - Date.now() },
        { status: 429 }
      );
    }
  }

  const octokit = createGitHubClient(session.accessToken);
  const [stats, commits] = await Promise.all([
    fetchRepoStats(octokit, project.repoOwner, project.repoName),
    fetchRecentCommits(octokit, project.repoOwner, project.repoName),
  ]);

  const data = {
    ...stats,
    commitActivity: stats.commitActivity ?? Prisma.JsonNull,
    languages: stats.languages ?? Prisma.JsonNull,
    syncedAt: new Date(),
  };

  const cache = await prisma.gitHubCache.upsert({
    where: { projectId },
    update: data,
    create: { ...data, projectId },
  });

  // Upsert commits
  if (commits.length > 0) {
    await Promise.all(
      commits.map((c) =>
        prisma.gitHubCommit.upsert({
          where: { cacheId_sha: { cacheId: cache.id, sha: c.sha } },
          update: { message: c.message, authorName: c.authorName, authorAvatar: c.authorAvatar, authorLogin: c.authorLogin, additions: c.additions, deletions: c.deletions, filesChanged: c.filesChanged },
          create: { ...c, cacheId: cache.id },
        })
      )
    );
  }

  const result = await prisma.gitHubCache.findUnique({
    where: { projectId },
    include: { commits: { orderBy: { committedAt: "desc" }, take: 50 } },
  });

  return NextResponse.json(result);
}
