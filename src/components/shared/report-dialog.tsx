"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createReportAction } from "@/lib/actions/reports";
import { ReportReason } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function ReportDialog({
  open,
  onOpenChange,
  postId,
  commentId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  commentId?: string;
}) {
  const t = useTranslations("shared");
  const tActions = useTranslations("actions");
  const tEnums = useTranslations("enums");
  const [reason, setReason] = useState<string>("OFENSE");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const res = await createReportAction({ postId, commentId, reason, description });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("reportSubmitted"));
      setDescription("");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("reportDialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={reason} onValueChange={(v) => setReason(v ?? "OFENSE")}>
            {ReportReason.map((r) => (
              <div key={r} className="flex items-center gap-2">
                <RadioGroupItem value={r} id={`reason-${r}`} />
                <Label htmlFor={`reason-${r}`} className="font-normal">
                  {tEnums(`reportReason.${r}`)}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <Textarea
            placeholder={t("reportDialogDetailsPlaceholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tActions("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {t("reportDialogSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
