"use server";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { reportSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/auth";

export async function createReportAction(input: unknown): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const t = await getTranslations("actionErrors");
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: t("invalidData") };
  const { postId, commentId, reason, description } = parsed.data;

  if (!postId && !commentId) return { success: false, error: t("reportTargetMissing") };

  await prisma.report.create({
    data: { reporterId: user.id, postId, commentId, reason, description },
  });

  return { success: true, data: undefined };
}
