import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { metricUpdateSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; metricId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, metricId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = metricUpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const result = await prisma.metric.updateMany({
    where: { id: metricId, projectId },
    data: parsed.data,
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.metric.findUnique({ where: { id: metricId } });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; metricId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, metricId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await prisma.metric.deleteMany({ where: { id: metricId, projectId } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
