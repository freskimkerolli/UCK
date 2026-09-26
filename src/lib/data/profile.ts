import { prisma } from "@/lib/prisma";

export async function getProfileByUsername(username: string, viewerId: string | null) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
  if (!user) return null;

  const isFollowing = viewerId
    ? !!(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
      }))
    : false;

  return { user, isFollowing, isOwnProfile: viewerId === user.id };
}
