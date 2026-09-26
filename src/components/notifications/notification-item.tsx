"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { UserPlus, Heart, MessageCircle, CornerDownRight, AtSign, Mail, Users2, ShieldAlert } from "lucide-react";
import { markNotificationReadAction } from "@/lib/actions/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, timeAgo, safeJsonParse } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/lib/types";
import type { AppLocale } from "@/i18n/locales";

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  FOLLOW: UserPlus,
  LIKE: Heart,
  COMMENT: MessageCircle,
  REPLY: CornerDownRight,
  MENTION: AtSign,
  MESSAGE: Mail,
  COMMUNITY_ACTIVITY: Users2,
  MODERATION_WARNING: ShieldAlert,
};

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    paramsJson: string | null;
    isRead: boolean;
    createdAt: string | Date;
    postId: string | null;
    commentId: string | null;
    communityId: string | null;
    actor: { username: string; profile: { displayName: string; avatarUrl: string } | null } | null;
    community: { slug: string; name: string } | null;
  };
}

function resolveHref(n: NotificationItemProps["notification"]): string {
  if (n.type === "MESSAGE") return "/messages";
  if (n.type === "MODERATION_WARNING") return "/appeals";
  if (n.postId) return `/post/${n.postId}`;
  if (n.type === "COMMUNITY_ACTIVITY" && n.community) return `/communities/${n.community.slug}`;
  if (n.type === "FOLLOW" && n.actor) return `/profile/${n.actor.username}`;
  return "#";
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const [, startTransition] = useTransition();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("notifications");
  const Icon = ICONS[notification.type as NotificationType] ?? Heart;
  const actorName = notification.actor?.profile?.displayName ?? notification.actor?.username;

  function renderMessage(): string {
    const actor = actorName ?? "";
    switch (notification.type) {
      case "FOLLOW":
        return t("newFollower", { actor });
      case "LIKE":
        return notification.commentId ? t("likedComment", { actor }) : t("likedPost", { actor });
      case "COMMENT":
        return t("commentOnPost", { actor });
      case "REPLY":
        return t("replyToComment", { actor });
      case "MESSAGE":
        return t("newMessage", { actor });
      case "MODERATION_WARNING": {
        const params = safeJsonParse<{ action?: string; reason?: string }>(notification.paramsJson, {});
        const reason = params.reason ?? "";
        if (params.action === "SUSPEND") return t("moderationSuspend", { reason });
        if (params.action === "BLOCK_USER") return t("moderationBlock", { reason });
        return t("moderationWarn", { reason });
      }
      default:
        return "";
    }
  }

  function handleClick() {
    if (!notification.isRead) {
      startTransition(async () => {
        await markNotificationReadAction(notification.id);
      });
    }
  }

  return (
    <Link
      href={resolveHref(notification)}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors",
        !notification.isRead && "bg-accent/10",
      )}
    >
      <div className="relative shrink-0">
        {notification.actor ? (
          <Avatar className="size-10">
            <AvatarImage src={notification.actor.profile?.avatarUrl} alt={actorName} />
            <AvatarFallback>{initials(actorName ?? "?")}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-10 rounded-full bg-muted flex items-center justify-center">
            <Icon className="size-5 text-muted-foreground" />
          </div>
        )}
        <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-background border flex items-center justify-center">
          <Icon className="size-3 text-primary" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{renderMessage()}</p>
        <p className="text-xs text-muted-foreground">{timeAgo(notification.createdAt, locale)}</p>
      </div>
      {!notification.isRead && <span className="size-2 rounded-full bg-primary mt-2 shrink-0" />}
    </Link>
  );
}
