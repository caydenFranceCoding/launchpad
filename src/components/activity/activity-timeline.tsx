"use client";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
  PROJECT_CREATED: { icon: "M12 4.5v15m7.5-7.5h-15", color: "text-purple-400" },
  PROJECT_STATUS_CHANGED: { icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5", color: "text-blue-400" },
  TASK_CREATED: { icon: "M12 4.5v15m7.5-7.5h-15", color: "text-zinc-400" },
  TASK_COMPLETED: { icon: "M4.5 12.75l6 6 9-13.5", color: "text-green-400" },
  TASK_REOPENED: { icon: "M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3", color: "text-yellow-400" },
  MILESTONE_CREATED: { icon: "M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5", color: "text-purple-400" },
  MILESTONE_COMPLETED: { icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", color: "text-yellow-400" },
  METRIC_RECORDED: { icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", color: "text-cyan-400" },
};

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Activity will appear here as you make changes to this project."
      />
    );
  }

  // Group activities by date
  const grouped = activities.reduce<Record<string, Activity[]>>((acc, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">{date}</p>
          <div className="space-y-0.5">
            {items.map((activity, i) => {
              const config = typeConfig[activity.type] ?? { icon: "M12 4.5v15m7.5-7.5h-15", color: "text-zinc-400" };
              return (
                <div key={activity.id} className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.02]">
                  <div className={cn("mt-0.5 shrink-0", config.color)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300">{activity.message}</p>
                  </div>
                  <span className="text-xs text-zinc-600 shrink-0 tabular-nums">
                    {relativeTime(activity.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
