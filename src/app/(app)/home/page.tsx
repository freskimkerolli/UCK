import { redirect } from "next/navigation";
import { Newspaper } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getFeedPosts, FEED_FILTERS, type FeedFilter } from "@/lib/data/feed";
import { getHomeStats, getLatestEvents } from "@/lib/data/home";
import { getRecommendedCommunities } from "@/lib/data/communities";
import { getMyCommunitiesForComposer } from "@/lib/data/shell";
import { PostCard } from "@/components/post/post-card";
import { InlineComposer } from "@/components/home/inline-composer";
import { EmptyState } from "@/components/shared/empty-state";
import { StatRibbon } from "@/components/home/stat-ribbon";
import { FeedFilterTabs } from "@/components/home/feed-filter-tabs";
import { RecentEventsWidget } from "@/components/home/sidebar/recent-events-widget";
import { RecommendedCommunitiesWidget } from "@/components/home/sidebar/recommended-communities-widget";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const t = await getTranslations("home");

  const { filter: rawFilter } = await searchParams;
  const filter: FeedFilter = FEED_FILTERS.includes(rawFilter as FeedFilter) ? (rawFilter as FeedFilter) : "ALL";

  const [posts, stats, events, recommendedCommunities, myCommunities] = await Promise.all([
    getFeedPosts(user.id, { filter }),
    getHomeStats(),
    getLatestEvents(3),
    getRecommendedCommunities(user.id, 3),
    getMyCommunitiesForComposer(user.id),
  ]);

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6 space-y-5">
      <StatRibbon stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <InlineComposer
            currentUser={{
              displayName: user.profile?.displayName ?? user.username,
              username: user.username,
              avatarUrl: user.profile?.avatarUrl ?? "",
              role: user.role,
            }}
            communities={myCommunities}
          />

          <FeedFilterTabs active={filter} />

          {posts.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title={t("emptyFeedTitle")}
              description={t("emptyFeedDescription")}
            />
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} currentUserRole={user.role} />
            ))
          )}
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-4">
          <RecentEventsWidget events={events} />
          <RecommendedCommunitiesWidget communities={recommendedCommunities} />
        </aside>
      </div>
    </div>
  );
}
