"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState(project?.status ?? "IDEA");
  const [url, setUrl] = useState(project?.url ?? "");
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? "");
  const [color, setColor] = useState(project?.color ?? "#c4b5fd");

  const isEdit = !!project;

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
            <Input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/you/repo"
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600"
            />
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
