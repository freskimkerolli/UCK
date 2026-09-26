import Link from "next/link";
import { redirect } from "next/navigation";
import { Users2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getCommunities } from "@/lib/data/communities";
import { CommunityCard } from "@/components/communities/community-card";
import { CreateCommunityDialog } from "@/components/communities/create-community-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { CommunityCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("communities");
  const tEnums = await getTranslations("enums");

  const FILTERS = [
    { value: "ALL", label: t("filterAll") },
    ...CommunityCategory.map((c) => ({ value: c, label: tEnums(`communityCategory.${c}`) })),
  ];

  const { category = "ALL" } = await searchParams;
  const communities = await getCommunities({ category });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users2 className="size-6 text-primary" /> {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <CreateCommunityDialog />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "ALL" ? "/communities" : `/communities?category=${f.value}`}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === f.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {communities.length === 0 ? (
        <EmptyState icon={Users2} title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => (
            <CommunityCard key={c.slug} community={c} />
          ))}
        </div>
      )}
    </div>
  );
}
