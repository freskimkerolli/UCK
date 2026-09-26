"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { createHistoricalMaterialAction } from "@/lib/actions/archive";
import { historicalMaterialSchema } from "@/lib/validations";
import { HistoricalMaterialType, type HistoricalMaterialType as MType } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EMPTY = {
  title: "",
  description: "",
  type: "PHOTO" as MType,
  eventDate: "",
  location: "",
  source: "",
  author: "",
  mediaUrl: "",
};

export function ContributeMaterialDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("archive");
  const tEnums = useTranslations("enums");
  const tActions = useTranslations("actions");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    const parsed = historicalMaterialSchema.safeParse({ ...form, tags: [] });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await createHistoricalMaterialAction(parsed.data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("contributeSuccessToast"));
      setForm(EMPTY);
      setOpen(false);
      router.push(`/archive/${res.data.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" /> {t("contributeButton")}
      </Button>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("contributeDialogTitle")}</DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertDescription>
            {t("contributeNoticePrefix")} <strong>{t("contributeNoticeBold")}</strong> {t("contributeNoticeSuffix")}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("titleLabel")}</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{t("typeLabel")}</Label>
            <Select value={form.type} onValueChange={(v) => update("type", (v ?? "PHOTO") as MType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HistoricalMaterialType.map((mt) => (
                  <SelectItem key={mt} value={mt}>
                    {tEnums(`historicalMaterialType.${mt}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("descriptionLabel")}</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("eventDateLabel")}</Label>
              <Input value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} />
              {errors.eventDate && <p className="text-xs text-destructive">{errors.eventDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t("locationLabel")}</Label>
              <Input value={form.location} onChange={(e) => update("location", e.target.value)} />
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("sourceLabel")}</Label>
              <Input value={form.source} onChange={(e) => update("source", e.target.value)} placeholder={t("sourcePlaceholder")} />
              {errors.source && <p className="text-xs text-destructive">{errors.source}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>{t("authorFieldLabel")}</Label>
              <Input value={form.author} onChange={(e) => update("author", e.target.value)} />
              {errors.author && <p className="text-xs text-destructive">{errors.author}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("mediaUrlLabel")}</Label>
            <Input value={form.mediaUrl} onChange={(e) => update("mediaUrl", e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {tActions("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {tActions("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
