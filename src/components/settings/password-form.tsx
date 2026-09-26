"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { changePasswordAction } from "@/lib/actions/profile";
import { createChangePasswordSchema } from "@/lib/validations";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const changePasswordSchema = createChangePasswordSchema(tValidation);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await changePasswordAction(form);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(t("passwordChangedSuccess"));
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div className="space-y-1.5">
        <Label>{t("currentPassword")}</Label>
        <PasswordInput
          value={form.currentPassword}
          onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
        />
        {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>{t("newPassword")}</Label>
        <PasswordInput value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
        {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>{t("confirmNewPassword")}</Label>
        <PasswordInput
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
        />
        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {t("changePasswordCta")}
      </Button>
    </form>
  );
}
