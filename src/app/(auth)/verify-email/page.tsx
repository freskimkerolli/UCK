import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { verifyEmailAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verifiko email-in — UÇK Connect" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const [t, tErrors] = await Promise.all([getTranslations("auth"), getTranslations("actionErrors")]);
  const result = token ? await verifyEmailAction(token) : { success: false as const, error: tErrors("tokenMissing") };

  return (
    <div className="space-y-6 text-center animate-in-fade">
      {result.success ? (
        <>
          <CheckCircle2 className="mx-auto size-12 text-primary" />
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold">{t("emailVerifiedTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("emailVerifiedBodyPrefix")} <span className="font-medium">{result.data.email}</span>{" "}
              {t("emailVerifiedBodySuffix")}
            </p>
          </div>
          <Button render={<Link href="/login" />} className="w-full">
            {t("loginNowCta")}
          </Button>
        </>
      ) : (
        <>
          <XCircle className="mx-auto size-12 text-destructive" />
          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold">{t("verificationFailedTitle")}</h1>
            <p className="text-sm text-muted-foreground">{result.error}</p>
          </div>
          <Button render={<Link href="/login" />} variant="outline" className="w-full">
            {t("backToLogin")}
          </Button>
        </>
      )}
    </div>
  );
}
