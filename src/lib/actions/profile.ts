"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";
import { editProfileSchema, createChangePasswordSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/auth";
import bcrypt from "bcryptjs";

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const tErrors = await getTranslations("actionErrors");
  const parsed = editProfileSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? tErrors("invalidData") };

  await prisma.profile.update({ where: { userId: user.id }, data: parsed.data });
  revalidatePath(`/profile/${user.username}`);
  return { success: true, data: undefined };
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const [tValidation, tErrors] = await Promise.all([getTranslations("validation"), getTranslations("actionErrors")]);
  const parsed = createChangePasswordSchema(tValidation).safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? tErrors("invalidData") };

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { success: false, error: tErrors("currentPasswordWrong") };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { success: true, data: undefined };
}

export async function deleteAccountAction(): Promise<ActionResult> {
  const user = await requireCurrentUser();
  await prisma.user.delete({ where: { id: user.id } });
  return { success: true, data: undefined };
}
