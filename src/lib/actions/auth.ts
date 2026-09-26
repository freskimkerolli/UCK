"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  createSignUpSchema,
  createForgotPasswordSchema,
  createResetPasswordSchema,
  createLoginSchema,
} from "@/lib/validations";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const RESET_TTL_MS = 1000 * 60 * 30; // 30min

function genToken() {
  return randomBytes(32).toString("hex");
}

export async function signUpAction(
  input: unknown,
): Promise<ActionResult<{ email: string; devVerifyUrl: string }>> {
  const [tValidation, tErrors, tMail] = await Promise.all([
    getTranslations("validation"),
    getTranslations("actionErrors"),
    getTranslations("mail"),
  ]);

  const parsed = createSignUpSchema(tValidation).safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: tErrors("invalidData"), fieldErrors };
  }

  const { displayName, username, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: normalizedEmail } }),
    prisma.user.findUnique({ where: { username } }),
  ]);
  if (existingEmail) {
    return {
      success: false,
      error: tErrors("emailAlreadyUsed"),
      fieldErrors: { email: tErrors("emailExists") },
    };
  }
  if (existingUsername) {
    return {
      success: false,
      error: tErrors("usernameTaken"),
      fieldErrors: { username: tErrors("usernameTakenShort") },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      username,
      passwordHash,
      profile: { create: { displayName } },
      settings: { create: {} },
    },
  });

  const token = genToken();
  await prisma.verificationToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS) },
  });
  const mail = sendVerificationEmail(user.email, token, tMail("verifyEmailSubject"));

  return { success: true, data: { email: user.email, devVerifyUrl: mail.actionUrl } };
}

/**
 * Runs the same checks as auth.ts's authorize() but returns a specific error
 * code (INVALID_CREDENTIALS / EMAIL_NOT_VERIFIED / ACCOUNT_BLOCKED /
 * ACCOUNT_SUSPENDED) so the login form can show precise feedback. The actual
 * signIn() call happens client-side afterwards.
 */
export async function loginPrecheckAction(input: unknown): Promise<ActionResult> {
  const t = await getTranslations("validation");
  const parsed = createLoginSchema(t).safeParse(input);
  if (!parsed.success) return { success: false, error: "INVALID_CREDENTIALS" };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) return { success: false, error: "INVALID_CREDENTIALS" };

  const passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordOk) return { success: false, error: "INVALID_CREDENTIALS" };

  if (!user.emailVerified) return { success: false, error: "EMAIL_NOT_VERIFIED" };
  if (user.status === "BLOCKED") return { success: false, error: "ACCOUNT_BLOCKED" };
  if (user.status === "SUSPENDED") return { success: false, error: "ACCOUNT_SUSPENDED" };

  return { success: true, data: undefined };
}

export async function verifyEmailAction(token: string): Promise<ActionResult<{ email: string }>> {
  const t = await getTranslations("actionErrors");
  if (!token) return { success: false, error: t("tokenMissing") };

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return { success: false, error: t("verificationLinkInvalid") };
  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return { success: false, error: t("verificationLinkExpired") };
  }

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { userId: record.userId } });

  const tAudit = await getTranslations("auditLog");
  await prisma.moderationLog.create({
    data: {
      moderatorId: null,
      action: "EMAIL_VERIFIED",
      targetType: "USER",
      targetId: user.id,
      reason: tAudit("emailVerifiedAuto"),
    },
  });

  return { success: true, data: { email: user.email } };
}

export async function resendVerificationAction(email: string): Promise<ActionResult<{ devVerifyUrl: string }>> {
  const [t, tMail] = await Promise.all([getTranslations("actionErrors"), getTranslations("mail")]);
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { success: false, error: t("userNotFoundByEmail") };
  if (user.emailVerified) return { success: false, error: t("emailAlreadyVerified") };

  await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
  const token = genToken();
  await prisma.verificationToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS) },
  });
  const mail = sendVerificationEmail(user.email, token, tMail("verifyEmailSubject"));
  return { success: true, data: { devVerifyUrl: mail.actionUrl } };
}

export async function requestPasswordResetAction(
  input: unknown,
): Promise<ActionResult<{ devResetUrl: string | null }>> {
  const [tValidation, tErrors, tMail] = await Promise.all([
    getTranslations("validation"),
    getTranslations("actionErrors"),
    getTranslations("mail"),
  ]);
  const parsed = createForgotPasswordSchema(tValidation).safeParse(input);
  if (!parsed.success) return { success: false, error: tErrors("emailInvalid") };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // Always report success to avoid leaking which emails are registered.
  if (!user) return { success: true, data: { devResetUrl: null } };

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const token = genToken();
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });
  const mail = sendPasswordResetEmail(user.email, token, tMail("resetPasswordSubject"));
  return { success: true, data: { devResetUrl: mail.actionUrl } };
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const [tValidation, tErrors] = await Promise.all([getTranslations("validation"), getTranslations("actionErrors")]);
  const parsed = createResetPasswordSchema(tValidation).safeParse(input);
  if (!parsed.success) return { success: false, error: tErrors("invalidData") };

  const { token, password } = parsed.data;
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt) return { success: false, error: tErrors("resetLinkInvalidOrUsed") };
  if (record.expiresAt < new Date()) return { success: false, error: tErrors("resetLinkExpired") };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { success: true, data: undefined };
}
