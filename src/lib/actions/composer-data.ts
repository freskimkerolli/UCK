"use server";

import { prisma } from "@/lib/prisma";

export async function searchHistoricalMaterialsForPicker(query = "") {
  return prisma.historicalMaterial.findMany({
    where: query ? { title: { contains: query } } : undefined,
    select: { id: true, title: true, type: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
