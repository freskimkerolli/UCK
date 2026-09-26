"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import type { ActionResult } from "@/lib/actions/auth";

export async function getMyBlockedUsers(userId: string) {
  return prisma.blockedUser.findMany({
    where: { blockerId: userId },
    include: { blocked: { select: { id: true, username: true, profile: { select: { displayName: true, avatarUrl: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function blockUserByUsernameAction(username: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const t = await getTranslations("actionErrors");
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return { success: false, error: t("userNotFound") };
  if (target.id === user.id) return { success: false, error: t("cannotBlockSelf") };

  await prisma.blockedUser.upsert({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId: target.id } },
    update: {},
    create: { blockerId: user.id, blockedId: target.id },
  });
  await prisma.follow.deleteMany({
    where: {
      OR: [
        { followerId: user.id, followingId: target.id },
        { followerId: target.id, followingId: user.id },
      ],
    },
  });
  revalidatePath("/settings");
  return { success: true, data: undefined };
}

export async function unblockUserAction(blockedId: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  await prisma.blockedUser.deleteMany({ where: { blockerId: user.id, blockedId } });
  revalidatePath("/settings");
  return { success: true, data: undefined };
}
