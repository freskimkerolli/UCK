import { Flame } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";

export async function StatRibbon({
  stats,
}: {
  stats: { verifiedMaterials: number; testimonies: number; communities: number };
}) {
  const t = await getTranslations("home");

  return (
    <Card className="p-4 sm:p-5 relative overflow-hidden">
      <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Flame className="size-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">{t("statRibbonBadge")}</span>
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              <span className="text-xs text-muted-foreground">UÇK Connect</span>
            </div>
            <h1 className="font-serif italic text-lg sm:text-xl text-foreground leading-tight">
              {t("statRibbonHeading")}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-3 sm:gap-x-6">
          <Stat label={t("statVerifiedMaterials")} value={stats.verifiedMaterials} />
          <div className="hidden sm:block h-8 w-px bg-border shrink-0" />
          <Stat label={t("statTestimonies")} value={stats.testimonies} valueClassName="text-chart-3" />
          <div className="hidden sm:block h-8 w-px bg-border shrink-0" />
          <Stat label={t("statActiveCommunities")} value={stats.communities} valueClassName="text-primary" />
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value, valueClassName }: { label: string; value: number; valueClassName?: string }) {
  return (
    <div className="flex flex-col items-center text-center shrink-0">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <span className={`text-lg font-bold tabular-nums ${valueClassName ?? "text-foreground"}`}>{value}</span>
    </div>
  );
}
