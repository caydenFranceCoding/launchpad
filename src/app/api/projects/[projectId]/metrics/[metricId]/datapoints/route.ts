import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { datapointCreateSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { NextResponse } from "next/server";

export async function GET(
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

  const datapoints = await prisma.metricDatapoint.findMany({
    where: { metricId },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(datapoints);
}

export async function POST(
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
  const parsed = datapointCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const datapoint = await prisma.metricDatapoint.upsert({
    where: { metricId_date: { metricId, date: new Date(parsed.data.date) } },
    update: { value: parsed.data.value },
    create: { metricId, value: parsed.data.value, date: new Date(parsed.data.date) },
  });

  const metric = await prisma.metric.findUnique({ where: { id: metricId }, select: { name: true, unit: true } });
  if (metric) {
    await logActivity(projectId, "METRIC_RECORDED",
      `Recorded ${metric.name}: ${parsed.data.value}${metric.unit ? ` ${metric.unit}` : ""}`,
      { metricName: metric.name, value: parsed.data.value }
    );
  }

  return NextResponse.json(datapoint, { status: 201 });
}
