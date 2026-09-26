import { ScanSearch, ShieldCheck, Ban, RefreshCcw } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";
import type { getModerationMetrics } from "@/lib/data/admin";
import type { AppLocale } from "@/i18n/locales";

export async function ModerationMetricsGrid({ metrics }: { metrics: Awaited<ReturnType<typeof getModerationMetrics>> }) {
  const t = await getTranslations("admin.metricsGrid");
  const locale = (await getLocale()) as AppLocale;
  const cards = [
    {
      icon: ScanSearch,
      label: t("checkedLabel"),
      value: metrics.checked.toLocaleString(locale),
      iconColor: "text-primary",
      barColor: "bg-primary",
      barWidth: "100%",
      sub: t("checkedSub"),
    },
    {
      icon: ShieldCheck,
      label: t("safeLabel"),
      value: `${metrics.safeRate.toFixed(1)}%`,
      iconColor: "text-primary",
      barColor: "bg-primary",
      barWidth: `${metrics.safeRate}%`,
      sub: t("safeSub"),
    },
    {
      icon: Ban,
      label: t("blockedLabel"),
      value: `${metrics.blockedRate.toFixed(1)}%`,
      iconColor: "text-destructive",
      barColor: "bg-destructive",
      barWidth: `${metrics.blockedRate}%`,
      sub: t("blockedSub"),
    },
    {
      icon: RefreshCcw,
      label: t("appealsLabel"),
      value: `${metrics.appealApprovalRate.toFixed(0)}%`,
      iconColor: "text-accent-foreground",
      barColor: "bg-accent",
      barWidth: `${metrics.appealApprovalRate}%`,
      sub: t("appealsSub", { count: metrics.appealsApproved }),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wide">{c.label}</span>
            <c.icon className={`size-[18px] ${c.iconColor}`} />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight tabular-nums">{c.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </div>
          <div className="w-full bg-muted h-1 rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full ${c.barColor}`} style={{ width: c.barWidth }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
