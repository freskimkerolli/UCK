"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createResetPasswordSchema } from "@/lib/validations";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const resetPasswordSchema = createResetPasswordSchema(tValidation);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = resetPasswordSchema.safeParse({ token, password, confirmPassword });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0]?.toString() ?? "form"] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    startTransition(async () => {
      const res = await resetPasswordAction({ token, password, confirmPassword });
      if (!res.success) {
        setFormError(res.error);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    });
  }

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>{t("resetLinkInvalidClient")}</AlertDescription>
      </Alert>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 text-center animate-in-fade">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h1 className="text-xl font-semibold">{t("passwordResetSuccess")}</h1>
        <p className="text-sm text-muted-foreground">{t("redirectingToLogin")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center lg:text-left">
        <h1 className="text-2xl font-semibold">{t("setNewPasswordTitle")}</h1>
      </div>
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("newPassword")}</Label>
          <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("resetPasswordCta")}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary font-medium hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
