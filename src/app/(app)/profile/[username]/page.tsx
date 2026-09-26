import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, LinkIcon, MessageCircle, ShieldCheck } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/session";
import { getProfileByUsername } from "@/lib/data/profile";
import { getUserPosts, getSavedPosts } from "@/lib/data/feed";
import { PostCard } from "@/components/post/post-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FollowButton } from "@/components/profile/follow-button";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ProfileMoreMenu } from "@/components/profile/profile-more-menu";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials, formatDate } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";
import { FileText, Image as ImageIcon, Bookmark } from "lucide-react";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/login");
  const t = await getTranslations("profile");
  const locale = (await getLocale()) as AppLocale;

  const result = await getProfileByUsername(username, viewer.id);
  if (!result) notFound();
  const { user, isFollowing, isOwnProfile } = result;
  const profile = user.profile;
  const name = profile?.displayName ?? user.username;

  const [posts, mediaPosts, savedPosts] = await Promise.all([
    getUserPosts(user.id, viewer.id),
    getUserPosts(user.id, viewer.id, { mediaOnly: true }),
    isOwnProfile ? getSavedPosts(viewer.id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="h-44 sm:h-56 bg-gradient-to-br from-primary/25 via-accent/20 to-muted relative">
        {profile?.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      <div className="px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-y-2 -mt-12 sm:-mt-14 mb-3">
          <Avatar className="size-24 sm:size-28 border-4 border-background">
            <AvatarImage src={profile?.avatarUrl} alt={name} />
            <AvatarFallback className="text-2xl">{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap justify-end gap-2 pb-1">
            {isOwnProfile ? (
              <EditProfileDialog
                initial={{
                  displayName: profile?.displayName ?? "",
                  bio: profile?.bio ?? "",
                  location: profile?.location ?? "",
                  website: profile?.website ?? "",
                  avatarUrl: profile?.avatarUrl ?? "",
                  coverUrl: profile?.coverUrl ?? "",
                }}
              />
            ) : (
              <>
                <Button variant="outline" size="icon" render={<Link href={`/messages?with=${user.username}`} />} aria-label={t("sendMessageAria")}>
                  <MessageCircle className="size-4" />
                </Button>
                <FollowButton targetUserId={user.id} initialFollowing={isFollowing} />
                <ProfileMoreMenu username={user.username} />
              </>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{name}</h1>
            {user.role === "ADMIN" && <VerifiedBadge label={t("verifiedBadge")} />}
            {user.role === "MODERATOR" && (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="size-3" /> {t("roleModerator")}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">@{user.username}</p>
          {profile?.bio && <p className="text-sm leading-relaxed">{profile.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" /> {profile.location}
              </span>
            )}
            {profile?.website && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <LinkIcon className="size-3.5" /> {profile.website}
              </a>
            )}
            <span>{t("joinedOn", { date: formatDate(user.createdAt, "MMMM yyyy", locale) })}</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm">
            <span>
              <strong>{user._count.posts}</strong> <span className="text-muted-foreground">{t("postsCount")}</span>
            </span>
            <span>
              <strong>{user._count.followers}</strong> <span className="text-muted-foreground">{t("followersCount")}</span>
            </span>
            <span>
              <strong>{user._count.following}</strong> <span className="text-muted-foreground">{t("followingCount")}</span>
            </span>
          </div>
        </div>

        <Tabs defaultValue="posts" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">
              {t("tabPosts")}
            </TabsTrigger>
            <TabsTrigger value="media" className="flex-1">
              {t("tabMedia")}
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="saved" className="flex-1">
                {t("tabSaved")}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="posts" className="space-y-4 pt-4">
            {posts.length === 0 ? (
              <EmptyState icon={FileText} title={t("noPostsYet")} />
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} currentUserId={viewer.id} currentUserRole={viewer.role} />)
            )}
          </TabsContent>

          <TabsContent value="media" className="space-y-4 pt-4">
            {mediaPosts.length === 0 ? (
              <EmptyState icon={ImageIcon} title={t("noMediaYet")} />
            ) : (
              mediaPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={viewer.id} currentUserRole={viewer.role} />)
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="saved" className="space-y-4 pt-4">
              {savedPosts.length === 0 ? (
                <EmptyState icon={Bookmark} title={t("noSavedYet")} />
              ) : (
                savedPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={viewer.id} currentUserRole={viewer.role} />)
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
