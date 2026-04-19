"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "./status-badge";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    progress: number;
    color?: string | null;
    tasks?: { status: string }[];
    _count?: { tasks: number };
    updatedAt: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const tasksDone = project.tasks?.filter((t) => t.status === "DONE").length ?? 0;
  const totalTasks = project._count?.tasks ?? project.tasks?.length ?? 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="bg-zinc-950/50 border-white/[0.06] hover:border-purple-300/20 transition-all duration-200 hover:bg-zinc-950 group cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: project.color ?? "#c4b5fd" }}
              />
              <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                {project.name}
              </h3>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && (
            <p className="text-sm text-zinc-500 line-clamp-2">{project.description}</p>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Progress</span>
              <span className="text-zinc-400 font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5 bg-white/[0.06] [&>div]:bg-purple-300" />
          </div>
          {totalTasks > 0 && (
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{tasksDone}/{totalTasks} tasks done</span>
              <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
