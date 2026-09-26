"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { createCommunityAction } from "@/lib/actions/communities";
import { communitySchema } from "@/lib/validations";
import { CommunityCategory, type CommunityCategory as CCat } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY = { name: "", description: "", category: "RAJONI" as CCat, rules: "", coverUrl: "", logoUrl: "" };

export function CreateCommunityDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("communities");
  const tEnums = useTranslations("enums");
  const tActions = useTranslations("actions");

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    const parsed = communitySchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await createCommunityAction(parsed.data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("createdToast"));
      setForm(EMPTY);
      setOpen(false);
      router.push(`/communities/${res.data.slug}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="size-4" /> {t("createButton")}
      </Button>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createDialogTitle")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("nameLabel")}</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{t("categoryLabel")}</Label>
            <Select value={form.category} onValueChange={(v) => update("category", (v ?? "RAJONI") as CCat)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CommunityCategory.map((c) => (
                  <SelectItem key={c} value={c}>
                    {tEnums(`communityCategory.${c}`)}
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
          <div className="space-y-1.5">
            <Label>{t("rulesOptionalLabel")}</Label>
            <Textarea rows={3} value={form.rules} onChange={(e) => update("rules", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("logoUrlLabel")}</Label>
              <Input value={form.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("coverUrlLabel")}</Label>
              <Input value={form.coverUrl} onChange={(e) => update("coverUrl", e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {tActions("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {t("createSubmit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
