import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectUpdateSchema } from "@/lib/validators";
import { parseGitHubUrl } from "@/lib/github";
import { logActivity } from "@/lib/activity";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
      metrics: { include: { datapoints: { orderBy: { date: "desc" }, take: 30 } } },
      githubCache: true,
    },
  });

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const body = await req.json();
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data } as Record<string, unknown>;

  if (typeof data.repoUrl === "string" && data.repoUrl) {
    const gh = parseGitHubUrl(data.repoUrl as string);
    if (gh) {
      data.repoOwner = gh.owner;
      data.repoName = gh.repo;
    }
  }

  if (data.status === "SHIPPED" && !data.shippedAt) {
    data.shippedAt = new Date();
  }
  if (data.status === "IN_PROGRESS" && !data.startedAt) {
    data.startedAt = new Date();
  }

  const existing = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.project.update({
    where: { id: projectId },
    data,
  });

  if (data.status && data.status !== existing.status) {
    const statusLabels: Record<string, string> = {
      IDEA: "Idea", PLANNING: "Planning", IN_PROGRESS: "In Progress",
      PAUSED: "Paused", SHIPPED: "Shipped", ARCHIVED: "Archived",
    };
    await logActivity(projectId, "PROJECT_STATUS_CHANGED",
      `Status changed to ${statusLabels[data.status as string] ?? data.status}`,
      { from: existing.status, to: data.status }
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const result = await prisma.project.deleteMany({
    where: { id: projectId, userId: session.user.id },
  });

  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
