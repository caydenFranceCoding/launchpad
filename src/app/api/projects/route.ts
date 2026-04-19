import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projectCreateSchema } from "@/lib/validators";
import { parseGitHubUrl } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { tasks: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = projectCreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = parsed.data;
  let repoOwner: string | undefined;
  let repoName: string | undefined;

  if (data.repoUrl) {
    const parsed = parseGitHubUrl(data.repoUrl);
    if (parsed) {
      repoOwner = parsed.owner;
      repoName = parsed.repo;
    }
  }

  const project = await prisma.project.create({
    data: {
      ...data,
      repoOwner,
      repoName,
      userId: session.user.id,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
