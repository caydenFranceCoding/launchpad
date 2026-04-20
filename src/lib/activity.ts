import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";

export async function logActivity(
  projectId: string,
  type: ActivityType,
  message: string,
  metadata?: Record<string, unknown>
) {
  await prisma.activityLog.create({
    data: {
      projectId,
      type,
      message,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
