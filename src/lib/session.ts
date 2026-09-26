import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, settings: true },
  });
  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireModerator() {
  const user = await requireCurrentUser();
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") throw new Error("FORBIDDEN");
  return user;
}

export async function isFollowing(followerId: string, followingId: string) {
  if (followerId === followingId) return false;
  const rel = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!rel;
}
