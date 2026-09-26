import { prisma } from "@/lib/prisma";

export async function getCommunities(filters?: { category?: string; query?: string }) {
  return prisma.community.findMany({
    where: {
      ...(filters?.category && filters.category !== "ALL" ? { category: filters.category } : {}),
      ...(filters?.query ? { name: { contains: filters.query } } : {}),
    },
    include: { _count: { select: { members: true, posts: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecommendedCommunities(userId: string, limit = 3) {
  return prisma.community.findMany({
    where: { members: { none: { userId } } },
    include: { _count: { select: { members: true, posts: true } } },
    orderBy: { members: { _count: "desc" } },
    take: limit,
  });
}

export async function getCommunityBySlug(slug: string, viewerId: string) {
  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true, posts: true } },
      createdBy: { select: { username: true, profile: { select: { displayName: true } } } },
    },
  });
  if (!community) return null;

  const membership = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: community.id, userId: viewerId } },
  });

  return { community, membership };
}
