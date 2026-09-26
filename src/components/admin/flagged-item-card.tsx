import { MessageSquareWarning } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FlaggedRowActions } from "@/components/admin/flagged-row-actions";
import type { ReportReason } from "@/lib/types";
import { initials, timeAgo } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

interface FlaggedItemProps {
  id: string;
  content: string;
  createdAt: string | Date;
  moderationStatus: string;
  moderationCategory: string;
  moderationReason: string | null;
  author: {
    username: string;
    role: string;
    status: string;
    profile: { displayName: string } | null;
  };
  reports: { reason: string; reporter: { username: string } }[];
}

const CATEGORY_VARIANT: Record<string, "destructive" | "outline" | "secondary"> = {
  ABUSIVE: "destructive",
  THREAT: "destructive",
  HARASSMENT: "destructive",
  HATEFUL: "destructive",
  SPAM: "secondary",
  REVIEW: "outline",
};

export async function FlaggedItemCard({ item, targetType }: { item: FlaggedItemProps; targetType: "POST" | "COMMENT" }) {
  const name = item.author.profile?.displayName ?? item.author.username;
  const reportReasons = [...new Set(item.reports.map((r) => r.reason))];
  const t = await getTranslations("admin.flaggedItemCard");
  const tEnums = await getTranslations("enums");
  const locale = (await getLocale()) as AppLocale;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm">{name}</span>
            <span className="text-xs text-muted-foreground">@{item.author.username} · {timeAgo(item.createdAt, locale)}</span>
            {item.author.status !== "ACTIVE" && (
              <span className="text-xs font-semibold text-destructive">{t("statusPrefix", { status: item.author.status })}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline">{targetType === "POST" ? t("postBadge") : t("commentBadge")}</Badge>
          <Badge variant={CATEGORY_VARIANT[item.moderationCategory] ?? "outline"}>{item.moderationCategory}</Badge>
        </div>
      </div>

      <p className="text-sm bg-muted/40 rounded-lg p-3 leading-relaxed">{item.content}</p>

      {item.moderationReason && (
        <p className="text-xs text-muted-foreground font-mono bg-muted/20 rounded p-2">
          <span className="text-primary font-semibold">{t("aiEngineLabel")}</span>
          {item.moderationReason}
        </p>
      )}

      {reportReasons.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageSquareWarning className="size-3.5 text-destructive shrink-0" />
          <span>
            {t("reportedForLabel")}
            <strong className="text-foreground">
              {reportReasons.map((r) => tEnums(`reportReason.${r as ReportReason}`)).join(", ")}
            </strong>
            {" "}
            {t("reportedByUsers", { count: item.reports.length })}
          </span>
        </div>
      )}

      <FlaggedRowActions targetType={targetType} targetId={item.id} />
    </Card>
  );
}
