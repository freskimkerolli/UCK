import { prisma } from "@/lib/prisma";

export async function globalSearch(query: string) {
  const q = query.trim();
  if (!q) return { users: [], posts: [], hashtags: [], materials: [], communities: [], events: [] };

  const [users, posts, hashtags, materials, communities, events] = await Promise.all([
    prisma.user.findMany({
      where: { OR: [{ username: { contains: q } }, { profile: { displayName: { contains: q } } }] },
      include: { profile: true },
      take: 8,
    }),
    prisma.post.findMany({
      where: { content: { contains: q }, isDeleted: false, moderationStatus: { in: ["PUBLISHED", "PENDING_REVIEW"] } },
      include: { author: { include: { profile: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.hashtag.findMany({ where: { tag: { contains: q.toLowerCase() } }, take: 8 }),
    prisma.historicalMaterial.findMany({ where: { title: { contains: q } }, take: 8 }),
    prisma.community.findMany({ where: { name: { contains: q } }, take: 8, include: { _count: { select: { members: true } } } }),
    prisma.event.findMany({ where: { title: { contains: q } }, take: 8 }),
  ]);

  return { users, posts, hashtags, materials, communities, events };
}

export async function getPostsByHashtag(tag: string, currentUserId: string) {
  return prisma.post.findMany({
    where: {
      isDeleted: false,
      moderationStatus: { in: ["PUBLISHED", "PENDING_REVIEW"] },
      hashtags: { some: { hashtag: { tag: tag.toLowerCase() } } },
    },
    include: {
      author: { select: { id: true, username: true, role: true, profile: true } },
      community: { select: { id: true, name: true, slug: true } },
      historicalMaterial: { select: { id: true, title: true, type: true, verificationStatus: true } },
      hashtags: { include: { hashtag: true } },
      _count: { select: { likes: true, comments: true, saves: true } },
      likes: { where: { userId: currentUserId }, select: { id: true } },
      saves: { where: { userId: currentUserId }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}
