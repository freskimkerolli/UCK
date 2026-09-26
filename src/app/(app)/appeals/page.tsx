import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { Gavel, ShieldOff } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getMyBlockedContent, getMyAppeals } from "@/lib/actions/appeals";
import { AppealDialog } from "@/components/shared/appeal-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

export default async function MyAppealsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ posts, comments }, appeals] = await Promise.all([getMyBlockedContent(user.id), getMyAppeals(user.id)]);
  const appealedIds = new Set(appeals.filter((a) => a.status === "PENDING").map((a) => a.targetId));

  const t = await getTranslations("appeals");
  const locale = (await getLocale()) as AppLocale;

  const APPEAL_STATUS_LABEL: Record<string, string> = {
    PENDING: t("statusPending"),
    APPROVED: t("statusApproved"),
    REJECTED: t("statusRejected"),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <ShieldOff className="size-5" /> {t("pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("pageDescription")}
        </p>
      </div>

      {posts.length === 0 && comments.length === 0 ? (
        <EmptyState icon={ShieldOff} title={t("emptyTitle")} />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Card key={p.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge>{t("postBadge")}</Badge>
                <Badge variant="outline">{p.moderationCategory}</Badge>
              </div>
              <p className="text-sm bg-muted/50 rounded-lg p-3">{p.content}</p>
              {p.moderationReason && <p className="text-xs text-muted-foreground">{t("reasonPrefix", { reason: p.moderationReason })}</p>}
              {appealedIds.has(p.id) ? (
                <Badge variant="secondary">{t("appealPendingBadge")}</Badge>
              ) : (
                <AppealDialog targetType="POST" targetId={p.id} />
              )}
            </Card>
          ))}
          {comments.map((c) => (
            <Card key={c.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{t("commentBadge")}</Badge>
                <Badge variant="outline">{c.moderationCategory}</Badge>
              </div>
              <p className="text-sm bg-muted/50 rounded-lg p-3">{c.content}</p>
              {c.moderationReason && <p className="text-xs text-muted-foreground">{t("reasonPrefix", { reason: c.moderationReason })}</p>}
              {appealedIds.has(c.id) ? (
                <Badge variant="secondary">{t("appealPendingBadge")}</Badge>
              ) : (
                <AppealDialog targetType="COMMENT" targetId={c.id} />
              )}
            </Card>
          ))}
        </div>
      )}

      {appeals.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Gavel className="size-4" /> {t("myAppealsTitle")}
          </h2>
          {appeals.map((a) => (
            <Card key={a.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm truncate">{a.reason}</p>
                <p className="text-xs text-muted-foreground">{timeAgo(a.createdAt, locale)}</p>
              </div>
              <Badge
                variant={a.status === "APPROVED" ? "secondary" : a.status === "REJECTED" ? "destructive" : "outline"}
                className="shrink-0"
              >
                {APPEAL_STATUS_LABEL[a.status]}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
