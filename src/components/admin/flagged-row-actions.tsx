"use client";

import { useTranslations } from "next-intl";
import { reviewFlaggedContentAction } from "@/lib/actions/admin";
import { ReasonActionDialog } from "@/components/admin/reason-action-dialog";

export function FlaggedRowActions({ targetType, targetId }: { targetType: "POST" | "COMMENT"; targetId: string }) {
  const t = useTranslations("admin.flaggedRowActions");
  const tActions = useTranslations("actions");
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      <ReasonActionDialog
        triggerLabel={t("approve")}
        title={t("approveTitle")}
        onConfirm={(reason) => reviewFlaggedContentAction({ targetType, targetId, decision: "APPROVE", reason })}
      />
      <ReasonActionDialog
        triggerLabel={tActions("delete")}
        triggerVariant="destructive"
        title={t("deleteTitle")}
        onConfirm={(reason) => reviewFlaggedContentAction({ targetType, targetId, decision: "DELETE", reason })}
      />
    </div>
  );
}
