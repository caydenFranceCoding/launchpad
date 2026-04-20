"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TaskNotification {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  project: { id: string; name: string; color: string | null };
}

interface MilestoneNotification {
  id: string;
  title: string;
  targetDate: string | null;
  project: { id: string; name: string; color: string | null };
  tasks: { status: string }[];
}

interface NotificationData {
  overdueTasks: TaskNotification[];
  upcomingTasks: TaskNotification[];
  upcomingMilestones: MilestoneNotification[];
}

export function NotificationPanel() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return null;

  const totalCount = data.overdueTasks.length + data.upcomingTasks.length + data.upcomingMilestones.length;
  if (totalCount === 0) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white font-bold flex items-center justify-center">
              {totalCount}
            </span>
          </div>
          <span className="text-sm font-medium text-white">Notifications</span>
        </div>
        <svg
          className={cn("w-4 h-4 text-zinc-500 transition-transform", collapsed && "-rotate-90")}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-5 pb-4 space-y-4">
          {data.overdueTasks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Overdue</p>
              {data.overdueTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => router.push(`/projects/${task.project.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: task.project.color ?? "#c4b5fd" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-zinc-600">{task.project.name}</p>
                  </div>
                  <span className="text-xs text-red-400 tabular-nums shrink-0">
                    {formatDaysOverdue(task.dueDate)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {data.upcomingTasks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-yellow-400 uppercase tracking-wider">Due Soon</p>
              {data.upcomingTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => router.push(`/projects/${task.project.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: task.project.color ?? "#c4b5fd" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-zinc-600">{task.project.name}</p>
                  </div>
                  <span className="text-xs text-yellow-400 tabular-nums shrink-0">
                    {formatDueDate(task.dueDate)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {data.upcomingMilestones.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">Milestones</p>
              {data.upcomingMilestones.map((milestone) => {
                const total = milestone.tasks.length;
                const done = milestone.tasks.filter((t) => t.status === "DONE").length;
                const isOverdue = milestone.targetDate && new Date(milestone.targetDate) < new Date();
                return (
                  <button
                    key={milestone.id}
                    onClick={() => router.push(`/projects/${milestone.project.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: milestone.project.color ?? "#c4b5fd" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{milestone.title}</p>
                      <p className="text-xs text-zinc-600">
                        {milestone.project.name}
                        {total > 0 && ` \u00B7 ${done}/${total} tasks`}
                      </p>
                    </div>
                    <span className={cn(
                      "text-xs tabular-nums shrink-0",
                      isOverdue ? "text-red-400" : "text-purple-400"
                    )}>
                      {milestone.targetDate
                        ? isOverdue
                          ? formatDaysOverdue(milestone.targetDate)
                          : formatDueDate(milestone.targetDate)
                        : "No date"
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDaysOverdue(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Due today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function formatDueDate(dateStr: string) {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}
