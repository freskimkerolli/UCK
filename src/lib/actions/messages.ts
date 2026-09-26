"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notify";
import type { ActionResult } from "@/lib/actions/auth";

const ONLINE_WINDOW_MS = 60_000;

export async function heartbeatAction(): Promise<void> {
  const user = await requireCurrentUser();
  await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
}

export async function getMyConversations() {
  const user = await requireCurrentUser();
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: user.id },
    include: {
      conversation: {
        include: {
          participants: {
            where: { userId: { not: user.id } },
            include: { user: { select: { id: true, username: true, lastActiveAt: true, profile: true } } },
          },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return Promise.all(
    participants.map(async (p) => {
      const other = p.conversation.participants[0]?.user;
      const unread = await prisma.message.count({
        where: { conversationId: p.conversationId, senderId: { not: user.id }, createdAt: { gt: p.lastReadAt } },
      });
      return {
        conversationId: p.conversationId,
        other,
        lastMessage: p.conversation.messages[0] ?? null,
        unread,
        online: other ? Date.now() - new Date(other.lastActiveAt).getTime() < ONLINE_WINDOW_MS : false,
      };
    }),
  );
}

export async function findOrCreateConversationAction(otherUsername: string): Promise<ActionResult<{ conversationId: string }>> {
  const user = await requireCurrentUser();
  const t = await getTranslations("actionErrors");
  const other = await prisma.user.findUnique({ where: { username: otherUsername } });
  if (!other) return { success: false, error: t("userNotFound") };
  if (other.id === user.id) return { success: false, error: t("cannotMessageSelf") };

  const blocked = await prisma.blockedUser.findFirst({
    where: {
      OR: [
        { blockerId: user.id, blockedId: other.id },
        { blockerId: other.id, blockedId: user.id },
      ],
    },
  });
  if (blocked) return { success: false, error: t("cannotStartConversationBlocked") };

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [{ participants: { some: { userId: user.id } } }, { participants: { some: { userId: other.id } } }],
    },
  });
  if (existing) return { success: true, data: { conversationId: existing.id } };

  const conversation = await prisma.conversation.create({
    data: { participants: { create: [{ userId: user.id }, { userId: other.id }] } },
  });
  return { success: true, data: { conversationId: conversation.id } };
}

export async function getConversationDetail(conversationId: string) {
  const user = await requireCurrentUser();
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: user.id } },
  });
  if (!membership) return null;

  const [conversation, otherParticipant] = await Promise.all([
    prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { username: true } } } } },
    }),
    prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: { not: user.id } },
      include: { user: { select: { id: true, username: true, lastActiveAt: true, profile: true } } },
    }),
  ]);
  if (!conversation) return null;

  return {
    conversation,
    other: otherParticipant
      ? {
          ...otherParticipant.user,
          isTyping: otherParticipant.isTyping && otherParticipant.typingAt && Date.now() - new Date(otherParticipant.typingAt).getTime() < 5000,
          online: Date.now() - new Date(otherParticipant.user.lastActiveAt).getTime() < ONLINE_WINDOW_MS,
        }
      : null,
  };
}

export async function sendMessageAction(input: { conversationId: string; content: string; imageUrl?: string }): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const t = await getTranslations("actionErrors");
  if (!input.content.trim() && !input.imageUrl) return { success: false, error: t("messageCannotBeEmpty") };

  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: input.conversationId, userId: user.id } },
  });
  if (!membership) return { success: false, error: t("notPartOfConversation") };

  await prisma.message.create({
    data: { conversationId: input.conversationId, senderId: user.id, content: input.content, imageUrl: input.imageUrl },
  });
  await prisma.conversation.update({ where: { id: input.conversationId }, data: { updatedAt: new Date() } });
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId: input.conversationId, userId: user.id } },
    data: { isTyping: false, lastReadAt: new Date() },
  });

  const other = await prisma.conversationParticipant.findFirst({
    where: { conversationId: input.conversationId, userId: { not: user.id } },
  });
  if (other) {
    await createNotification({
      userId: other.userId,
      actorId: user.id,
      type: "MESSAGE",
    });
  }

  revalidatePath("/messages");
  return { success: true, data: undefined };
}

export async function setTypingAction(conversationId: string, isTyping: boolean): Promise<void> {
  const user = await requireCurrentUser();
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    data: { isTyping, typingAt: isTyping ? new Date() : null },
  });
}

export async function markConversationReadAction(conversationId: string): Promise<void> {
  const user = await requireCurrentUser();
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: user.id } },
    data: { lastReadAt: new Date() },
  });
}
