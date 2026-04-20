import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { milestoneUpdateSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  return !!project;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; milestoneId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, milestoneId } = await params;
  if (!(await verifyProjectOwnership(projectId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = milestoneUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.targetDate && typeof data.targetDate === "string") {
    data.targetDate = new Date(data.targetDate as string);
  }

  const existing = await prisma.milestone.findFirst({
    where: { id: milestoneId, projectId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data,
    include: { tasks: { select: { id: true, status: true, title: true } } },
  });

  if (data.completedAt && !existing.completedAt) {
    await logActivity(projectId, "MILESTONE_COMPLETED", `Completed milestone "${updated.title}"`);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; milestoneId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, milestoneId } = await params;
  if (!(await verifyProjectOwnership(projectId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await prisma.milestone.deleteMany({
    where: { id: milestoneId, projectId },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
