import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  IDEA: { label: "Idea", className: "bg-zinc-800 text-zinc-300 border-zinc-700" },
  PLANNING: { label: "Planning", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  IN_PROGRESS: { label: "In Progress", className: "bg-purple-300/10 text-purple-300 border-purple-300/20" },
  PAUSED: { label: "Paused", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  SHIPPED: { label: "Shipped", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  ARCHIVED: { label: "Archived", className: "bg-zinc-800 text-zinc-500 border-zinc-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.IDEA;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
