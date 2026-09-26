"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { createCommentSchema } from "@/lib/validations";
import { moderateText } from "@/lib/moderation";
import { writeModerationLog } from "@/lib/actions/moderation-log";
import { createNotification } from "@/lib/notify";
import type { ActionResult } from "@/lib/actions/auth";

const COMMENT_INCLUDE = (userId: string) => ({
  author: { select: { id: true, username: true, profile: true } },
  likes: { where: { userId }, select: { id: true } },
  _count: { select: { likes: true, replies: true } },
});

export async function getCommentsForPost(postId: string) {
  const user = await requireCurrentUser();
  const currentUserId = user.id;
  const comments = await prisma.comment.findMany({
    where: {
      postId,
      isDeleted: false,
      OR: [{ moderationStatus: { in: ["PUBLISHED", "PENDING_REVIEW"] } }, { authorId: currentUserId }],
    },
    include: {
      ...COMMENT_INCLUDE(currentUserId),
      replies: {
        where: { isDeleted: false },
        include: COMMENT_INCLUDE(currentUserId),
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return comments.filter((c) => !c.parentId);
}

export async function createCommentAction(input: unknown): Promise<
  ActionResult<{ commentId: string; moderation: "ALLOW" | "WARNING" | "BLOCK"; userMessage: string | null }>
> {
  const user = await requireCurrentUser();
  const [tValidation, tErrors, tModeration] = await Promise.all([
    getTranslations("validation"),
    getTranslations("actionErrors"),
    getTranslations("moderation"),
  ]);
  const parsed = createCommentSchema(tValidation).safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? tErrors("invalidData") };
  const data = parsed.data;

  const post = await prisma.post.findUnique({ where: { id: data.postId } });
  if (!post || post.isDeleted) return { success: false, error: tErrors("postNotFound") };

  const verdict = moderateText(data.content, tModeration);
  const moderationStatus =
    verdict.action === "BLOCK" ? "BLOCKED" : verdict.action === "WARNING" ? "PENDING_REVIEW" : "PUBLISHED";

  const comment = await prisma.comment.create({
    data: {
      postId: data.postId,
      authorId: user.id,
      parentId: data.parentId || null,
      content: data.content,
      moderationStatus,
      moderationCategory: verdict.category,
      moderationReason: verdict.reason,
    },
  });

  if (verdict.action !== "ALLOW") {
    await writeModerationLog({
      moderatorId: null,
      action: verdict.action === "BLOCK" ? "AUTO_BLOCK_COMMENT" : "AUTO_FLAG_COMMENT_FOR_REVIEW",
      targetType: "COMMENT",
      targetId: comment.id,
      reason: verdict.reason,
    });
  }

  if (verdict.action !== "BLOCK") {
    if (data.parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: data.parentId } });
      if (parent) {
        await createNotification({
          userId: parent.authorId,
          actorId: user.id,
          type: "REPLY",
          postId: data.postId,
          commentId: comment.id,
        });
      }
    } else {
      await createNotification({
        userId: post.authorId,
        actorId: user.id,
        type: "COMMENT",
        postId: data.postId,
        commentId: comment.id,
      });
    }
  }

  revalidatePath("/home");
  return {
    success: true,
    data: { commentId: comment.id, moderation: verdict.action, userMessage: verdict.userMessage },
  };
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const tErrors = await getTranslations("actionErrors");
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { success: false, error: tErrors("commentNotFound") };
  const isOwner = comment.authorId === user.id;
  const isModerator = user.role === "ADMIN" || user.role === "MODERATOR";
  if (!isOwner && !isModerator) return { success: false, error: tErrors("noPermissionDeleteComment") };

  await prisma.comment.update({ where: { id: commentId }, data: { isDeleted: true } });

  if (!isOwner && isModerator) {
    const tAudit = await getTranslations("auditLog");
    await writeModerationLog({
      moderatorId: user.id,
      action: "DELETE_COMMENT",
      targetType: "COMMENT",
      targetId: commentId,
      reason: tAudit("deletedByModerator"),
    });
  }

  revalidatePath("/home");
  return { success: true, data: undefined };
}

export async function toggleCommentLikeAction(commentId: string): Promise<ActionResult<{ liked: boolean }>> {
  const user = await requireCurrentUser();
  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId: user.id } },
  });
  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
    return { success: true, data: { liked: false } };
  }
  await prisma.commentLike.create({ data: { commentId, userId: user.id } });
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (comment && comment.authorId !== user.id) {
    await createNotification({
      userId: comment.authorId,
      actorId: user.id,
      type: "LIKE",
      postId: comment.postId,
      commentId,
    });
  }
  return { success: true, data: { liked: true } };
}
