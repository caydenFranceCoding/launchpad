"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GitHubRepo {
  fullName: string;
  name: string;
  owner: string;
  url: string;
  homepage: string | null;
  description: string | null;
  private: boolean;
  updatedAt: string;
}

const statuses = [
  { value: "IDEA", label: "Idea" },
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PAUSED", label: "Paused" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "ARCHIVED", label: "Archived" },
];

const colors = [
  "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed",
  "#f472b6", "#fb7185", "#34d399", "#2dd4bf",
  "#60a5fa", "#38bdf8", "#fbbf24", "#a3a3a3",
];

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    url?: string | null;
    repoUrl?: string | null;
    color?: string | null;
  };
}

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState(project?.status ?? "IDEA");
  const [url, setUrl] = useState(project?.url ?? "");
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? "");
  const [color, setColor] = useState(project?.color ?? "#c4b5fd");

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposFetched, setReposFetched] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");

  const isEdit = !!project;
  const hasGitHub = !!session?.accessToken;

  useEffect(() => {
    if (open && hasGitHub && !isEdit && !reposFetched) {
      setReposLoading(true);
      fetch("/api/github/repos")
        .then((res) => (res.ok ? res.json() : []))
        .then((data: GitHubRepo[]) => {
          setRepos(data);
          setReposFetched(true);
        })
        .catch(() => setRepos([]))
        .finally(() => setReposLoading(false));
    }
  }, [open, hasGitHub, isEdit, reposFetched]);

  function selectRepo(repo: GitHubRepo) {
    setRepoUrl(repo.url);
    if (!name.trim()) setName(repo.name);
    if (!description && repo.description) setDescription(repo.description);
    if (!url && repo.homepage) setUrl(repo.homepage);
    setRepoSearch("");
  }

  const filteredRepos = repoSearch
    ? repos.filter((r) =>
        r.fullName.toLowerCase().includes(repoSearch.toLowerCase())
      )
    : repos;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = { name, description: description || undefined, status, url: url || undefined, repoUrl: repoUrl || undefined, color };
    const endpoint = isEdit ? `/api/projects/${project.id}` : "/api/projects";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(endpoint, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (res.ok) {
      const data = await res.json();
      onOpenChange(false);
      router.push(`/projects/${data.id}`);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{isEdit ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome project"
              required
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600 resize-none"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
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
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Color</Label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? "2px solid white" : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Live URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://myproject.com"
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">GitHub Repository</Label>
            {hasGitHub && !isEdit && repos.length > 0 ? (
              <div className="space-y-2">
                <Input
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  placeholder="Search your repos..."
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600"
                />
                {(repoSearch || !repoUrl) && (
                  <div className="max-h-36 overflow-y-auto rounded-md border border-white/10 bg-white/[0.02]">
                    {filteredRepos.length === 0 ? (
                      <p className="text-zinc-500 text-sm p-2">No repos found</p>
                    ) : (
                      filteredRepos.slice(0, 20).map((repo) => (
                        <button
                          key={repo.fullName}
                          type="button"
                          onClick={() => selectRepo(repo)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/[0.06] transition-colors flex items-center justify-between gap-2 ${
                            repoUrl === repo.url
                              ? "bg-purple-500/10 text-purple-300"
                              : "text-zinc-300"
                          }`}
                        >
                          <span className="truncate">{repo.fullName}</span>
                          {repo.private && (
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5 shrink-0">
                              Private
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {repoUrl && !repoSearch && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-purple-300 truncate flex-1">{repoUrl}</span>
                    <button
                      type="button"
                      onClick={() => { setRepoUrl(""); setName(""); setDescription(""); }}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/you/repo"
                  className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600"
                />
                {hasGitHub && !isEdit && reposLoading && (
                  <p className="text-xs text-zinc-500">Loading your repos...</p>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()} className="bg-purple-300 text-black hover:bg-purple-200 font-medium">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
