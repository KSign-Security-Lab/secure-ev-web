import { z } from "zod";

const commandSearchResultSchema = z.object({
  id: z.string(),
  ability_name: z.string(),
  command: z.string(),
  description: z.string(),
  platform: z.string(),
  type: z.string(),
  technique_name: z.string(),
  tactic: z.string().optional(),
});

export const searchCommandsInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().positive().max(20).default(10),
});

export const searchCommandsByFiltersInputSchema = z.object({
  platform: z.string().optional(),
  type: z.string().optional(),
  techniqueName: z.string().optional(),
  tactic: z.string().optional(),
  query: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(50),
});

export const paginatedCommandSearchResponseSchema = z.object({
  abilities: z.array(commandSearchResultSchema),
  count: z.number().int().nonnegative(),
});

export const commandSearchResultListSchema = z.array(commandSearchResultSchema);

export const filterValuesResponseSchema = z.object({
  platforms: z.array(z.string()),
  types: z.array(z.string()),
  techniqueNames: z.array(z.string()),
  tactics: z.array(z.string()),
});
