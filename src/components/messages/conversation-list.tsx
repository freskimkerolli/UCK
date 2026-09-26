"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { MessageCircle } from "lucide-react";
import { getMyConversations } from "@/lib/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/locales";

type Conversation = Awaited<ReturnType<typeof getMyConversations>>[number];

export function ConversationList({ initial }: { initial: Conversation[] }) {
  const t = useTranslations("chat");
  const locale = useLocale() as AppLocale;
  const [conversations, setConversations] = useState<Conversation[]>(initial);
  const pathname = usePathname();
  const activeId = pathname.startsWith("/messages/") ? pathname.split("/")[2] : null;
  const isDetailView = !!activeId;

  useEffect(() => {
    const interval = setInterval(() => {
      getMyConversations().then(setConversations);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={cn(
        "w-full md:w-80 shrink-0 border-r h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-6rem)] overflow-y-auto",
        isDetailView && "hidden md:block",
      )}
    >
      <div className="p-4 border-b">
        <h1 className="font-semibold text-lg">{t("heading")}</h1>
      </div>
      {conversations.length === 0 ? (
        <EmptyState icon={MessageCircle} title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="py-1">
          {conversations.map((c) => {
            const name = c.other?.profile?.displayName ?? c.other?.username ?? t("defaultUser");
            return (
              <Link
                key={c.conversationId}
                href={`/messages/${c.conversationId}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors",
                  activeId === c.conversationId && "bg-muted",
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="size-11">
                    <AvatarImage src={c.other?.profile?.avatarUrl} alt={name} />
                    <AvatarFallback>{initials(name)}</AvatarFallback>
                  </Avatar>
                  {c.online && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{name}</p>
                    {c.lastMessage && (
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(c.lastMessage.createdAt, locale)}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.lastMessage ? c.lastMessage.content || t("photoPlaceholder") : t("startConversationPlaceholder")}
                  </p>
                </div>
                {c.unread > 0 && <Badge className="rounded-full size-5 justify-center px-1 shrink-0">{c.unread}</Badge>}
              </Link>
            );
          })}
        </div>
      )}
    </aside>
  );
}
