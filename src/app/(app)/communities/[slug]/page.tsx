import { notFound, redirect } from "next/navigation";
import { Users2, FileText, ScrollText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getCommunityBySlug } from "@/lib/data/communities";
import { getCommunityPosts } from "@/lib/data/feed";
import { PostCard } from "@/components/post/post-card";
import { ComposerTriggerCard } from "@/components/post/composer-trigger-card";
import { JoinButton } from "@/components/communities/join-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type CommunityCategory } from "@/lib/types";
import { initials } from "@/lib/format";

export default async function CommunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = await getTranslations("communities");
  const tEnums = await getTranslations("enums");

  const result = await getCommunityBySlug(slug, user.id);
  if (!result) notFound();
  const { community, membership } = result;

  const posts = membership ? await getCommunityPosts(community.id, user.id) : [];

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="h-40 sm:h-52 bg-gradient-to-br from-primary/25 via-accent/20 to-muted relative">
        {community.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={community.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      <div className="px-4 sm:px-6">
        <div className="flex items-end justify-between -mt-10 mb-3">
          <Avatar className="size-20 border-4 border-background">
            <AvatarImage src={community.logoUrl} alt={community.name} />
            <AvatarFallback className="text-xl">{initials(community.name)}</AvatarFallback>
          </Avatar>
          <JoinButton communityId={community.id} initialJoined={!!membership} isOwner={membership?.role === "OWNER"} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">{community.name}</h1>
            <Badge variant="secondary">{tEnums(`communityCategory.${community.category as CommunityCategory}`)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{community.description}</p>
          <div className="flex gap-4 text-sm pt-1">
            <span className="flex items-center gap-1">
              <Users2 className="size-3.5 text-muted-foreground" /> <strong>{community._count.members}</strong>{" "}
              <span className="text-muted-foreground">{t("membersCount")}</span>
            </span>
            <span className="flex items-center gap-1">
              <FileText className="size-3.5 text-muted-foreground" /> <strong>{community._count.posts}</strong>{" "}
              <span className="text-muted-foreground">{t("postsCount")}</span>
            </span>
          </div>
        </div>

        {community.rules && (
          <div className="mt-4 rounded-xl border p-4 space-y-1.5">
            <p className="font-medium text-sm flex items-center gap-1.5">
              <ScrollText className="size-4" /> {t("rulesTitle")}
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{community.rules}</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {membership ? (
            <>
              <ComposerTriggerCard
                displayName={user.profile?.displayName ?? user.username}
                avatarUrl={user.profile?.avatarUrl ?? ""}
                communityId={community.id}
              />
              {posts.length === 0 ? (
                <EmptyState icon={FileText} title={t("noPostsYet")} />
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} currentUserRole={user.role} />)
              )}
            </>
          ) : (
            <EmptyState
              icon={Users2}
              title={t("joinToViewTitle")}
              description={t("joinToViewDesc")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
