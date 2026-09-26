"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createForgotPasswordSchema } from "@/lib/validations";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tValidation = useTranslations("validation");
  const forgotPasswordSchema = createForgotPasswordSchema(tValidation);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? tValidation("emailInvalid"));
      return;
    }
    startTransition(async () => {
      const res = await requestPasswordResetAction({ email });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setSent(true);
      setDevResetUrl(res.data.devResetUrl);
    });
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center animate-in-fade">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold">{t("checkYourEmail")}</h1>
          <p className="text-sm text-muted-foreground">{t("forgotPasswordCheckDesc")}</p>
        </div>
        {devResetUrl && (
          <Alert>
            <AlertDescription className="text-left">
              <span className="font-medium">{t("demoResetNote")}</span>
              <Button render={<Link href={devResetUrl} />} variant="link" className="px-0 block">
                {t("resetPasswordNowCta")}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <Link href="/login" className="text-sm text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center lg:text-left">
        <h1 className="text-2xl font-semibold">{t("forgotPassword")}</h1>
        <p className="text-sm text-muted-foreground">{t("forgotPasswordDesc")}</p>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {t("sendLinkCta")}
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
