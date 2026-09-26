import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, Hash, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getArchiveMaterials, getTimelineEvents } from "@/lib/data/archive";
import { getCommunities } from "@/lib/data/communities";
import { getPostsByHashtag } from "@/lib/data/search";
import { MaterialCard } from "@/components/archive/material-card";
import { CommunityCard } from "@/components/communities/community-card";
import { PostCard } from "@/components/post/post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; tag?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("explore");

  const TABS = [
    { value: "HISTORIA", label: t("tabHistoria") },
    { value: "DESHMI", label: t("tabDeshmi") },
    { value: "DOKUMENTE", label: t("tabDokumente") },
    { value: "FOTOGRAFI", label: t("tabFotografi") },
    { value: "VIDEO", label: t("tabVideo") },
    { value: "KOMUNITETET", label: t("tabKomunitetet") },
    { value: "NGJARJET", label: t("tabNgjarjet") },
  ];

  const { tab = "HISTORIA", tag } = await searchParams;

  const taggedPosts = tag ? await getPostsByHashtag(tag, user.id) : [];

  let body: React.ReactNode = null;
  if (tab === "HISTORIA") {
    const materials = await getArchiveMaterials();
    body = <MaterialGrid materials={materials} />;
  } else if (tab === "DESHMI") {
    const materials = await getArchiveMaterials({ type: "TESTIMONY" });
    const interviews = await getArchiveMaterials({ type: "INTERVIEW" });
    body = <MaterialGrid materials={[...materials, ...interviews]} />;
  } else if (tab === "DOKUMENTE") {
    body = <MaterialGrid materials={await getArchiveMaterials({ type: "DOCUMENT" })} />;
  } else if (tab === "FOTOGRAFI") {
    body = <MaterialGrid materials={await getArchiveMaterials({ type: "PHOTO" })} />;
  } else if (tab === "VIDEO") {
    body = <MaterialGrid materials={await getArchiveMaterials({ type: "VIDEO" })} />;
  } else if (tab === "KOMUNITETET") {
    const communities = await getCommunities();
    body =
      communities.length === 0 ? (
        <EmptyState icon={Compass} title={t("noCommunitiesYet")} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((c) => (
            <CommunityCard key={c.slug} community={c} />
          ))}
        </div>
      );
  } else if (tab === "NGJARJET") {
    const events = await getTimelineEvents();
    body =
      events.length === 0 ? (
        <EmptyState icon={Clock} title={t("noEventsYet")} />
      ) : (
        <ol className="relative border-s ps-4 space-y-4 max-w-2xl">
          {events.map((e) => (
            <li key={e.id} className="ms-1">
              <span className="absolute -start-[5px] mt-1.5 size-2.5 rounded-full bg-primary" />
              <p className="text-xs text-muted-foreground">{e.eventDate}</p>
              <p className="font-medium text-sm">{e.title}</p>
              <p className="text-sm text-muted-foreground">{e.description}</p>
            </li>
          ))}
        </ol>
      );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Compass className="size-6 text-primary" /> {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {tag && (
        <div className="space-y-3 max-w-2xl">
          <h2 className="font-semibold flex items-center gap-1.5">
            <Hash className="size-4" /> {t("taggedPostsTitle", { tag })}
          </h2>
          {taggedPosts.length === 0 ? (
            <EmptyState icon={Hash} title={t("noTaggedPosts", { tag })} />
          ) : (
            taggedPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} currentUserRole={user.role} />)
          )}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/explore?tab=${t.value}`}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {body}
    </div>
  );
}

async function MaterialGrid({ materials }: { materials: Parameters<typeof MaterialCard>[0]["material"][] }) {
  const t = await getTranslations("explore");
  if (materials.length === 0) return <EmptyState icon={Compass} title={t("noMaterialsInCategory")} />;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((m) => (
        <MaterialCard key={m.id} material={m} />
      ))}
    </div>
  );
}
