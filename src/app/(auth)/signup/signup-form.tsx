"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createSignUpSchema } from "@/lib/validations";
import { signUpAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const signUpSchema = createSignUpSchema(tValidation);
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = signUpSchema.safeParse(form);
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
      const res = await signUpAction(form);
      if (!res.success) {
        setFormError(res.error);
        if (res.fieldErrors) setErrors(res.fieldErrors);
        return;
      }
      toast.success(t("accountCreated"), {
        description: `${t("demoVerifyNote")} ${res.data.devVerifyUrl}`,
        duration: 10000,
      });
      router.push(res.data.devVerifyUrl);
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center lg:text-left">
        <h1 className="text-2xl font-semibold">{t("signupTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("signupSubtitle")}</p>
      </div>

      {formError && (
        <Alert variant="destructive" className="animate-in-fade">
          <AlertCircle className="size-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="displayName">{t("displayName")}</Label>
          <Input
            id="displayName"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            aria-invalid={!!errors.displayName}
            placeholder={t("displayNamePlaceholder")}
          />
          {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">{t("username")}</Label>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            aria-invalid={!!errors.username}
            placeholder={t("usernamePlaceholder")}
          />
          {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("password")}</Label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <PasswordInput
            id="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="acceptTerms"
            checked={form.acceptTerms}
            onCheckedChange={(c) => update("acceptTerms", c === true)}
          />
          <Label htmlFor="acceptTerms" className="text-xs font-normal leading-snug text-muted-foreground">
            {t("acceptTermsLabel")}
          </Label>
        </div>
        {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms}</p>}

        <Button type="submit" size="sm" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("signup")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
