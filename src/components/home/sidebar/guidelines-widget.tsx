import { ShieldCheck, CheckCircle2, Ban } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";

export async function GuidelinesWidget() {
  const t = await getTranslations("home");
  const ALLOWED = [t("guidelinesAllowed1"), t("guidelinesAllowed2")];

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-[18px] text-primary" />
        <h2 className="font-semibold text-sm">{t("guidelinesTitle")}</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{t("guidelinesIntro")}</p>
      <div className="space-y-2">
        {ALLOWED.map((text) => (
          <div key={text} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
            <span>{text}</span>
          </div>
        ))}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Ban className="size-4 text-destructive shrink-0 mt-0.5" />
          <span>
            <strong className="text-foreground">{t("guidelinesZeroTolerance")}</strong>{" "}
            {t("guidelinesZeroToleranceDescription")}
          </span>
        </div>
      </div>
    </Card>
  );
}
