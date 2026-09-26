import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/lib/types";

interface CreateNotificationInput {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  // Locale-independent data needed to render the notification text at view
  // time, in the viewer's own locale (e.g. { action: "SUSPEND", reason }).
  // Types where the actor relation alone is enough (FOLLOW/LIKE/COMMENT/...)
  // don't need this.
  params?: Record<string, string>;
  postId?: string;
  commentId?: string;
  communityId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  if (input.actorId && input.actorId === input.userId) return null; // don't notify yourself
  return prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId ?? null,
      type: input.type,
      paramsJson: input.params ? JSON.stringify(input.params) : null,
      postId: input.postId,
      commentId: input.commentId,
      communityId: input.communityId,
    },
  });
}
