"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { joinCommunityAction } from "@/lib/actions/communities";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";

export function JoinButton({
  communityId,
  initialJoined,
  isOwner,
}: {
  communityId: string;
  initialJoined: boolean;
  isOwner: boolean;
}) {
  const [joined, setJoined] = useState(initialJoined);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("communities");
  const tActions = useTranslations("actions");

  if (isOwner) {
    return (
      <Button variant="outline" disabled className="gap-1.5">
        <Check className="size-4" /> {t("founderLabel")}
      </Button>
    );
  }

  function handleClick() {
    setJoined((j) => !j);
    startTransition(async () => {
      const res = await joinCommunityAction(communityId);
      if (!res.success) {
        toast.error(res.error);
        setJoined((j) => !j);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button variant={joined ? "outline" : "default"} onClick={handleClick} disabled={isPending} className="gap-1.5">
      {joined ? <Check className="size-4" /> : <Plus className="size-4" />}
      {joined ? t("memberLabel") : tActions("join")}
    </Button>
  );
}
