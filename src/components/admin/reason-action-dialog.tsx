"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { VariantProps } from "class-variance-authority";

export function ReasonActionDialog({
  triggerLabel,
  triggerVariant = "outline",
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  triggerLabel: string;
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: (reason: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("admin.reasonDialog");
  const tActions = useTranslations("actions");

  function handleConfirm() {
    if (!reason.trim()) {
      toast.error(t("reasonRequired"));
      return;
    }
    startTransition(async () => {
      const res = await onConfirm(reason);
      if (!res.success) {
        toast.error(res.error ?? t("genericError"));
        return;
      }
      toast.success(t("actionSuccess"));
      setReason("");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant={triggerVariant} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Textarea placeholder={t("reasonPlaceholder")} value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {tActions("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel ?? tActions("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
