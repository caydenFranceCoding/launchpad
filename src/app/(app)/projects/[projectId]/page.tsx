"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectForm } from "@/components/projects/project-form";
import { TaskList } from "@/components/tasks/task-list";
import { MetricSection } from "@/components/metrics/metric-section";
import { GitHubSection } from "@/components/github/github-section";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  completedAt?: string | null;
}

interface DatapointData {
  id: string;
  value: number;
  date: string;
}

interface MetricData {
  id: string;
  name: string;
  unit: string;
  color: string;
  datapoints: DatapointData[];
}

interface GitHubCacheData {
  commitCount: number;
  openIssues: number;
  closedIssues: number;
  openPRs: number;
  mergedPRs: number;
  stars: number;
  forks: number;
  commitActivity: Array<{ week: string; count: number }> | null;
  languages: Record<string, number> | null;
  syncedAt: string;
}

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  url: string | null;
  repoUrl: string | null;
  repoOwner: string | null;
  repoName: string | null;
  color: string | null;
  tasks: TaskData[];
  metrics: MetricData[];
  githubCache: GitHubCacheData | null;
}

const statuses = [
  { value: "IDEA", label: "Idea" },
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PAUSED", label: "Paused" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      });
  }, [projectId]);

  async function handleStatusChange(status: string | null) {
    if (!status) return;
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProject((prev) => prev ? { ...prev, ...updated } : prev);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-white/[0.04] rounded animate-pulse" />
        <div className="h-64 bg-white/[0.04] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) return null;

  const tasks = project.tasks ?? [];
  const metrics = project.metrics ?? [];
  const tasksDone = tasks.filter((t) => t.status === "DONE").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/dashboard")} className="text-zinc-600 hover:text-zinc-400 transition-colors p-1 -ml-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: project.color ?? "#c4b5fd" }} />
            <h1 className="text-2xl font-bold text-white truncate">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-zinc-500 ml-0 md:ml-12">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setShowEdit(true)} className="border-white/10 text-zinc-400 hover:text-white text-xs">
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowDelete(true)} className="border-white/10 text-zinc-400 hover:text-red-400 text-xs">
            Delete
          </Button>
        </div>
      </div>

      {/* Status + Progress bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 ml-0 md:ml-12">
        <Select value={project.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40 bg-white/[0.04] border-white/10 text-white text-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-white/10">
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value} className="text-zinc-300 focus:text-white focus:bg-white/[0.04]">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1 flex items-center gap-3">
          <Progress value={project.progress} className="h-2 bg-white/[0.06] [&>div]:bg-purple-300" />
          <span className="text-sm text-zinc-400 font-medium shrink-0">{project.progress}%</span>
        </div>
        {tasks.length > 0 && (
          <span className="text-xs text-zinc-600 shrink-0">{tasksDone}/{tasks.length} tasks</span>
        )}
      </div>

      {/* Links */}
      <div className="flex gap-4 ml-0 md:ml-12">
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-purple-300 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Live Site
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-purple-300 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Repository
          </a>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="ml-0">
        <TabsList className="bg-transparent border-b border-white/[0.06] rounded-none w-full justify-start gap-0 h-auto p-0">
          {["tasks", "metrics", "github"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1 sm:flex-none rounded-none border-b-2 border-transparent data-[state=active]:border-purple-300 data-[state=active]:text-purple-300 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 px-3 sm:px-4 py-2.5 text-sm font-medium capitalize"
            >
              {tab === "github" ? "GitHub" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <TaskList projectId={projectId} initialTasks={tasks} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <MetricSection projectId={projectId} initialMetrics={metrics} />
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <GitHubSection
            projectId={projectId}
            repoUrl={project.repoUrl}
            repoOwner={project.repoOwner}
            repoName={project.repoName}
            initialCache={project.githubCache}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProjectForm
        open={showEdit}
        onOpenChange={setShowEdit}
        project={{
          id: projectId,
          name: project.name,
          description: project.description,
          status: project.status,
          url: project.url,
          repoUrl: project.repoUrl,
          color: project.color,
        }}
      />
      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Project"
        description="This will permanently delete this project and all its tasks, metrics, and data. This cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
