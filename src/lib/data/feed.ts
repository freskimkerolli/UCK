import { prisma } from "@/lib/prisma";

const POST_INCLUDE = (currentUserId: string) => ({
  author: { select: { id: true, username: true, role: true, profile: true } },
  community: { select: { id: true, name: true, slug: true } },
  historicalMaterial: { select: { id: true, title: true, type: true, verificationStatus: true } },
  hashtags: { include: { hashtag: true } },
  _count: { select: { likes: true, comments: true, saves: true } },
  likes: { where: { userId: currentUserId }, select: { id: true } },
  saves: { where: { userId: currentUserId }, select: { id: true } },
});

export type FeedPost = Awaited<ReturnType<typeof getFeedPosts>>[number];

function visibilityWhere(currentUserId: string) {
  return {
    isDeleted: false,
    OR: [{ moderationStatus: { in: ["PUBLISHED", "PENDING_REVIEW"] } }, { authorId: currentUserId }],
  };
}

export const FEED_FILTERS = ["ALL", "HISTORICAL", "MEDIA", "DOCUMENTS"] as const;
export type FeedFilter = (typeof FEED_FILTERS)[number];

function feedFilterWhere(filter?: FeedFilter) {
  switch (filter) {
    case "HISTORICAL":
      return { historicalMaterialId: { not: null } };
    case "MEDIA":
      return { mediaType: { in: ["PHOTO", "VIDEO"] } };
    case "DOCUMENTS":
      return { mediaType: "DOCUMENT" };
    default:
      return {};
  }
}

export async function getFeedPosts(
  currentUserId: string,
  opts?: { take?: number; skip?: number; filter?: FeedFilter },
) {
  return prisma.post.findMany({
    where: { communityId: null, ...visibilityWhere(currentUserId), ...feedFilterWhere(opts?.filter) },
    include: POST_INCLUDE(currentUserId),
    orderBy: { createdAt: "desc" },
    take: opts?.take ?? 20,
    skip: opts?.skip ?? 0,
  });
}

export async function getCommunityPosts(communityId: string, currentUserId: string, opts?: { take?: number }) {
  return prisma.post.findMany({
    where: { communityId, ...visibilityWhere(currentUserId) },
    include: POST_INCLUDE(currentUserId),
    orderBy: { createdAt: "desc" },
    take: opts?.take ?? 20,
  });
}

export async function getUserPosts(authorId: string, currentUserId: string, opts?: { mediaOnly?: boolean }) {
  return prisma.post.findMany({
    where: {
      authorId,
      ...visibilityWhere(currentUserId),
      ...(opts?.mediaOnly ? { mediaType: { not: null } } : {}),
    },
    include: POST_INCLUDE(currentUserId),
    orderBy: { createdAt: "desc" },
  });
}

export async function getSavedPosts(userId: string) {
  const saved = await prisma.savedPost.findMany({
    where: { userId },
    include: { post: { include: POST_INCLUDE(userId) } },
    orderBy: { createdAt: "desc" },
  });
  return saved.map((s) => s.post).filter((p) => !p.isDeleted && p.moderationStatus !== "BLOCKED");
}

export async function getPostById(postId: string, currentUserId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: POST_INCLUDE(currentUserId),
  });
}
