"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/components/settings-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { CommitHistory, type CommitData } from "./commit-history";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  commits?: CommitData[];
  syncedAt: string;
}

interface GitHubSectionProps {
  projectId: string;
  repoUrl?: string | null;
  repoOwner?: string | null;
  repoName?: string | null;
  initialCache: GitHubCacheData | null;
}

export function GitHubSection({ projectId, repoUrl, repoOwner, repoName, initialCache }: GitHubSectionProps) {
  const [cache, setCache] = useState(initialCache);
  const [syncing, setSyncing] = useState(false);
  const [localAutoSync, setLocalAutoSync] = useState(!!initialCache);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { settings } = useSettings();

  const doSync = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/github/sync`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setCache(data);
    }
  }, [projectId]);

  async function handleSync() {
    setSyncing(true);
    await doSync();
    setLocalAutoSync(true);
    setSyncing(false);
  }

  // Auto-sync at configured frequency when enabled
  const autoSyncEnabled = localAutoSync && settings.autoSync;

  useEffect(() => {
    if (!autoSyncEnabled || !repoOwner || !repoName) return;

    intervalRef.current = setInterval(() => {
      doSync();
    }, settings.syncFrequency * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoSyncEnabled, repoOwner, repoName, doSync, settings.syncFrequency]);

  if (!repoOwner || !repoName) {
    return (
      <EmptyState
        title="No repository linked"
        description="Add a GitHub repository URL to your project to see stats here."
      />
    );
  }

  const stats = [
    { label: "Commits", value: cache?.commitCount ?? 0, icon: "M3 3h18v18H3V3z" },
    { label: "Stars", value: cache?.stars ?? 0, icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
    { label: "Open Issues", value: cache?.openIssues ?? 0, icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" },
    { label: "Open PRs", value: cache?.openPRs ?? 0, icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
    { label: "Merged PRs", value: cache?.mergedPRs ?? 0, icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Forks", value: cache?.forks ?? 0, icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
  ];

  const totalLangBytes = cache?.languages ? Object.values(cache.languages).reduce((a, b) => a + b, 0) : 0;
  const langEntries = cache?.languages
    ? Object.entries(cache.languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-400">GitHub Stats</h3>
          <a href={repoUrl ?? ""} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:text-purple-300">
            {repoOwner}/{repoName}
          </a>
        </div>
        <div className="flex items-center gap-3">
          {cache && (
            <span className="text-xs text-zinc-600">
              Synced {new Date(cache.syncedAt).toLocaleString()}
            </span>
          )}
          <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing} className="border-white/10 text-zinc-400 hover:text-white text-xs">
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-zinc-950/50 border-white/[0.06]">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commit Activity */}
      {cache?.commitActivity && cache.commitActivity.length > 0 && (
        <Card className="bg-zinc-950/50 border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Commit Activity (Last 12 Weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={cache.commitActivity}>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#c4b5fd" }}
                />
                <Bar dataKey="count" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Languages */}
      {langEntries.length > 0 && (
        <Card className="bg-zinc-950/50 border-white/[0.06]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Color bar */}
            <div className="flex h-2 rounded-full overflow-hidden">
              {langEntries.map(([lang, bytes]) => (
                <div
                  key={lang}
                  className="h-full"
                  style={{
                    width: `${(bytes / totalLangBytes) * 100}%`,
                    backgroundColor: langColorMap[lang] ?? "#c4b5fd",
                  }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {langEntries.map(([lang, bytes]) => (
                <div key={lang} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColorMap[lang] ?? "#c4b5fd" }} />
                  <span className="text-zinc-400">{lang}</span>
                  <span className="text-zinc-600">{((bytes / totalLangBytes) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commit History */}
      {repoOwner && repoName && (
        <Card className="bg-zinc-950/50 border-white/[0.06]">
          <CardContent className="pt-5">
            <CommitHistory
              commits={cache?.commits ?? []}
              repoOwner={repoOwner}
              repoName={repoName}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const langColorMap: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  "C++": "#f34b7d",
  C: "#555555",
  PHP: "#4F5D95",
  Dart: "#00B4AB",
  Scala: "#c22d40",
};
