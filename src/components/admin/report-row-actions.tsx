"use client";

import { useTranslations } from "next-intl";
import { resolveReportAction } from "@/lib/actions/admin";
import { ReasonActionDialog } from "@/components/admin/reason-action-dialog";

export function ReportRowActions({ reportId }: { reportId: string }) {
  const t = useTranslations("admin.reportRowActions");
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      <ReasonActionDialog
        triggerLabel={t("dismiss")}
        title={t("dismissTitle")}
        onConfirm={(reason) => resolveReportAction({ reportId, decision: "DISMISS", reason })}
      />
      <ReasonActionDialog
        triggerLabel={t("warnAuthor")}
        title={t("warnAuthorTitle")}
        onConfirm={(reason) => resolveReportAction({ reportId, decision: "WARN_AUTHOR", reason })}
      />
      <ReasonActionDialog
        triggerLabel={t("deleteContent")}
        triggerVariant="destructive"
        title={t("deleteContentTitle")}
        onConfirm={(reason) => resolveReportAction({ reportId, decision: "DELETE_CONTENT", reason })}
      />
    </div>
  );
}
