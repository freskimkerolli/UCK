import Link from "next/link";
import { Users2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JoinButton } from "@/components/communities/join-button";
import { initials } from "@/lib/format";
import type { getRecommendedCommunities } from "@/lib/data/communities";

export async function RecommendedCommunitiesWidget({
  communities,
}: {
  communities: Awaited<ReturnType<typeof getRecommendedCommunities>>;
}) {
  if (communities.length === 0) return null;
  const t = await getTranslations("home");

  return (
    <Card className="p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="size-[18px] text-primary" />
          <h2 className="font-semibold text-sm">{t("recommendedCommunitiesTitle")}</h2>
        </div>
        <Link href="/communities" className="text-xs text-primary hover:underline shrink-0">
          {t("viewAllLink")}
        </Link>
      </div>
      <div className="space-y-1">
        {communities.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
            <Link href={`/communities/${c.slug}`} className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-9 shrink-0">
                <AvatarImage src={c.logoUrl} alt={c.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials(c.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{t("membersCount", { count: c._count.members })}</p>
              </div>
            </Link>
            <JoinButton communityId={c.id} initialJoined={false} isOwner={false} />
          </div>
        ))}
      </div>
    </Card>
  );
}
