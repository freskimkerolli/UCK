import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FEED_FILTERS, type FeedFilter } from "@/lib/data/feed";
import { cn } from "@/lib/utils";

export async function FeedFilterTabs({ active }: { active: FeedFilter }) {
  const t = await getTranslations("home");

  const LABELS: Record<FeedFilter, string> = {
    ALL: t("filterAll"),
    HISTORICAL: t("filterHistorical"),
    MEDIA: t("filterMedia"),
    DOCUMENTS: t("filterDocuments"),
  };

  return (
    <nav aria-label={t("feedFilterAriaLabel")} className="flex flex-wrap items-center gap-1.5">
      {FEED_FILTERS.map((f) => (
        <Link
          key={f}
          href={f === "ALL" ? "/home" : `/home?filter=${f}`}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
            active === f
              ? "bg-primary text-primary-foreground shadow-warm-sm"
              : "bg-secondary/60 text-secondary-foreground hover:bg-secondary",
          )}
        >
          {LABELS[f]}
        </Link>
      ))}
    </nav>
  );
}
