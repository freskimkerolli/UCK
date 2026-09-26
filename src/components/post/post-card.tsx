"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Trash2, Flag, ShieldAlert, Users2 } from "lucide-react";
import { deletePostAction } from "@/lib/actions/posts";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HashtagText } from "@/components/post/hashtag-text";
import { PostMedia } from "@/components/post/post-media";
import { PostActions } from "@/components/post/post-actions";
import { CommentSection } from "@/components/post/comment-section";
import { EditPostDialog } from "@/components/post/edit-post-dialog";
import { ReportDialog } from "@/components/shared/report-dialog";
import { initials, timeAgo } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    mediaType: string | null;
    mediaUrls: string;
    documentName: string | null;
    locationLabel: string | null;
    isEdited: boolean;
    createdAt: string | Date;
    moderationStatus: string;
    author: {
      id: string;
      username: string;
      role: string;
      profile: { displayName: string; avatarUrl: string } | null;
    };
    community: { id: string; name: string; slug: string } | null;
    historicalMaterial: { id: string; title: string; type: string; verificationStatus: string } | null;
    hashtags: { hashtag: { tag: string } }[];
    _count: { likes: number; comments: number };
    likes: { id: string }[];
    saves: { id: string }[];
  };
  currentUserId: string;
  currentUserRole: string;
}

export function PostCard({ post, currentUserId, currentUserRole }: PostCardProps) {
  const t = useTranslations("post");
  const tActions = useTranslations("actions");
  const locale = useLocale() as AppLocale;
  const [showComments, setShowComments] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const author = post.author;
  const name = author.profile?.displayName ?? author.username;
  const isOwner = author.id === currentUserId;
  const isModerator = currentUserRole === "ADMIN" || currentUserRole === "MODERATOR";

  async function handleDelete() {
    const res = await deletePostAction(post.id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(t("postDeletedSuccess"));
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <Card className="p-4 sm:p-5 animate-in-rise gap-3.5">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${author.username}`} className="shrink-0">
          <Avatar className="size-11 ring-2 ring-transparent transition-all hover:ring-primary/20">
            <AvatarImage src={author.profile?.avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials(name)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <Link href={`/profile/${author.username}`} className="font-semibold leading-tight hover:underline">
              {name}
            </Link>
            <span className="text-sm text-muted-foreground">@{author.username}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
            <span>{timeAgo(post.createdAt, locale)}</span>
            {post.isEdited && <span>· {t("edited")}</span>}
            {post.community && (
              <Link
                href={`/communities/${post.community.slug}`}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground hover:bg-secondary/70 transition-colors"
              >
                <Users2 className="size-3" /> {post.community.name}
              </Link>
            )}
          </div>
        </div>

        {post.moderationStatus === "PENDING_REVIEW" && (
          <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300 dark:text-amber-400 shrink-0">
            <ShieldAlert className="size-3" /> {t("pendingReviewBadge")}
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={t("moreOptionsAriaLabel")} className="shrink-0 -mr-1.5" />}>
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && (
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" /> {tActions("edit")}
              </DropdownMenuItem>
            )}
            {(isOwner || isModerator) && (
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" /> {tActions("delete")}
              </DropdownMenuItem>
            )}
            {!isOwner && (
              <DropdownMenuItem onClick={() => setReportOpen(true)}>
                <Flag className="size-4" /> {tActions("report")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <HashtagText content={post.content} />

      <PostMedia
        mediaType={post.mediaType}
        mediaUrls={post.mediaUrls}
        documentName={post.documentName}
        locationLabel={post.locationLabel}
        historicalMaterial={post.historicalMaterial}
      />

      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.map(({ hashtag }) => (
            <Link
              key={hashtag.tag}
              href={`/explore?tag=${hashtag.tag}`}
              className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-foreground hover:bg-accent/25 transition-colors"
            >
              #{hashtag.tag}
            </Link>
          ))}
        </div>
      )}

      <PostActions
        postId={post.id}
        initialLiked={post.likes.length > 0}
        initialSaved={post.saves.length > 0}
        likeCount={post._count.likes}
        commentCount={post._count.comments}
        onToggleComments={() => setShowComments((s) => !s)}
      />

      {showComments && (
        <CommentSection postId={post.id} currentUserId={currentUserId} currentUserRole={currentUserRole} />
      )}

      <EditPostDialog open={editOpen} onOpenChange={setEditOpen} postId={post.id} initialContent={post.content} />
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} postId={post.id} />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tActions("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{tActions("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
