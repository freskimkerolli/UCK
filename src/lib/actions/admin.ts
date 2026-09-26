"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/session";
import { writeModerationLog } from "@/lib/actions/moderation-log";
import { createNotification } from "@/lib/notify";
import type { ActionResult } from "@/lib/actions/auth";

async function applyUserAction(
  moderatorId: string,
  targetUserId: string,
  actionType: "WARN" | "SUSPEND" | "BLOCK_USER" | "UNBLOCK_USER",
  reason: string,
) {
  const statusMap: Record<string, string> = {
    WARN: "WARNED",
    SUSPEND: "SUSPENDED",
    BLOCK_USER: "BLOCKED",
    UNBLOCK_USER: "ACTIVE",
  };
  await prisma.user.update({ where: { id: targetUserId }, data: { status: statusMap[actionType] } });
  await prisma.moderationAction.create({
    data: { moderatorId, targetUserId, actionType, reason },
  });
  await writeModerationLog({
    moderatorId,
    action: actionType,
    targetType: "USER",
    targetId: targetUserId,
    reason,
  });
  if (actionType === "WARN" || actionType === "SUSPEND" || actionType === "BLOCK_USER") {
    await createNotification({
      userId: targetUserId,
      type: "MODERATION_WARNING",
      params: { action: actionType, reason },
    });
  }
}

