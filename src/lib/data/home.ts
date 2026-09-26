import { prisma } from "@/lib/prisma";

/**
 * Real, DB-backed counts for the home feed's stats ribbon — deliberately not
 * hardcoded "impressive" numbers. On a fresh install these will be small and
 * that's correct: the ribbon should reflect actual archive content, not
 * simulate adoption that hasn't happened.
 */
export async function getHomeStats() {
  const [verifiedMaterials, testimonies, communities] = await Promise.all([
    prisma.historicalMaterial.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.historicalMaterial.count({ where: { type: { in: ["TESTIMONY", "INTERVIEW"] } } }),
    prisma.community.count(),
  ]);
  return { verifiedMaterials, testimonies, communities };
}

/** Most recently added historical events — framed honestly as "latest additions
 * to the record," not "on this day," since our event dates are often
 * approximate free text and can't reliably be matched to today's calendar date. */
export async function getLatestEvents(limit = 3) {
  return prisma.event.findMany({
    include: { material: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
