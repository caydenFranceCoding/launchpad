import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { metricCreateSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const metrics = await prisma.metric.findMany({
    where: { projectId },
    include: { datapoints: { orderBy: { date: "desc" }, take: 30 } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(metrics);
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = metricCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const metric = await prisma.metric.create({
    data: { ...parsed.data, projectId },
  });

  return NextResponse.json(metric, { status: 201 });
}
