"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notify";
import type { ActionResult } from "@/lib/actions/auth";

export async function toggleFollowAction(targetUserId: string): Promise<ActionResult<{ following: boolean }>> {
  const user = await requireCurrentUser();
  if (user.id === targetUserId) {
    const t = await getTranslations("actionErrors");
    return { success: false, error: t("cannotFollowSelf") };
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    revalidatePath("/profile");
    return { success: true, data: { following: false } };
  }

  await prisma.follow.create({ data: { followerId: user.id, followingId: targetUserId } });
  await createNotification({
    userId: targetUserId,
    actorId: user.id,
    type: "FOLLOW",
  });
  revalidatePath("/profile");
  return { success: true, data: { following: true } };
}
