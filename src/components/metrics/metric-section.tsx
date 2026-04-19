"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Datapoint {
  id: string;
  value: number;
  date: string;
}

interface Metric {
  id: string;
  name: string;
  unit: string;
  color: string;
  datapoints: Datapoint[];
}

export function MetricSection({ projectId, initialMetrics }: { projectId: string; initialMetrics: Metric[] }) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [showDatapointForm, setShowDatapointForm] = useState<string | null>(null);

  async function createMetric(data: { name: string; unit: string }) {
    const res = await fetch(`/api/projects/${projectId}/metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const metric = await res.json();
      setMetrics((prev) => [...prev, { ...metric, datapoints: [] }]);
      setShowMetricForm(false);
    }
  }

  async function addDatapoint(metricId: string, value: number, date: string) {
    const res = await fetch(`/api/projects/${projectId}/metrics/${metricId}/datapoints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, date: new Date(date).toISOString() }),
    });
    if (res.ok) {
      const dp = await res.json();
      setMetrics((prev) =>
        prev.map((m) =>
          m.id === metricId
            ? { ...m, datapoints: [...m.datapoints.filter((d) => d.id !== dp.id), dp].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) }
            : m
        )
      );
      setShowDatapointForm(null);
    }
  }

  async function deleteMetric(metricId: string) {
    await fetch(`/api/projects/${projectId}/metrics/${metricId}`, { method: "DELETE" });
    setMetrics((prev) => prev.filter((m) => m.id !== metricId));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-400">Metrics</h3>
        <Button
          size="sm"
          onClick={() => setShowMetricForm(true)}
          className="bg-purple-300 text-black hover:bg-purple-200 text-xs"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Metric
        </Button>
      </div>

      {metrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric) => {
            const latest = metric.datapoints[metric.datapoints.length - 1];
            const prev = metric.datapoints[metric.datapoints.length - 2];
            const delta = latest && prev ? latest.value - prev.value : null;
            const chartData = [...metric.datapoints].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((d) => ({
              date: new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
              value: d.value,
            }));

            return (
              <Card key={metric.id} className="bg-zinc-950/50 border-white/[0.06]">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-zinc-400">{metric.name}</CardTitle>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowDatapointForm(metric.id)}
                        className="text-zinc-600 hover:text-purple-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteMetric(metric.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-white">
                      {latest ? `${metric.unit}${latest.value.toLocaleString()}` : "--"}
                    </span>
                    {delta !== null && (
                      <span className={delta >= 0 ? "text-xs text-green-400" : "text-xs text-red-400"}>
                        {delta >= 0 ? "+" : ""}{delta.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {chartData.length > 1 && (
                    <ResponsiveContainer width="100%" height={80}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" hide />
                        <YAxis hide domain={["auto", "auto"]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                          labelStyle={{ color: "#a1a1aa" }}
                          itemStyle={{ color: "#c4b5fd" }}
                        />
                        <Line type="monotone" dataKey="value" stroke={metric.color || "#c4b5fd"} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No metrics yet"
          description="Track KPIs like revenue, users, or downloads."
          action={{ label: "Add Metric", onClick: () => setShowMetricForm(true) }}
        />
      )}

      {/* New metric dialog */}
      <MetricFormDialog open={showMetricForm} onOpenChange={setShowMetricForm} onSave={createMetric} />

      {/* Add datapoint dialog */}
      <DatapointFormDialog
        open={!!showDatapointForm}
        onOpenChange={() => setShowDatapointForm(null)}
        onSave={(value, date) => showDatapointForm && addDatapoint(showDatapointForm, value, date)}
      />
    </div>
  );
}

function MetricFormDialog({ open, onOpenChange, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; unit: string }) => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10">
        <DialogHeader><DialogTitle className="text-white">New Metric</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ name, unit }); setName(""); setUnit(""); }} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Monthly Revenue" required className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Unit (prefix)</Label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="$, users, etc." className="bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-600" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400">Cancel</Button>
            <Button type="submit" disabled={!name.trim()} className="bg-purple-300 text-black hover:bg-purple-200">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DatapointFormDialog({ open, onOpenChange, onSave }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (value: number, date: string) => void;
}) {
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10">
        <DialogHeader><DialogTitle className="text-white">Log Value</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSave(Number(value), date); setValue(""); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-400">Value</Label>
              <Input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} required className="bg-white/[0.04] border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/[0.04] border-white/10 text-white [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400">Cancel</Button>
            <Button type="submit" disabled={!value} className="bg-purple-300 text-black hover:bg-purple-200">Log</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
