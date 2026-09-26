"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UserPlus, UserCheck } from "lucide-react";
import { toggleFollowAction } from "@/lib/actions/follow";
import { Button } from "@/components/ui/button";

export function FollowButton({ targetUserId, initialFollowing }: { targetUserId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("profile");
  const tActions = useTranslations("actions");

  function handleClick() {
    setFollowing((f) => !f);
    startTransition(async () => {
      const res = await toggleFollowAction(targetUserId);
      if (!res.success) {
        toast.error(res.error);
        setFollowing((f) => !f);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      variant={following ? "outline" : "default"}
      onClick={handleClick}
      disabled={isPending}
      className="gap-1.5"
    >
      {following ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
      {following ? t("followingLabel") : tActions("follow")}
    </Button>
  );
}
