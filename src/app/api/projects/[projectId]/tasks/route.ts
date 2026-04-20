import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskCreateSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
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

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  if (!(await verifyProjectOwnership(projectId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  if (!(await verifyProjectOwnership(projectId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = taskCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const maxOrder = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      sortOrder: (maxOrder?.sortOrder ?? 0) + 1,
      projectId,
    },
  });

  await updateProjectProgress(projectId);
  await logActivity(projectId, "TASK_CREATED", `Added task "${task.title}"`);
  return NextResponse.json(task, { status: 201 });
}
