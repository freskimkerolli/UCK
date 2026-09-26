import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getPostById } from "@/lib/data/feed";
import { PostCard } from "@/components/post/post-card";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const post = await getPostById(id, user.id);
  if (!post || post.isDeleted) notFound();
  if (post.moderationStatus === "BLOCKED" && post.author.id !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PostCard post={post} currentUserId={user.id} currentUserRole={user.role} />
    </div>
  );
}
