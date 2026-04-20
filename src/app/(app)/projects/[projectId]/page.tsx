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
import { MilestoneSection } from "@/components/milestones/milestone-section";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/projects/status-badge";
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

interface MilestoneData {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completedAt: string | null;
  tasks: { id: string; title: string; status: string }[];
}

interface ActivityData {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

interface GitHubCommitData {
  id: string;
  sha: string;
  message: string;
  authorName: string;
  authorAvatar: string | null;
  authorLogin: string | null;
  committedAt: string;
  additions: number;
  deletions: number;
  filesChanged: number;
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
  commits?: GitHubCommitData[];
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
  milestones: MilestoneData[];
  activities: ActivityData[];
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
      <div className="space-y-6 max-w-5xl">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="h-8 w-72 bg-white/[0.06] rounded-lg animate-pulse" />
          </div>
          <div className="h-4 w-96 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-2 w-full bg-white/[0.04] rounded-full animate-pulse mt-4" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) return null;

  const tasks = project.tasks ?? [];
  const metrics = project.metrics ?? [];
  const milestones = project.milestones ?? [];
  const activities = project.activities ?? [];
  const tasksDone = tasks.filter((t) => t.status === "DONE").length;
  const tasksInProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const projectColor = project.color ?? "#c4b5fd";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 text-sm group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to projects
      </button>

      {/* Hero header card */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {/* Color accent bar */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${projectColor}, ${projectColor}80, transparent)` }} />

        <div className="p-6 space-y-5">
          {/* Title row */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0 ring-4 ring-white/[0.04]"
                  style={{ backgroundColor: projectColor }}
                />
                <h1 className="text-2xl font-semibold text-white tracking-tight truncate">{project.name}</h1>
              </div>
              {project.description && (
                <p className="text-sm text-zinc-400 leading-relaxed ml-6 max-w-2xl">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => setShowEdit(true)} className="border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/20 text-xs h-8 px-3">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowDelete(true)} className="border-white/[0.08] text-zinc-500 hover:text-red-400 hover:border-red-500/20 text-xs h-8 px-3">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </Button>
            </div>
          </div>

          {/* Status + Progress */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Select value={project.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40 bg-white/[0.04] border-white/[0.08] text-white text-sm h-9 rounded-lg">
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
              <Progress value={project.progress} className="h-2 bg-white/[0.06] [&>div]:bg-purple-300 [&>div]:rounded-full" />
              <span className="text-sm text-zinc-300 font-semibold tabular-nums shrink-0">{project.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tasks */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Tasks</p>
          <p className="text-2xl font-semibold text-white tabular-nums">{tasksDone}<span className="text-zinc-600 text-lg">/{tasks.length}</span></p>
          <p className="text-xs text-zinc-600">{tasksInProgress > 0 ? `${tasksInProgress} in progress` : tasks.length === 0 ? "No tasks yet" : "completed"}</p>
        </div>
        {/* Metrics */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Metrics</p>
          <p className="text-2xl font-semibold text-white tabular-nums">{metrics.length}</p>
          <p className="text-xs text-zinc-600">{metrics.length === 1 ? "KPI tracked" : "KPIs tracked"}</p>
        </div>
        {/* Quick links */}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1 hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors group"
          >
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Live Site</p>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              <p className="text-sm text-zinc-300 group-hover:text-purple-300 transition-colors truncate">{new URL(project.url).hostname}</p>
            </div>
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-1 hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors group"
          >
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Repository</p>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <p className="text-sm text-zinc-300 group-hover:text-purple-300 transition-colors truncate">
                {project.repoOwner}/{project.repoName}
              </p>
            </div>
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <Tabs defaultValue="tasks">
          <TabsList className="bg-transparent border-b border-white/[0.06] rounded-none w-full justify-start gap-0 h-auto p-0 px-2">
            {[
              { value: "tasks", label: `Tasks (${tasks.length})` },
              { value: "milestones", label: `Milestones (${milestones.length})` },
              { value: "metrics", label: `Metrics (${metrics.length})` },
              { value: "activity", label: "Activity" },
              { value: "github", label: "GitHub" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-300 data-[state=active]:text-purple-300 data-[state=active]:bg-transparent text-zinc-500 hover:text-zinc-300 px-4 py-3 text-sm font-medium"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-5">
            <TabsContent value="tasks" className="mt-0">
              <TaskList projectId={projectId} initialTasks={tasks} />
            </TabsContent>

            <TabsContent value="milestones" className="mt-0">
              <MilestoneSection projectId={projectId} initialMilestones={milestones} />
            </TabsContent>

            <TabsContent value="metrics" className="mt-0">
              <MetricSection projectId={projectId} initialMetrics={metrics} />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <ActivityTimeline activities={activities} />
            </TabsContent>

            <TabsContent value="github" className="mt-0">
              <GitHubSection
                projectId={projectId}
                repoUrl={project.repoUrl}
                repoOwner={project.repoOwner}
                repoName={project.repoName}
                initialCache={project.githubCache}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

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
