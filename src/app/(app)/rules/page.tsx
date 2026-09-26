import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, CheckCircle2, Ban, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";

export default async function RulesPage() {
  const t = await getTranslations("rules");

  const ALLOWED = [t("allowed1"), t("allowed2"), t("allowed3"), t("allowed4")];

  const FORBIDDEN = [t("forbidden1"), t("forbidden2"), t("forbidden3"), t("forbidden4"), t("forbidden5")];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="size-6" />
          <span className="text-xs font-bold uppercase tracking-widest">{t("badge")}</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-muted-foreground leading-relaxed">
          {t("intro")}
        </p>
      </div>

      <Card className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="size-5 text-primary" />
          <h2 className="font-semibold text-lg">{t("distinctionTitle")}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("distinctionBody")}
        </p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="size-5" />
            <h2 className="font-semibold">{t("allowedTitle")}</h2>
          </div>
          <ul className="space-y-2.5">
            {ALLOWED.map((text) => (
              <li key={text} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-destructive">
            <Ban className="size-5" />
            <h2 className="font-semibold">{t("forbiddenTitle")}</h2>
          </div>
          <ul className="space-y-2.5">
            {FORBIDDEN.map((text) => (
              <li key={text} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Ban className="size-4 text-destructive shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {t("footerPrefix")}{" "}
        <Link href="/appeals" className="text-primary hover:underline font-medium">
          {t("footerLinkText")}
        </Link>
        .
      </p>
    </div>
  );
}
