"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import type { ActionResult } from "@/lib/actions/auth";

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const user = await requireCurrentUser();
  await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { isRead: true } });
  revalidatePath("/notifications");
  return { success: true, data: undefined };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await requireCurrentUser();
  await prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  revalidatePath("/notifications");
  return { success: true, data: undefined };
}
