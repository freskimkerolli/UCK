"use server";

import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import type { ActionResult } from "@/lib/actions/auth";

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  profileVisibility: z.enum(["PUBLIC", "FOLLOWERS", "PRIVATE"]).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  notifyFollow: z.boolean().optional(),
  notifyLike: z.boolean().optional(),
  notifyComment: z.boolean().optional(),
  notifyMention: z.boolean().optional(),
  notifyMessage: z.boolean().optional(),
  notifyCommunity: z.boolean().optional(),
  showSensitiveHistorical: z.boolean().optional(),
});

export async function updateSettingsAction(input: unknown): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    const t = await getTranslations("actionErrors");
    return { success: false, error: t("invalidData") };
  }

  await prisma.userSettings.update({ where: { userId: user.id }, data: parsed.data });
  return { success: true, data: undefined };
}
