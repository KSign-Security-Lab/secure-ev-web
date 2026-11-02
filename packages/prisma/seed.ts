import { PrismaClient } from "./src";
import seed from "./data/data.json";
import mitre from "./data/mitre_list.json";

const filterX = (data: string): string => {
  if (data === "x" || data === "X") {
    return "";
  }
  return data;
};

const prisma = new PrismaClient();
async function main() {
  await prisma.ability.deleteMany();
  await prisma.mitre.deleteMany();

  await prisma.ability.createMany({
    data: seed.map((attack) => ({
      ability_id: attack.id,
      ability_name: attack.ability_name,
      tactic: filterX(attack.tactic),
      technique_id: filterX(attack.technique_id),
      technique_name: filterX(attack.technique_name),
      payload: filterX(attack.payloads),
      platform: filterX(attack.platform),
      command: filterX(attack.command),
      shell_type: filterX(attack.shell_type ?? ""),
      type: filterX(attack.type ?? ""),
      description: filterX(attack.description ?? ""),
    })),
  });
  await prisma.mitre.createMany({
    // Built by scripts/import_mitre.py: one row per (tactic, technique) and per
    // (tactic, sub-technique) of the Enterprise matrix.
    data: mitre.map((row) => ({
      tactic: row.tactic,
      tactic_name: row.tactic_name,
      tactic_order: row.tactic_order,
      technique_id: row.technique_id,
      technique_name: row.technique_name,
      subtechnique_id: row.subtechnique_id ?? null,
      subtechnique_name: row.subtechnique_name ?? null,
      platform: "Enterprise",
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
