import { Gavel } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getPendingAppeals } from "@/lib/data/admin";
import { AppealRowActions } from "@/components/admin/appeal-row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, timeAgo } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

export default async function AdminAppealsPage() {
  const appeals = await getPendingAppeals();
  const t = await getTranslations("admin.appealsPage");
  const locale = (await getLocale()) as AppLocale;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">{t("kicker")}</span>
        <Badge className="bg-primary/15 text-primary">{t("openAppealsBadge", { count: appeals.length })}</Badge>
      </div>

      {appeals.length === 0 ? (
        <EmptyState icon={Gavel} title={t("emptyTitle")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appeals.map((a) => {
            const name = a.user.profile?.displayName ?? a.user.username;
            return (
              <Card key={a.id} className="p-4 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-10">
                        <AvatarImage src={a.user.profile?.avatarUrl} alt={name} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                          {initials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm">{name}</p>
                        <span className="text-xs text-muted-foreground">{t("submittedAt", { time: timeAgo(a.createdAt, locale) })}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{a.targetType === "POST" ? t("postBadge") : t("commentBadge")}</Badge>
                  </div>

                  {a.priorWarnings > 0 && (
                    <p className="text-xs text-destructive font-semibold">{t("priorWarnings", { count: a.priorWarnings })}</p>
                  )}

                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <span className="text-xs uppercase font-semibold text-muted-foreground block mb-1">
                      {t("blockedContentLabel")}
                    </span>
                    <p className="text-sm italic line-clamp-3">&ldquo;{a.contentSnapshot}&rdquo;</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-primary/5">
                    <span className="text-xs font-semibold text-primary block mb-1">{t("authorReasoningLabel")}</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{a.reason}&rdquo;</p>
                  </div>
                </div>

                <AppealRowActions appealId={a.id} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
