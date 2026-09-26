import { prisma } from "@/lib/prisma";

export async function getMyCommunitiesForComposer(userId: string) {
  const memberships = await prisma.communityMember.findMany({
    where: { userId },
    include: { community: { select: { id: true, name: true, slug: true } } },
    orderBy: { joinedAt: "desc" },
  });
  return memberships.map((m) => m.community);
}

export async function getUnreadCounts(userId: string) {
  const [notifications, conversations] = await Promise.all([
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.conversationParticipant.findMany({
      where: { userId },
      select: {
        lastReadAt: true,
        conversationId: true,
      },
    }),
  ]);

  let unreadMessages = 0;
  if (conversations.length > 0) {
    const counts = await Promise.all(
      conversations.map((c) =>
        prisma.message.count({
          where: {
            conversationId: c.conversationId,
            senderId: { not: userId },
            createdAt: { gt: c.lastReadAt },
          },
        }),
      ),
    );
    unreadMessages = counts.reduce((a, b) => a + b, 0);
  }

  return { notifications, messages: unreadMessages };
}
