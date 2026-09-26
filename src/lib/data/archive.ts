import { prisma } from "@/lib/prisma";

const MATERIAL_INCLUDE = {
  contributor: { select: { username: true, profile: { select: { displayName: true, avatarUrl: true } } } },
  tags: { include: { hashtag: true } },
};

export async function getArchiveMaterials(filters?: { type?: string; query?: string }) {
  return prisma.historicalMaterial.findMany({
    where: {
      ...(filters?.type && filters.type !== "ALL" ? { type: filters.type } : {}),
      ...(filters?.query ? { title: { contains: filters.query } } : {}),
    },
    include: MATERIAL_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function getMaterialById(id: string) {
  return prisma.historicalMaterial.findUnique({
    where: { id },
    include: MATERIAL_INCLUDE,
  });
}

export async function getTimelineEvents() {
  return prisma.event.findMany({
    include: { material: { select: { id: true, title: true } } },
    orderBy: { eventDate: "asc" },
  });
}
