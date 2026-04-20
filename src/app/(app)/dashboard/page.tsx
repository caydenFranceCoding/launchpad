"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectForm } from "@/components/projects/project-form";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/components/settings-provider";
import { cn } from "@/lib/utils";

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  color: string | null;
  updatedAt: string;
  tasks: { status: string }[];
  _count: { tasks: number };
}

const filterOptions = [
  { value: "ALL", label: "All" },
  { value: "IDEA", label: "Ideas" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "ALL" ? projects : projects.filter((p) => p.status === filter);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (settings.defaultSortOrder) {
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "status":
        return list.sort((a, b) => a.status.localeCompare(b.status));
      case "progress":
        return list.sort((a, b) => b.progress - a.progress);
      case "updatedAt":
      default:
        return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }, [filtered, settings.defaultSortOrder]);

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "IN_PROGRESS").length,
    shipped: projects.filter((p) => p.status === "SHIPPED").length,
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-10 w-32 bg-white/[0.04] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          {settings.showProjectStats && (
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} projects &middot; {stats.active} active &middot; {stats.shipped} shipped
            </p>
          )}
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-purple-300 text-black hover:bg-purple-200 font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Project
        </Button>
      </div>

      {/* Notifications */}
      {settings.showNotificationPanel && projects.length > 0 && <NotificationPanel />}

      {/* Filters */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === f.value
                  ? "bg-purple-300/10 text-purple-300"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Project grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <EmptyState
          title="No projects match"
          description="Try changing the filter to see more projects."
        />
      ) : (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          }
          title="No projects yet"
          description="Create your first project to start tracking your work."
          action={{ label: "Create Project", onClick: () => setShowForm(true) }}
        />
      )}

      <ProjectForm open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}
