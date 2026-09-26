"use client";

import { useTranslations } from "next-intl";
import { deleteCommunityAction } from "@/lib/actions/admin";
import { ReasonActionDialog } from "@/components/admin/reason-action-dialog";

export function CommunityRowActions({ communityId }: { communityId: string }) {
  const t = useTranslations("admin.communityRowActions");
  const tActions = useTranslations("actions");
  return (
    <ReasonActionDialog
      triggerLabel={tActions("delete")}
      triggerVariant="destructive"
      title={t("deleteTitle")}
      description={t("deleteDescription")}
      onConfirm={(reason) => deleteCommunityAction(communityId, reason)}
    />
  );
}
