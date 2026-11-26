import type { AttackDataItem, AttackExecutor } from "~/types/defend";

export interface AbilityForm {
  ability_name: string;
  description: string;
  status: "ACTIVE" | "DISABLED";
  threat_groups: string[];
  cves: string[];
}

export const toAbilityForm = (data: AttackDataItem): AbilityForm => ({
  ability_name: data.ability_name ?? "",
  description: data.description ?? "",
  status: data.status === "DISABLED" ? "DISABLED" : "ACTIVE",
  threat_groups: [...(data.threat_groups ?? [])],
  cves: [...(data.cves ?? [])],
});

export const isFormDirty = (a: AbilityForm, b: AbilityForm) =>
  JSON.stringify(a) !== JSON.stringify(b);

/**
 * Abilities store a single executor inline (platform / shell / command /
 * payload). Build the executor list from those fields when none is attached.
 */
export const executorsOf = (data: AttackDataItem): AttackExecutor[] => {
  if (data.executors?.length) return data.executors;
  if (!data.command && !data.payload) return [];
  return [
    {
      platform: data.platform,
      shell: data.shell_type,
      command: data.command,
      payloads: data.payload ? data.payload.split(/\r?\n/).filter(Boolean) : [],
      timeout: 60,
      cleanup: 0,
    },
  ];
};
