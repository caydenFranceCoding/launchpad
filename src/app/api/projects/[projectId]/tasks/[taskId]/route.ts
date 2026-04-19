import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskUpdateSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  return !!project;
}

async function updateProjectProgress(projectId: string) {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    select: { status: true },
  });
  if (tasks.length === 0) return;

  const done = tasks.filter((t) => t.status === "DONE").length;
  const progress = Math.round((done / tasks.length) * 100);
  await prisma.project.update({ where: { id: projectId }, data: { progress } });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, taskId } = await params;
  if (!(await verifyProjectOwnership(projectId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data } as Record<string, unknown>;
  if (data.dueDate && typeof data.dueDate === "string") {
    data.dueDate = new Date(data.dueDate as string);
  }
  if (data.status === "DONE") {
    data.completedAt = new Date();
  } else if (data.status && data.status !== "DONE") {
    data.completedAt = null;
  }

  const task = await prisma.task.updateMany({
    where: { id: taskId, projectId },
    data: data as Parameters<typeof prisma.task.updateMany>[0]["data"],
  });

  if (task.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await updateProjectProgress(projectId);
  const updated = await prisma.task.findUnique({ where: { id: taskId } });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, taskId } = await params;
  if (!(await verifyProjectOwnership(projectId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await prisma.task.deleteMany({ where: { id: taskId, projectId } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await updateProjectProgress(projectId);
  return NextResponse.json({ success: true });
}
