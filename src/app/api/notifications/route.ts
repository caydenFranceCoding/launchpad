import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [overdueTasks, upcomingTasks, upcomingMilestones] = await Promise.all([
    // Overdue tasks
    prisma.task.findMany({
      where: {
        project: { userId: session.user.id },
        status: { notIn: ["DONE", "CANCELLED"] },
        dueDate: { lt: now },
      },
      include: { project: { select: { id: true, name: true, color: true } } },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    // Tasks due in next 3 days
    prisma.task.findMany({
      where: {
        project: { userId: session.user.id },
        status: { notIn: ["DONE", "CANCELLED"] },
        dueDate: { gte: now, lte: threeDaysFromNow },
      },
      include: { project: { select: { id: true, name: true, color: true } } },
      orderBy: { dueDate: "asc" },
      take: 20,
    }),
    // Milestones due in next 7 days or overdue
    prisma.milestone.findMany({
      where: {
        project: { userId: session.user.id },
        completedAt: null,
        targetDate: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { targetDate: "asc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({ overdueTasks, upcomingTasks, upcomingMilestones });
}
