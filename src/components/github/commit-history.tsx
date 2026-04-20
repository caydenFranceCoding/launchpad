"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface CommitData {
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

interface CommitHistoryProps {
  commits: CommitData[];
  repoOwner: string;
  repoName: string;
}

export function CommitHistory({ commits, repoOwner, repoName }: CommitHistoryProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? commits : commits.slice(0, 10);

  if (commits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-zinc-500">No commits synced yet. Hit Sync Now to fetch commit history.</p>
      </div>
    );
  }

  // Group commits by date
  const grouped = new Map<string, CommitData[]>();
  for (const commit of visible) {
    const date = new Date(commit.committedAt).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(commit);
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">Recent Commits</h3>
        <span className="text-xs text-zinc-600">{commits.length} commits</span>
      </div>

      <div className="space-y-5">
        {Array.from(grouped.entries()).map(([date, dateCommits]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-purple-300/40" />
              <span className="text-xs font-medium text-zinc-500">{date}</span>
            </div>
            <div className="ml-[3px] border-l border-white/[0.06] pl-5 space-y-0.5">
              {dateCommits.map((commit) => {
                const title = commit.message.split("\n")[0];
                const body = commit.message.split("\n").slice(1).join("\n").trim();
                const hasStats = commit.additions > 0 || commit.deletions > 0;

                return (
                  <a
                    key={commit.id}
                    href={`https://github.com/${repoOwner}/${repoName}/commit/${commit.sha}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Avatar */}
                    {commit.authorAvatar ? (
                      <img
                        src={commit.authorAvatar}
                        alt={commit.authorName}
                        className="w-6 h-6 rounded-full shrink-0 mt-0.5 ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full shrink-0 mt-0.5 bg-zinc-800 flex items-center justify-center ring-1 ring-white/10">
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {commit.authorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 group-hover:text-white transition-colors truncate">
                        {title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-600">
                          {commit.authorLogin ?? commit.authorName}
                        </span>
                        <span className="text-zinc-800">·</span>
                        <span className="text-xs text-zinc-600">
                          {formatRelativeTime(commit.committedAt)}
                        </span>
                        {hasStats && (
                          <>
                            <span className="text-zinc-800">·</span>
                            <span className="text-xs">
                              <span className="text-green-500/70">+{commit.additions}</span>
                              {" "}
                              <span className="text-red-500/70">-{commit.deletions}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* SHA */}
                    <code className="text-[11px] text-zinc-600 group-hover:text-purple-300/60 font-mono shrink-0 mt-0.5 transition-colors">
                      {commit.sha.slice(0, 7)}
                    </code>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {commits.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center py-2.5 text-xs text-zinc-500 hover:text-purple-300 transition-colors mt-2"
        >
          {expanded ? "Show less" : `Show ${commits.length - 10} more commits`}
        </button>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 604800)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
