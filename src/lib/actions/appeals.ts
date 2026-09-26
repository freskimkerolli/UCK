"use server";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { createAppealSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/auth";

export async function createAppealAction(input: unknown): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const [tValidation, tErrors] = await Promise.all([getTranslations("validation"), getTranslations("actionErrors")]);
  const parsed = createAppealSchema(tValidation).safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? tErrors("invalidData") };
  const { targetType, targetId, reason } = parsed.data;

  const existingPending = await prisma.appeal.findFirst({ where: { targetId, status: "PENDING" } });
  if (existingPending) return { success: false, error: tErrors("appealAlreadyPending") };

  let contentSnapshot = "";
  if (targetType === "POST") {
    const post = await prisma.post.findUnique({ where: { id: targetId } });
    if (!post || post.authorId !== user.id) return { success: false, error: tErrors("cannotAppealPost") };
    contentSnapshot = post.content;
  } else {
    const comment = await prisma.comment.findUnique({ where: { id: targetId } });
    if (!comment || comment.authorId !== user.id) return { success: false, error: tErrors("cannotAppealComment") };
    contentSnapshot = comment.content;
  }

  await prisma.appeal.create({
    data: { userId: user.id, targetType, targetId, contentSnapshot, reason },
  });

  return { success: true, data: undefined };
}

export async function getMyAppeals(userId: string) {
  return prisma.appeal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getMyBlockedContent(userId: string) {
  const [posts, comments] = await Promise.all([
    prisma.post.findMany({ where: { authorId: userId, moderationStatus: "BLOCKED" }, orderBy: { createdAt: "desc" } }),
    prisma.comment.findMany({ where: { authorId: userId, moderationStatus: "BLOCKED" }, orderBy: { createdAt: "desc" } }),
  ]);
  return { posts, comments };
}
