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
export const sessionSchema = z.object({
  id: z.number(),
  info: z.string(),
  platform: z.string(),
  executors: z.array(z.string()),
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

export const deployCommandAbilitySchema = z.object({
  name: z.string(),
  platform: z.string(),
  executor: z.string(),
  description: z.string(),
  command: z.string(),
  variations: z.array(deployCommandVariationSchema).default([]),
});

/**
 * `app_config` mixes strings, numbers and string arrays (e.g. `app.contact.ftp.port`
 * is a number, `agents.bootstrap_abilities` is an array), so it is accepted loosely
 * here and flattened to strings before it reaches the client.
 */
export const deployCommandsResponseSchema = z.object({
  abilities: z.array(deployCommandAbilitySchema),
  app_config: z.record(z.string(), z.unknown()),
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
  bootstrap_abilities: z.array(z.string()).default([]),
  deployments: z.array(z.string()).default([]),
});

/** The writable subset, mirroring Caldera's own ConfigModal validation. */
export const agentConfigUpdateSchema = z
  .object({
    implant_name: z.string().min(1, "Implant name cannot be empty"),
    sleep_min: z.number().int().nonnegative(),
    sleep_max: z.number().int().nonnegative(),
    watchdog: z.number().int().nonnegative(),
    untrusted_timer: z.number().int().nonnegative(),
  })
  .refine((value) => value.sleep_min <= value.sleep_max, {
    message: "Beacon min must be less than or equal to beacon max",
    path: ["sleep_min"],
  });
