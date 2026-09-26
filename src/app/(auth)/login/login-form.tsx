"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createLoginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginPrecheckAction, resendVerificationAction } from "@/lib/actions/auth";
import { AlertCircle, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const loginSchema = createLoginSchema(tValidation);
  const callbackUrl = searchParams.get("callbackUrl") || "/home";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resending, setResending] = useState(false);

  const ERROR_MESSAGES: Record<string, string> = {
    INVALID_CREDENTIALS: t("errorInvalidCredentials"),
    EMAIL_NOT_VERIFIED: t("errorEmailNotVerified"),
    ACCOUNT_BLOCKED: t("errorAccountBlocked"),
    ACCOUNT_SUSPENDED: t("errorAccountSuspended"),
    default: t("errorDefault"),
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setNeedsVerification(false);
    const parsed = loginSchema.safeParse({ email, password });
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
      const precheck = await loginPrecheckAction({ email, password });
      if (!precheck.success) {
        setFormError(ERROR_MESSAGES[precheck.error] ?? ERROR_MESSAGES.default);
        if (precheck.error === "EMAIL_NOT_VERIFIED") setNeedsVerification(true);
        return;
      }

      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setFormError(ERROR_MESSAGES.default);
        return;
      }
      toast.success(t("welcomeBack"));
      router.push(callbackUrl);
      router.refresh();
    });
  }

  async function handleResend() {
    setResending(true);
    const res = await resendVerificationAction(email);
    setResending(false);
    if (res.success) {
      toast.success(t("resendVerification"), {
        description: res.data.devVerifyUrl,
        action: { label: t("login"), onClick: () => router.push(res.data.devVerifyUrl) },
      });
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center lg:text-left">
        <h1 className="text-2xl font-semibold">{t("loginTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      </div>

      {formError && (
        <Alert variant="destructive" className="animate-in-fade">
          <AlertCircle className="size-4" />
          <AlertDescription>
            {formError}
            {needsVerification && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="ml-1 underline underline-offset-2 font-medium"
              >
                {resending ? t("resending") : t("resendVerification")}
              </button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("password")}</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <Button type="submit" size="sm" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("login")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          {t("signup")}
        </Link>
      </p>
    </div>
  );
}
