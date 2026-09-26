import { Scale } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function HistoricalDistinctionBanner() {
  const t = await getTranslations("admin.distinctionBanner");
  return (
    <Card className="p-5 sm:p-6 relative overflow-hidden">
      <Scale
        aria-hidden
        className="absolute -right-6 -bottom-6 size-40 text-primary/5 pointer-events-none"
        strokeWidth={1}
      />
      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
          <Scale className="size-6" />
        </div>
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wide text-primary">{t("kicker")}</span>
            <Badge variant="outline" className="font-mono text-[10px]">
              moderation.ts
            </Badge>
          </div>
          <h3 className="font-semibold text-lg">{t("title")}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {t("body")}
          </p>
        </div>
      </div>
    </Card>
  );
}
