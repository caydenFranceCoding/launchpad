"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  completedAt?: string | null;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  URGENT: { label: "Urgent", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  HIGH: { label: "High", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  MEDIUM: { label: "Medium", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  LOW: { label: "Low", className: "bg-zinc-800 text-zinc-400 border-zinc-700" },
};

export function TaskList({ projectId, initialTasks }: { projectId: string; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter);

  async function toggleTask(task: Task) {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    const res = await fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    }
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  async function saveTask(data: { title: string; description?: string; priority: string; dueDate?: string | null }) {
    if (editingTask) {
      const res = await fetch(`/api/projects/${projectId}/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      }
    } else {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setTasks((prev) => [...prev, created]);
      }
    }
    setShowForm(false);
    setEditingTask(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                filter === f
                  ? "bg-purple-300/10 text-purple-300"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
              )}
            >
              {f === "ALL" ? "All" : f === "IN_PROGRESS" ? "In Progress" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="bg-purple-300 text-black hover:bg-purple-200 text-xs"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Task
        </Button>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-1">
          {filtered.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] group"
              >
                <button
                  onClick={() => toggleTask(task)}
                  className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                    task.status === "DONE"
                      ? "bg-purple-300 border-purple-300"
                      : "border-zinc-600 hover:border-purple-300"
                  )}
                >
                  {task.status === "DONE" && (
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => { setEditingTask(task); setShowForm(true); }}
                >
                  <p className={cn("text-sm font-medium truncate", task.status === "DONE" ? "text-zinc-500 line-through" : "text-white")}>
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p className={cn("text-xs mt-0.5", isOverdue ? "text-red-400" : "text-zinc-600")}>
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className={cn("text-[10px] shrink-0", priorityConfig[task.priority]?.className)}>
                  {priorityConfig[task.priority]?.label}
                </Badge>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No tasks yet"
          description="Break your project into manageable tasks."
          action={{ label: "Add Task", onClick: () => { setEditingTask(null); setShowForm(true); } }}
        />
      )}

      <TaskFormDialog
        open={showForm}
        onOpenChange={(open) => { setShowForm(open); if (!open) setEditingTask(null); }}
        task={editingTask}
        onSave={saveTask}
      />
    </div>
  );
}

function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (data: { title: string; description?: string; priority: string; dueDate?: string | null }) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");

  // Reset form when task changes
  useState(() => {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? "MEDIUM");
    setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setDueDate("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600 resize-none"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Priority</Label>
              <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
                <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/10">
                  {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                    <SelectItem key={p} value={p} className="text-zinc-300 focus:text-white focus:bg-white/[0.04]">
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/[0.04] border-white/10 text-white [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()} className="bg-purple-300 text-black hover:bg-purple-200 font-medium">
              {task ? "Save" : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
