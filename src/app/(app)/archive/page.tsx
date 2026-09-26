import Link from "next/link";
import { Landmark, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getArchiveMaterials, getTimelineEvents } from "@/lib/data/archive";
import { MaterialCard } from "@/components/archive/material-card";
import { ContributeMaterialDialog } from "@/components/archive/contribute-material-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { HistoricalMaterialType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("archive");
  const tEnums = await getTranslations("enums");
  const locale = (await getLocale()) as AppLocale;

  const FILTERS = [
    { value: "ALL", label: t("filterAll") },
    ...HistoricalMaterialType.map((mt) => ({ value: mt, label: tEnums(`historicalMaterialType.${mt}`) })),
  ];

  const { type = "ALL", q } = await searchParams;
  const [materials, events] = await Promise.all([
    getArchiveMaterials({ type, query: q }),
    type === "EVENT_RECORD" || type === "ALL" ? getTimelineEvents() : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Landmark className="size-6 text-primary" /> {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ContributeMaterialDialog />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "ALL" ? "/archive" : `/archive?type=${f.value}`}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              type === f.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {(type === "ALL" || type === "EVENT_RECORD") && events.length > 0 && (
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="size-4" /> {t("timelineTitle")}
          </h2>
          <ol className="relative border-s ps-4 space-y-4">
            {events.map((e) => (
              <li key={e.id} className="ms-1">
                <span className="absolute -start-[5px] mt-1.5 size-2.5 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">{e.eventDate}</p>
                <p className="font-medium text-sm">{e.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{e.description}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {materials.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <MaterialCard key={m.id} material={m} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center pt-4">
        {t("syncFooter", { date: formatDate(new Date(), "d MMM yyyy", locale) })}
      </p>
    </div>
  );
}
