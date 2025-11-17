import { z } from "zod";

export const abilitySchema = z.object({
  id: z.string().uuid(),
  ability_id: z.string(),
  ability_name: z.string(),
  description: z.string(),
  tactic: z.string(),
  technique_id: z.string(),
  technique_name: z.string(),
  platform: z.string(),
  shell_type: z.string(),
  command: z.string(),
  payload: z.string(),
  type: z.string(),
  createdAt: z.string(), // ISO datetime string (serialized from Date)
  updatedAt: z.string(), // ISO datetime string (serialized from Date)
});

export const paginatedAbilitiesResponseSchema = z.object({
  abilities: z.array(abilitySchema),
  count: z.number().int().nonnegative(),
});

export const agentSchema = z.object({
  paw: z.string(),
  sleep_min: z.number().int().nonnegative(),
  sleep_max: z.number().int().nonnegative(),
  watchdog: z.number().int().nonnegative(),
  group: z.string(),
  architecture: z.string(),
  platform: z.string(),
  server: z.string(),
  upstream_dest: z.string(),
  username: z.string(),
  location: z.string(),
  pid: z.number().int().nullable(),
  ppid: z.number().int().nullable(),
  trusted: z.boolean(),
  executors: z.array(z.string()),
  privilege: z.string(),
  exe_name: z.string(),
  host: z.string(),
  contact: z.string(),
  proxy_receivers: z.record(z.string(), z.unknown()),
  proxy_chain: z.array(z.unknown()),
  origin_link_id: z.string(),
  deadman_enabled: z.boolean(),
  available_contacts: z.array(z.string()),
  host_ip_addrs: z.array(z.string()),
  display_name: z.string(),
  created: z.string(), // ISO datetime string
  last_seen: z.string(), // ISO datetime string
  links: z.array(z.unknown()), // Complex nested structure, can be refined later
  pending_contact: z.string().optional(),
});

export const agentsListResponseSchema = z.array(agentSchema);

// Statistics schemas
export const abilityStatisticsSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  byTactic: z.array(
    z.object({
      name: z.string(),
      value: z.number().int().nonnegative(),
    })
  ),
  byPlatform: z.array(
    z.object({
      name: z.string(),
      value: z.number().int().nonnegative(),
    })
  ),
  byType: z.array(
    z.object({
      name: z.string(),
      value: z.number().int().nonnegative(),
    })
  ),
});

export const agentStatisticsSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  trustedCount: z.number().int().nonnegative(),
  untrustedCount: z.number().int().nonnegative(),
  byPlatform: z.array(
    z.object({
      name: z.string(),
      value: z.number().int().nonnegative(),
    })
  ),
  byGroup: z.array(
    z.object({
      name: z.string(),
      value: z.number().int().nonnegative(),
    })
  ),
  byPrivilege: z.array(
    z.object({
      name: z.string(),
      value: z.number().int().nonnegative(),
    })
  ),
});

// Sessions schema based on actual API response structure
export const sessionSchema = z.object({
  id: z.number(),
  info: z.string(),
  platform: z.string(),
  executors: z.array(z.string()),
});

export const sessionsListResponseSchema = z.object({
  sessions: z.array(sessionSchema),
});
