"use client";

import { useTranslations } from "next-intl";
import { warnUserAction, suspendUserAction, blockUserAction, unblockUserAction } from "@/lib/actions/admin";
import { ReasonActionDialog } from "@/components/admin/reason-action-dialog";

export function UserRowActions({ userId, status }: { userId: string; status: string }) {
  const t = useTranslations("admin.userRowActions");
  return (
    <div className="flex flex-wrap gap-1.5 justify-end">
      <ReasonActionDialog
        triggerLabel={t("warn")}
        title={t("warnTitle")}
        onConfirm={(reason) => warnUserAction(userId, reason)}
      />
      {status !== "SUSPENDED" && (
        <ReasonActionDialog
          triggerLabel={t("suspend")}
          title={t("suspendTitle")}
          onConfirm={(reason) => suspendUserAction(userId, reason)}
        />
      )}
      {status !== "BLOCKED" ? (
        <ReasonActionDialog
          triggerLabel={t("block")}
          triggerVariant="destructive"
          title={t("blockTitle")}
          description={t("blockDescription")}
          onConfirm={(reason) => blockUserAction(userId, reason)}
        />
      ) : (
        <ReasonActionDialog
          triggerLabel={t("unblock")}
          title={t("unblockTitle")}
          onConfirm={(reason) => unblockUserAction(userId, reason)}
        />
      )}
    </div>
  );
}
