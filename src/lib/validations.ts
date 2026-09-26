import { z } from "zod";

// Every schema below that needs a user-facing error message is built via a
// factory taking a translator `t` scoped to the "validation" namespace, so
// the message is produced in the caller's active locale instead of being
// hardcoded. Schemas with no custom messages (just shape/length limits) stay
// as plain exported constants.

type T = (key: string) => string;

const usernameRegex = /^[a-zA-Z0-9_.]{3,24}$/;

function strongPasswordSchema(t: T) {
  return z
    .string()
    .min(8, t("passwordMinLength"))
    .regex(/[a-zA-Z]/, t("passwordLetter"))
    .regex(/[0-9]/, t("passwordNumber"));
}

export function createSignUpSchema(t: T) {
  return z
    .object({
      displayName: z.string().min(2, t("displayNameMinLength")).max(60),
      username: z.string().regex(usernameRegex, t("usernameFormat")),
      email: z.email(t("emailInvalid")),
      password: strongPasswordSchema(t),
      confirmPassword: z.string(),
      acceptTerms: z.literal(true, { error: t("acceptTermsRequired") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type SignUpInput = z.infer<ReturnType<typeof createSignUpSchema>>;

export function createLoginSchema(t: T) {
  return z.object({
    email: z.email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")),
  });
}
export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export function createForgotPasswordSchema(t: T) {
  return z.object({
    email: z.email(t("emailInvalid")),
  });
}
export type ForgotPasswordInput = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export function createResetPasswordSchema(t: T) {
  return z
    .object({
      token: z.string().min(1),
      password: strongPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type ResetPasswordInput = z.infer<ReturnType<typeof createResetPasswordSchema>>;

export const editProfileSchema = z.object({
  displayName: z.string().min(2).max(60),
  bio: z.string().max(280).default(""),
  location: z.string().max(80).default(""),
  website: z.string().max(120).default(""),
  avatarUrl: z.string().max(300).default(""),
  coverUrl: z.string().max(300).default(""),
});
export type EditProfileInput = z.infer<typeof editProfileSchema>;

export function createPostComposerSchema(t: T) {
  return z.object({
    content: z.string().min(1, t("postContentRequired")).max(4000),
    mediaType: z.enum(["PHOTO", "VIDEO", "DOCUMENT"]).nullable().optional(),
    mediaUrls: z.array(z.string()).default([]),
    documentName: z.string().optional(),
    locationLabel: z.string().optional(),
    communityId: z.string().optional(),
    historicalMaterialId: z.string().optional(),
    hashtags: z.array(z.string()).default([]),
  });
}
export type PostComposerInput = z.infer<ReturnType<typeof createPostComposerSchema>>;

export function createCommentSchema(t: T) {
  return z.object({
    postId: z.string(),
    parentId: z.string().optional(),
    content: z.string().min(1, t("commentRequired")).max(2000),
  });
}
export type CommentInput = z.infer<ReturnType<typeof createCommentSchema>>;

export const communitySchema = z.object({
  name: z.string().min(3).max(80),
  description: z.string().min(10).max(1000),
  category: z.string(),
  rules: z.string().max(2000).default(""),
  coverUrl: z.string().max(300).default(""),
  logoUrl: z.string().max(300).default(""),
});
export type CommunityInput = z.infer<typeof communitySchema>;

export const historicalMaterialSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(3000),
  type: z.string(),
  eventDate: z.string().min(1),
  location: z.string().min(1),
  source: z.string().min(1),
  author: z.string().min(1),
  mediaUrl: z.string().max(300).default(""),
  tags: z.array(z.string()).default([]),
});
export type HistoricalMaterialInput = z.infer<typeof historicalMaterialSchema>;

export const reportSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  reason: z.string(),
  description: z.string().max(1000).default(""),
});
export type ReportInput = z.infer<typeof reportSchema>;

export function createAppealSchema(t: T) {
  return z.object({
    targetType: z.enum(["POST", "COMMENT"]),
    targetId: z.string(),
    reason: z.string().min(10, t("appealReasonMinLength")).max(1000),
  });
}
export type AppealInput = z.infer<ReturnType<typeof createAppealSchema>>;

export function createChangePasswordSchema(t: T) {
  return z
    .object({
      currentPassword: z.string().min(1),
      newPassword: strongPasswordSchema(t),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });
}
export type ChangePasswordInput = z.infer<ReturnType<typeof createChangePasswordSchema>>;
