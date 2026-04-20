import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { milestoneCreateSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });
  return !!project;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  if (!(await verifyProjectOwnership(projectId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    include: {
      tasks: { select: { id: true, status: true, title: true } },
    },
    orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(milestones);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  if (!(await verifyProjectOwnership(projectId, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = milestoneCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const milestone = await prisma.milestone.create({
    data: {
      ...parsed.data,
      targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : null,
      projectId,
    },
    include: { tasks: { select: { id: true, status: true, title: true } } },
  });

  await logActivity(projectId, "MILESTONE_CREATED", `Created milestone "${milestone.title}"`);
  return NextResponse.json(milestone, { status: 201 });
}
