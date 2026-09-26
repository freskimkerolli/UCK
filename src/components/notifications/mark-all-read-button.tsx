"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const t = useTranslations("notificationsPage");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await markAllNotificationsReadAction();
        router.refresh();
      })}
    >
      <CheckCheck className="size-4" /> {t("markAllRead")}
    </Button>
  );
}
