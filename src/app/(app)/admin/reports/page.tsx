import { Flag } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getPendingReports } from "@/lib/data/admin";
import { ReportRowActions } from "@/components/admin/report-row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReportReason } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

export default async function AdminReportsPage() {
  const reports = await getPendingReports();
  const t = await getTranslations("admin.reportsPage");
  const tEnums = await getTranslations("enums");
  const locale = (await getLocale()) as AppLocale;

  if (reports.length === 0) {
    return <EmptyState icon={Flag} title={t("emptyTitle")} description={t("emptyDescription")} />;
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <Card key={r.id} className="p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{tEnums(`reportReason.${r.reason as ReportReason}`)}</Badge>
              <span className="text-xs text-muted-foreground">
                {t("reportedBy", { username: r.reporter.username, time: timeAgo(r.createdAt, locale) })}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            {r.post && (
              <>
                <p className="text-xs text-muted-foreground mb-1">{t("postByAuthor", { username: r.post.author.username })}</p>
                <p className="line-clamp-3">{r.post.content}</p>
              </>
            )}
            {r.comment && (
              <>
                <p className="text-xs text-muted-foreground mb-1">{t("commentByAuthor", { username: r.comment.author.username })}</p>
                <p className="line-clamp-3">{r.comment.content}</p>
              </>
            )}
          </div>

          {r.description && <p className="text-sm text-muted-foreground italic">&ldquo;{r.description}&rdquo;</p>}

          <ReportRowActions reportId={r.id} />
        </Card>
      ))}
    </div>
  );
}
