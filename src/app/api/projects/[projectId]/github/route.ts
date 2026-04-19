import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true, repoOwner: true, repoName: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cache = await prisma.gitHubCache.findUnique({ where: { projectId } });
  return NextResponse.json(cache);
}