export async function warnUserAction(targetUserId: string, reason: string): Promise<ActionResult> {
  const mod = await requireModerator();
  await applyUserAction(mod.id, targetUserId, "WARN", reason);
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function suspendUserAction(targetUserId: string, reason: string): Promise<ActionResult> {
  const mod = await requireModerator();
  await applyUserAction(mod.id, targetUserId, "SUSPEND", reason);
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function blockUserAction(targetUserId: string, reason: string): Promise<ActionResult> {
  const mod = await requireModerator();
  await applyUserAction(mod.id, targetUserId, "BLOCK_USER", reason);
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function unblockUserAction(targetUserId: string, reason: string): Promise<ActionResult> {
  const mod = await requireModerator();
  await applyUserAction(mod.id, targetUserId, "UNBLOCK_USER", reason);
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function resolveReportAction(input: {
  reportId: string;
  decision: "DISMISS" | "DELETE_CONTENT" | "WARN_AUTHOR";
  reason: string;
}): Promise<ActionResult> {
  const mod = await requireModerator();
  const report = await prisma.report.findUnique({
    where: { id: input.reportId },
    include: { post: true, comment: true },
  });
  if (!report) {
    const t = await getTranslations("actionErrors");
    return { success: false, error: t("reportNotFound") };
  }

  if (input.decision === "DELETE_CONTENT") {
    if (report.postId) {
      await prisma.post.update({ where: { id: report.postId }, data: { isDeleted: true } });
      await writeModerationLog({ moderatorId: mod.id, action: "DELETE_POST", targetType: "POST", targetId: report.postId, reason: input.reason });
    }
    if (report.commentId) {
      await prisma.comment.update({ where: { id: report.commentId }, data: { isDeleted: true } });
      await writeModerationLog({ moderatorId: mod.id, action: "DELETE_COMMENT", targetType: "COMMENT", targetId: report.commentId, reason: input.reason });
    }
  }

  if (input.decision === "WARN_AUTHOR") {
    const authorId = report.post?.authorId ?? report.comment?.authorId;
    if (authorId) await applyUserAction(mod.id, authorId, "WARN", input.reason);
  }

  await prisma.report.update({
    where: { id: input.reportId },
    data: {
      status: input.decision === "DISMISS" ? "DISMISSED" : "ACTIONED",
      reviewedAt: new Date(),
      reviewedById: mod.id,
    },
  });
  await prisma.moderationAction.create({
    data: {
      moderatorId: mod.id,
      actionType: input.decision === "DISMISS" ? "DISMISS_REPORT" : "DELETE_POST",
      targetPostId: report.postId,
      targetCommentId: report.commentId,
      reportId: report.id,
      reason: input.reason,
    },
  });

  revalidatePath("/admin/reports");
  return { success: true, data: undefined };
}

export async function reviewFlaggedContentAction(input: {
  targetType: "POST" | "COMMENT";
  targetId: string;
  decision: "APPROVE" | "DELETE";
  reason: string;
}): Promise<ActionResult> {
  const mod = await requireModerator();

  if (input.targetType === "POST") {
    await prisma.post.update({
      where: { id: input.targetId },
      data: input.decision === "APPROVE" ? { moderationStatus: "PUBLISHED" } : { isDeleted: true, moderationStatus: "BLOCKED" },
    });
  } else {
    await prisma.comment.update({
      where: { id: input.targetId },
      data: input.decision === "APPROVE" ? { moderationStatus: "PUBLISHED" } : { isDeleted: true, moderationStatus: "BLOCKED" },
    });
  }

  await writeModerationLog({
    moderatorId: mod.id,
    action: input.decision === "APPROVE" ? "APPROVE_CONTENT" : `DELETE_${input.targetType}`,
    targetType: input.targetType,
    targetId: input.targetId,
    reason: input.reason,
  });

  revalidatePath("/admin/flagged");
  return { success: true, data: undefined };
}

export async function deleteCommunityAction(communityId: string, reason: string): Promise<ActionResult> {
  const mod = await requireModerator();
  await prisma.community.delete({ where: { id: communityId } });
  await writeModerationLog({ moderatorId: mod.id, action: "DELETE_COMMUNITY", targetType: "COMMUNITY", targetId: communityId, reason });
  revalidatePath("/admin/communities");
  return { success: true, data: undefined };
}

export async function setMaterialVerificationAction(
  materialId: string,
  status: "VERIFIED" | "UNVERIFIED" | "DISPUTED",
  reason: string,
): Promise<ActionResult> {
  const mod = await requireModerator();
  await prisma.historicalMaterial.update({ where: { id: materialId }, data: { verificationStatus: status, verificationNote: reason } });
  await writeModerationLog({
    moderatorId: mod.id,
    action: `SET_VERIFICATION_${status}`,
    targetType: "HISTORICAL_MATERIAL",
    targetId: materialId,
    reason,
  });
  revalidatePath("/admin/archive");
  return { success: true, data: undefined };
}

export async function deleteMaterialAction(materialId: string, reason: string): Promise<ActionResult> {
  const mod = await requireModerator();
  await prisma.historicalMaterial.delete({ where: { id: materialId } });
  await writeModerationLog({ moderatorId: mod.id, action: "DELETE_MATERIAL", targetType: "HISTORICAL_MATERIAL", targetId: materialId, reason });
  revalidatePath("/admin/archive");
  return { success: true, data: undefined };
}

export async function resolveAppealAction(input: {
  appealId: string;
  decision: "APPROVED" | "REJECTED";
  note: string;
}): Promise<ActionResult> {
  const mod = await requireModerator();
  const appeal = await prisma.appeal.findUnique({ where: { id: input.appealId } });
  if (!appeal) {
    const t = await getTranslations("actionErrors");
    return { success: false, error: t("appealNotFound") };
  }

  if (input.decision === "APPROVED") {
    if (appeal.targetType === "POST") {
      await prisma.post.update({ where: { id: appeal.targetId }, data: { moderationStatus: "PUBLISHED", isDeleted: false } });
    } else {
      await prisma.comment.update({ where: { id: appeal.targetId }, data: { moderationStatus: "PUBLISHED", isDeleted: false } });
    }
  }

  await prisma.appeal.update({
    where: { id: input.appealId },
    data: { status: input.decision, reviewedAt: new Date(), reviewedById: mod.id, reviewNote: input.note },
  });
  await writeModerationLog({
    moderatorId: mod.id,
    action: `APPEAL_${input.decision}`,
    targetType: appeal.targetType as "POST" | "COMMENT",
    targetId: appeal.targetId,
    reason: input.note,
  });

  revalidatePath("/admin/appeals");
  return { success: true, data: undefined };
}
