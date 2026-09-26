"use client";

import { useTranslations } from "next-intl";
import { resolveAppealAction } from "@/lib/actions/admin";
import { ReasonActionDialog } from "@/components/admin/reason-action-dialog";

export function AppealRowActions({ appealId }: { appealId: string }) {
  const t = useTranslations("admin.appealRowActions");
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      <ReasonActionDialog
        triggerLabel={t("approve")}
        title={t("approveTitle")}
        description={t("approveDescription")}
        confirmLabel={t("approveConfirm")}
        onConfirm={(note) => resolveAppealAction({ appealId, decision: "APPROVED", note })}
      />
      <ReasonActionDialog
        triggerLabel={t("reject")}
        triggerVariant="destructive"
        title={t("rejectTitle")}
        confirmLabel={t("rejectConfirm")}
        onConfirm={(note) => resolveAppealAction({ appealId, decision: "REJECTED", note })}
      />
    </div>
  );
}
