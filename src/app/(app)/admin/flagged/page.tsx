import { ShieldAlert, ListFilter } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getFlaggedContent, getModerationMetrics } from "@/lib/data/admin";
import { ModerationMetricsGrid } from "@/components/admin/moderation-metrics-grid";
import { HistoricalDistinctionBanner } from "@/components/admin/historical-distinction-banner";
import { NlpSandbox } from "@/components/admin/nlp-sandbox";
import { AntiEvasionCard } from "@/components/admin/anti-evasion-card";
import { FlaggedItemCard } from "@/components/admin/flagged-item-card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AdminFlaggedPage() {
  const [{ posts, comments }, metrics] = await Promise.all([getFlaggedContent(), getModerationMetrics()]);
  const totalFlagged = posts.length + comments.length;
  const t = await getTranslations("admin.flaggedPage");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-bold uppercase tracking-wide text-primary">{t("kicker")}</span>
          <span className="text-muted-foreground text-xs">•</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{t("subKicker")}</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      <ModerationMetricsGrid metrics={metrics} />

      <HistoricalDistinctionBanner />

      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("labKicker")}</span>
          <h2 className="text-xl font-semibold">{t("labTitle")}</h2>
        </div>
        <NlpSandbox />
        <AntiEvasionCard />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ListFilter className="size-[18px] text-muted-foreground" />
          <h2 className="text-xl font-semibold">{t("queueTitle", { count: totalFlagged })}</h2>
        </div>

        {totalFlagged === 0 ? (
          <EmptyState icon={ShieldAlert} title={t("emptyTitle")} description={t("emptyDescription")} />
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <FlaggedItemCard key={p.id} item={p} targetType="POST" />
            ))}
            {comments.map((c) => (
              <FlaggedItemCard key={c.id} item={c} targetType="COMMENT" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
