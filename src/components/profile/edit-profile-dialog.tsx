"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { updateProfileAction } from "@/lib/actions/profile";
import { editProfileSchema } from "@/lib/validations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil } from "lucide-react";

interface ProfileFormValues {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  avatarUrl: string;
  coverUrl: string;
}

export function EditProfileDialog({ initial }: { initial: ProfileFormValues }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const t = useTranslations("profile");
  const tActions = useTranslations("actions");

  function update<K extends keyof ProfileFormValues>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    const parsed = editProfileSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await updateProfileAction(parsed.data);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("profileUpdatedToast"));
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
        <Pencil className="size-4" /> {t("editProfile")}
      </Button>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("editProfile")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("fullNameLabel")}</Label>
            <Input value={form.displayName} onChange={(e) => update("displayName", e.target.value)} />
            {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{t("bioLabel")}</Label>
            <Textarea rows={3} value={form.bio} onChange={(e) => update("bio", e.target.value)} maxLength={280} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("locationLabel")}</Label>
            <Input value={form.location} onChange={(e) => update("location", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("websiteLabel")}</Label>
            <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label>{t("avatarUrlLabel")}</Label>
            <Input value={form.avatarUrl} onChange={(e) => update("avatarUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label>{t("coverUrlLabel")}</Label>
            <Input value={form.coverUrl} onChange={(e) => update("coverUrl", e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {tActions("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {tActions("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
