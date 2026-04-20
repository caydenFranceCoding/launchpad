"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cn } from "@/lib/utils";

interface MilestoneTask {
  id: string;
  title: string;
  status: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completedAt: string | null;
  tasks: MilestoneTask[];
}

export function MilestoneSection({
  projectId,
  initialMilestones,
}: {
  projectId: string;
  initialMilestones: Milestone[];
}) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function createMilestone(data: { title: string; description?: string; targetDate?: string | null }) {
    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created = await res.json();
      setMilestones((prev) => [...prev, created]);
      setShowForm(false);
    }
  }

  async function toggleComplete(milestone: Milestone) {
    const completedAt = milestone.completedAt ? null : new Date().toISOString();
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestone.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAt }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMilestones((prev) => prev.map((m) => (m.id === milestone.id ? updated : m)));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    await fetch(`/api/projects/${projectId}/milestones/${deleteId}`, { method: "DELETE" });
    setMilestones((prev) => prev.filter((m) => m.id !== deleteId));
    setDeleteId(null);
    setDeleting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">
          {milestones.length} {milestones.length === 1 ? "milestone" : "milestones"}
        </p>
        <Button
          size="sm"
          onClick={() => setShowForm(true)}
          className="bg-purple-300 text-black hover:bg-purple-200 text-xs"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Milestone
        </Button>
      </div>

      {milestones.length > 0 ? (
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const totalTasks = milestone.tasks.length;
            const doneTasks = milestone.tasks.filter((t) => t.status === "DONE").length;
            const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
            const isOverdue = milestone.targetDate && new Date(milestone.targetDate) < new Date() && !milestone.completedAt;
            const isCompleted = !!milestone.completedAt;

            return (
              <div
                key={milestone.id}
                className={cn(
                  "rounded-xl border p-4 space-y-3 transition-colors",
                  isCompleted
                    ? "border-green-500/10 bg-green-500/[0.02]"
                    : isOverdue
                    ? "border-red-500/10 bg-red-500/[0.02]"
                    : "border-white/[0.06] bg-white/[0.02]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleComplete(milestone)}
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        isCompleted
                          ? "bg-green-400 border-green-400"
                          : "border-zinc-600 hover:border-purple-300"
                      )}
                    >
                      {isCompleted && (
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        isCompleted ? "text-zinc-500 line-through" : "text-white"
                      )}>
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-zinc-500 mt-0.5">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {milestone.targetDate && (
                      <span className={cn(
                        "text-xs tabular-nums",
                        isOverdue ? "text-red-400" : isCompleted ? "text-zinc-600" : "text-zinc-500"
                      )}>
                        {isOverdue ? "Overdue: " : ""}
                        {new Date(milestone.targetDate).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => setDeleteId(milestone.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                {totalTasks > 0 && (
                  <div className="flex items-center gap-3 ml-8">
                    <Progress
                      value={progress}
                      className={cn(
                        "h-1.5 bg-white/[0.06]",
                        isCompleted
                          ? "[&>div]:bg-green-400"
                          : "[&>div]:bg-purple-300"
                      )}
                    />
                    <span className="text-xs text-zinc-500 tabular-nums shrink-0">
                      {doneTasks}/{totalTasks}
                    </span>
                  </div>
                )}

                {totalTasks > 0 && (
                  <div className="ml-8 space-y-0.5">
                    {milestone.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 py-0.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          task.status === "DONE" ? "bg-green-400" : task.status === "IN_PROGRESS" ? "bg-blue-400" : "bg-zinc-600"
                        )} />
                        <span className={cn(
                          "text-xs truncate",
                          task.status === "DONE" ? "text-zinc-600 line-through" : "text-zinc-400"
                        )}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No milestones yet"
          description="Create milestones to track major goals and deadlines."
          action={{ label: "Add Milestone", onClick: () => setShowForm(true) }}
        />
      )}

      <MilestoneFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSave={createMilestone}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Delete Milestone"
        description="This milestone will be deleted. Tasks assigned to it will be unassigned but not deleted."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function MilestoneFormDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; description?: string; targetDate?: string | null }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      title,
      description: description || undefined,
      targetDate: targetDate ? new Date(targetDate).toISOString() : null,
    });
    setTitle("");
    setDescription("");
    setTargetDate("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">New Milestone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Beta Launch, v1.0 Release"
              required
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this milestone represent?"
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600 resize-none"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Target Date</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-white/[0.04] border-white/10 text-white [color-scheme:dark]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()} className="bg-purple-300 text-black hover:bg-purple-200 font-medium">
              Create Milestone
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
