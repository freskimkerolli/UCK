import { prisma } from "@/lib/prisma";

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    include: {
      actor: { select: { username: true, profile: { select: { displayName: true, avatarUrl: true } } } },
      community: { select: { slug: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
