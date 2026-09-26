// Shared string-union "enums" — SQLite has no native enum type in Prisma,
// so the schema stores validated strings and this file is the source of truth.

export const UserRole = ["USER", "MODERATOR", "ADMIN"] as const;
export type UserRole = (typeof UserRole)[number];

export const UserStatus = ["ACTIVE", "WARNED", "SUSPENDED", "BLOCKED"] as const;
export type UserStatus = (typeof UserStatus)[number];

export const ModerationStatus = ["PUBLISHED", "PENDING_REVIEW", "BLOCKED"] as const;
export type ModerationStatus = (typeof ModerationStatus)[number];

export const ModerationCategory = [
  "SAFE",
  "REVIEW",
  "ABUSIVE",
  "THREAT",
  "HARASSMENT",
  "HATEFUL",
  "SPAM",
] as const;
export type ModerationCategory = (typeof ModerationCategory)[number];

export const MediaType = ["PHOTO", "VIDEO", "DOCUMENT"] as const;
export type MediaType = (typeof MediaType)[number];

export const CommunityCategory = [
  "RAJONI",
  "ZONA",
  "HISTORIA",
  "NJESITE",
  "FAMILJET",
  "VETERANET",
  "STUDIUESIT",
  "ARKIVISTET",
] as const;
export type CommunityCategory = (typeof CommunityCategory)[number];

export const CommunityRole = ["MEMBER", "MODERATOR", "OWNER"] as const;
export type CommunityRole = (typeof CommunityRole)[number];

export const HistoricalMaterialType = [
  "PHOTO",
  "DOCUMENT",
  "VIDEO",
  "TESTIMONY",
  "INTERVIEW",
  "BIOGRAPHY",
  "EVENT_RECORD",
] as const;
export type HistoricalMaterialType = (typeof HistoricalMaterialType)[number];

export const VerificationStatus = ["VERIFIED", "UNVERIFIED", "DISPUTED"] as const;
export type VerificationStatus = (typeof VerificationStatus)[number];

export const NotificationType = [
  "FOLLOW",
  "LIKE",
  "COMMENT",
  "REPLY",
  "MENTION",
  "MESSAGE",
  "COMMUNITY_ACTIVITY",
  "MODERATION_WARNING",
] as const;
export type NotificationType = (typeof NotificationType)[number];

export const ReportReason = [
  "OFENSE",
  "HARASSMENT",
  "THREAT",
  "HATE_SPEECH",
  "SPAM",
  "MISINFORMATION",
  "IMPERSONATION",
  "OTHER",
] as const;
export type ReportReason = (typeof ReportReason)[number];

export const ReportStatus = ["PENDING", "REVIEWED", "DISMISSED", "ACTIONED"] as const;
export type ReportStatus = (typeof ReportStatus)[number];

export const ModerationActionType = [
  "WARN",
  "SUSPEND",
  "BLOCK_USER",
  "UNBLOCK_USER",
  "DELETE_POST",
  "DELETE_COMMENT",
  "RESTORE_CONTENT",
  "DISMISS_REPORT",
  "APPROVE_CONTENT",
] as const;
export type ModerationActionType = (typeof ModerationActionType)[number];

export const AppealStatus = ["PENDING", "APPROVED", "REJECTED"] as const;
export type AppealStatus = (typeof AppealStatus)[number];

export interface SocialLink {
  label: string;
  url: string;
}
