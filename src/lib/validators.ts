import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(["IDEA", "PLANNING", "IN_PROGRESS", "PAUSED", "SHIPPED", "ARCHIVED"]).optional(),
  url: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  progress: z.number().min(0).max(100).optional(),
  repoOwner: z.string().optional(),
  repoName: z.string().optional(),
});

export const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  sortOrder: z.number().optional(),
});

export const metricCreateSchema = z.object({
  name: z.string().min(1).max(100),
  unit: z.string().max(20).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const metricUpdateSchema = metricCreateSchema.partial();

export const datapointCreateSchema = z.object({
  value: z.number(),
  date: z.string().datetime(),
});
