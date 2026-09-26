"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Gavel } from "lucide-react";
import { createAppealAction } from "@/lib/actions/appeals";
import { createAppealSchema } from "@/lib/validations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AppealDialog({ targetType, targetId }: { targetType: "POST" | "COMMENT"; targetId: string }) {
  const t = useTranslations("appeals");
  const tActions = useTranslations("actions");
  const appealSchema = createAppealSchema(useTranslations("validation"));
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const parsed = appealSchema.safeParse({ targetType, targetId, reason });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message);
      return;
    }
    startTransition(async () => {
      const res = await createAppealAction({ targetType, targetId, reason });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("successToast"));
      setReason("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <Gavel className="size-3.5" /> {t("triggerButton")}
      </Button>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <Textarea placeholder={t("reasonPlaceholder")} value={reason} onChange={(e) => setReason(e.target.value)} rows={4} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {tActions("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || reason.trim().length < 10}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {t("submitButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
