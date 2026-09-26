"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { createPostComposerSchema } from "@/lib/validations";
import { moderateText } from "@/lib/moderation";
import { extractHashtags, connectHashtags } from "@/lib/hashtags";
import { writeModerationLog } from "@/lib/actions/moderation-log";
import type { ActionResult } from "@/lib/actions/auth";

export async function createPostAction(input: unknown): Promise<
  ActionResult<{ postId: string; moderation: "ALLOW" | "WARNING" | "BLOCK"; userMessage: string | null }>
> {
  const user = await requireCurrentUser();
  const [tValidation, tErrors, tModeration] = await Promise.all([
    getTranslations("validation"),
    getTranslations("actionErrors"),
    getTranslations("moderation"),
  ]);
  const parsed = createPostComposerSchema(tValidation).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? tErrors("invalidData") };
  }
  const data = parsed.data;

  const verdict = moderateText(data.content, tModeration);
  const moderationStatus =
    verdict.action === "BLOCK" ? "BLOCKED" : verdict.action === "WARNING" ? "PENDING_REVIEW" : "PUBLISHED";

  if (data.communityId) {
    const membership = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: data.communityId, userId: user.id } },
    });
    if (!membership) {
      return { success: false, error: tErrors("mustBeMemberToPost") };
    }
  }

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      content: data.content,
      mediaUrls: JSON.stringify(data.mediaUrls ?? []),
      mediaType: data.mediaType ?? null,
      documentName: data.documentName,
      locationLabel: data.locationLabel,
      communityId: data.communityId || null,
      historicalMaterialId: data.historicalMaterialId || null,
      moderationStatus,
      moderationCategory: verdict.category,
      moderationReason: verdict.reason,
    },
  });

  const tags = extractHashtags(data.content, data.hashtags);
  if (tags.length > 0) {
    const hashtags = await connectHashtags(tags);
    await prisma.postHashtag.createMany({
      data: hashtags.map((h) => ({ postId: post.id, hashtagId: h.id })),
    });
  }

  if (verdict.action !== "ALLOW") {
    await writeModerationLog({
      moderatorId: null,
      action: verdict.action === "BLOCK" ? "AUTO_BLOCK_POST" : "AUTO_FLAG_POST_FOR_REVIEW",
      targetType: "POST",
      targetId: post.id,
      reason: verdict.reason,
    });
  }

  revalidatePath("/home");
  return {
    success: true,
    data: { postId: post.id, moderation: verdict.action, userMessage: verdict.userMessage },
  };
}

export async function editPostAction(postId: string, content: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const tErrors = await getTranslations("actionErrors");
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.isDeleted) return { success: false, error: tErrors("postNotFound") };
  if (post.authorId !== user.id) return { success: false, error: tErrors("cannotEditPost") };

  const tModeration = await getTranslations("moderation");
  const verdict = moderateText(content, tModeration);
  const moderationStatus =
    verdict.action === "BLOCK" ? "BLOCKED" : verdict.action === "WARNING" ? "PENDING_REVIEW" : "PUBLISHED";

  await prisma.post.update({
    where: { id: postId },
    data: {
      content,
      isEdited: true,
      moderationStatus,
      moderationCategory: verdict.category,
      moderationReason: verdict.reason,
    },
  });

  if (verdict.action !== "ALLOW") {
    await writeModerationLog({
      moderatorId: null,
      action: verdict.action === "BLOCK" ? "AUTO_BLOCK_POST" : "AUTO_FLAG_POST_FOR_REVIEW",
      targetType: "POST",
      targetId: postId,
      reason: verdict.reason,
    });
  }

  revalidatePath("/home");
  return { success: true, data: undefined };
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const tErrors = await getTranslations("actionErrors");
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { success: false, error: tErrors("postNotFound") };
  const isOwner = post.authorId === user.id;
  const isModerator = user.role === "ADMIN" || user.role === "MODERATOR";
  if (!isOwner && !isModerator) return { success: false, error: tErrors("noPermissionDeletePost") };

  await prisma.post.update({ where: { id: postId }, data: { isDeleted: true } });

  if (!isOwner && isModerator) {
    const tAudit = await getTranslations("auditLog");
    await writeModerationLog({
      moderatorId: user.id,
      action: "DELETE_POST",
      targetType: "POST",
      targetId: postId,
      reason: tAudit("deletedByModerator"),
    });
  }

  revalidatePath("/home");
  return { success: true, data: undefined };
}

export async function togglePostLikeAction(postId: string): Promise<ActionResult<{ liked: boolean }>> {
  const user = await requireCurrentUser();
  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    revalidatePath("/home");
    return { success: true, data: { liked: false } };
  }

  await prisma.postLike.create({ data: { postId, userId: user.id, reaction: "NDERIM" } });
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post && post.authorId !== user.id) {
    const { createNotification } = await import("@/lib/notify");
    await createNotification({
      userId: post.authorId,
      actorId: user.id,
      type: "LIKE",
      postId,
    });
  }
  revalidatePath("/home");
  return { success: true, data: { liked: true } };
}

export async function toggleSavePostAction(postId: string): Promise<ActionResult<{ saved: boolean }>> {
  const user = await requireCurrentUser();
  const existing = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });
  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
    revalidatePath("/saved");
    return { success: true, data: { saved: false } };
  }
  await prisma.savedPost.create({ data: { userId: user.id, postId } });
  revalidatePath("/saved");
  return { success: true, data: { saved: true } };
}
