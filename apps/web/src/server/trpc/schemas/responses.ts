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
  mitreCoverage: z.object({
    totalTechniques: z.number().int().nonnegative(),
    coveredTechniques: z.number().int().nonnegative(),
    coveragePercentage: z.number(),
  }),
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
/**
 * A terminal-attachable agent. Identified by `paw` — the old numeric id came
 * from Caldera's manx plugin and no longer exists now that we run our own C2.
 */
export const sessionSchema = z.object({
  paw: z.string(),
  info: z.string(),
  platform: z.string(),
  executors: z.array(z.string()),
  alive: z.boolean(),
  last_seen: z.string(),
});

export const sessionsListResponseSchema = z.object({
  sessions: z.array(sessionSchema),
});

// ---------------------------------------------------------------------------
// Agent deployment (Caldera `/api/v2/deploy_commands`)
// ---------------------------------------------------------------------------

/** Platforms we ship deployment instructions for. */
export const DEPLOY_PLATFORMS = ["linux", "windows", "darwin"] as const;

export const deployPlatformSchema = z.enum(DEPLOY_PLATFORMS);

export const deployCommandVariationSchema = z.object({
  description: z.string(),
  command: z.string(),
});

/** The Sandcat-only, client-facing shape. */
export const sandcatDeploymentSchema = z.object({
  platform: deployPlatformSchema,
  executor: z.string(),
  description: z.string(),
  command: z.string(),
  variations: z.array(deployCommandVariationSchema),
});

export const sandcatDeployResponseSchema = z.object({
  deployments: z.array(sandcatDeploymentSchema),
  appConfig: z.record(z.string(), z.string()),
});

// ---------------------------------------------------------------------------
// Global agent configuration (Caldera `/api/v2/config/agents`)
// ---------------------------------------------------------------------------

export const agentConfigSchema = z.object({
  implant_name: z.string(),
  sleep_min: z.number().int().nonnegative(),
  sleep_max: z.number().int().nonnegative(),
  watchdog: z.number().int().nonnegative(),
  untrusted_timer: z.number().int().nonnegative(),
  /** Callback address baked into the generated deploy commands. */
  c2_url: z.string(),
  bootstrap_abilities: z.array(z.string()).default([]),
  deployments: z.array(z.string()).default([]),
});

/** The writable subset, mirroring Caldera's own ConfigModal validation. */
export const agentConfigUpdateSchema = z
  .object({
    implant_name: z.string().min(1, "Implant name cannot be empty"),
    c2_url: z.string().min(1, "C2 address cannot be empty"),
    sleep_min: z.number().int().nonnegative(),
    sleep_max: z.number().int().nonnegative(),
    watchdog: z.number().int().nonnegative(),
    untrusted_timer: z.number().int().nonnegative(),
  })
  .refine((value) => value.sleep_min <= value.sleep_max, {
    message: "Beacon min must be less than or equal to beacon max",
    path: ["sleep_min"],
  });
