import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getSavedPosts } from "@/lib/data/feed";
import { PostCard } from "@/components/post/post-card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const posts = await getSavedPosts(user.id);
  const t = await getTranslations("saved");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      {posts.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.id} currentUserRole={user.role} />)
      )}
    </div>
  );
}
