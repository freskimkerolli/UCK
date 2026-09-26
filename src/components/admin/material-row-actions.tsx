"use client";

import { useTranslations } from "next-intl";
import { setMaterialVerificationAction, deleteMaterialAction } from "@/lib/actions/admin";
import { ReasonActionDialog } from "@/components/admin/reason-action-dialog";

export function MaterialRowActions({ materialId }: { materialId: string }) {
  const t = useTranslations("admin.materialRowActions");
  const tActions = useTranslations("actions");
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      <ReasonActionDialog
        triggerLabel={t("verify")}
        title={t("verifyTitle")}
        onConfirm={(reason) => setMaterialVerificationAction(materialId, "VERIFIED", reason)}
      />
      <ReasonActionDialog
        triggerLabel={t("dispute")}
        title={t("disputeTitle")}
        onConfirm={(reason) => setMaterialVerificationAction(materialId, "DISPUTED", reason)}
      />
      <ReasonActionDialog
        triggerLabel={tActions("delete")}
        triggerVariant="destructive"
        title={t("deleteTitle")}
        onConfirm={(reason) => deleteMaterialAction(materialId, reason)}
      />
    </div>
  );
}
