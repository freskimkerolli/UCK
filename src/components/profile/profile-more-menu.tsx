"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { MoreHorizontal, UserX } from "lucide-react";
import { blockUserByUsernameAction } from "@/lib/actions/blocks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProfileMoreMenu({ username }: { username: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("profile");
  const tActions = useTranslations("actions");

  function handleBlock() {
    startTransition(async () => {
      const res = await blockUserByUsernameAction(username);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("userBlockedToast"));
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label={t("moreOptionsAria")} />}>
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <UserX className="size-4" /> {t("blockUser")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("blockConfirmTitle", { username })}</AlertDialogTitle>
            <AlertDialogDescription>{t("blockConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tActions("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} disabled={isPending}>
              {t("blockConfirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
