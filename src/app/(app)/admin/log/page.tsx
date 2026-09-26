import { getTranslations, getLocale } from "next-intl/server";
import { getModerationLogs } from "@/lib/data/admin";
import { EmptyState } from "@/components/shared/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

export default async function AdminLogPage() {
  const logs = await getModerationLogs();
  const t = await getTranslations("admin.logPage");
  const locale = (await getLocale()) as AppLocale;

  if (logs.length === 0) {
    return <EmptyState icon={ScrollText} title={t("emptyTitle")} />;
  }

  return (
    <div className="rounded-xl border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columnDate")}</TableHead>
            <TableHead>{t("columnModerator")}</TableHead>
            <TableHead>{t("columnAction")}</TableHead>
            <TableHead>{t("columnTarget")}</TableHead>
            <TableHead>{t("columnReason")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(l.createdAt, "d MMM yyyy, HH:mm", locale)}</TableCell>
              <TableCell>{l.moderator ? `@${l.moderator.username}` : <Badge variant="secondary">{t("systemAiBadge")}</Badge>}</TableCell>
              <TableCell>
                <Badge variant="outline">{l.action}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {l.targetType} · {l.targetId.slice(0, 8)}...
              </TableCell>
              <TableCell className="max-w-80 text-sm truncate">{l.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
