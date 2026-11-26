import { PrismaClient } from "./src";

/**
 * Example assessment plans for a fresh install. Only inserted when the table
 * is empty, so re-seeding never overwrites plans an operator created. The
 * plans reference real abilities from the library; they have no run history.
 */
const EXAMPLES = [
  { name: "충전기 운영환경 방어 성능 평가", target: "CSMS, CP", repeatCount: 2, tactic: "discovery", take: 11 },
  { name: "충전기 보안성능 평가", target: "CP", repeatCount: 1, tactic: "credential-access", take: 4 },
];

export async function seedAssessments(prisma: PrismaClient) {
  if ((await prisma.assessment.count()) > 0) return;
  for (const example of EXAMPLES) {
    const abilities = await prisma.ability.findMany({
      where: { tactic: example.tactic, platform: { contains: "linux" } },
      select: { ability_id: true },
      orderBy: { ability_name: "asc" },
      take: example.take,
    });
    await prisma.assessment.create({
      data: {
        name: example.name,
        target: example.target,
        repeatCount: example.repeatCount,
        abilityIds: abilities.map((a) => a.ability_id),
        agentPaws: [],
      },
    });
  }
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedAssessments(prisma)
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
