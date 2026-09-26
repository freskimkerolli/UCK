"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Heart, Loader2, Trash2, CornerDownRight, Flag, Send } from "lucide-react";
import {
  getCommentsForPost,
  createCommentAction,
  deleteCommentAction,
  toggleCommentLikeAction,
} from "@/lib/actions/comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportDialog } from "@/components/shared/report-dialog";
import { initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/locales";

interface CommentAuthor {
  id: string;
  username: string;
  profile: { displayName: string; avatarUrl: string } | null;
}
interface CommentItem {
  id: string;
  content: string;
  createdAt: string | Date;
  authorId: string;
  author: CommentAuthor;
  isDeleted: boolean;
  moderationStatus: string;
  likes: { id: string }[];
  _count: { likes: number; replies: number };
  replies: CommentItem[];
}

export function CommentSection({
  postId,
  currentUserId,
  currentUserRole,
}: {
  postId: string;
  currentUserId: string;
  currentUserRole: string;
}) {
  const t = useTranslations("post");
  const tActions = useTranslations("actions");
  const locale = useLocale() as AppLocale;
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    getCommentsForPost(postId).then((data) => setComments(data as unknown as CommentItem[]));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  function submit() {
    if (!draft.trim()) return;
    startTransition(async () => {
      const res = await createCommentAction({ postId, content: draft, parentId: replyTo?.id });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      if (res.data.moderation === "BLOCK") {
        toast.error(res.data.userMessage ?? t("commentBlockedFallback"));
      } else if (res.data.moderation === "WARNING") {
        toast.warning(res.data.userMessage ?? t("commentPendingReviewFallback"));
      }
      setDraft("");
      setReplyTo(null);
      load();
    });
  }

  async function handleLike(id: string) {
    setComments((prev) =>
      prev
        ? prev.map((c) => updateCommentTree(c, id))
        : prev,
    );
    await toggleCommentLikeAction(id);
  }

  async function handleDelete(id: string) {
    await deleteCommentAction(id);
    load();
  }

  if (!comments) {
    return (
      <div className="space-y-3 pt-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-4/5" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-3.5 border-t">
      <div className="flex gap-2 items-center">
        <Input
          placeholder={replyTo ? t("replyPlaceholder", { name: replyTo.name }) : t("commentPlaceholder")}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="h-9 rounded-full bg-muted/60 border-transparent focus-visible:bg-background"
        />
        <Button
          onClick={submit}
          disabled={isPending || !draft.trim()}
          size="icon"
          className="rounded-full shrink-0"
          aria-label={tActions("submit")}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
        {replyTo && (
          <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="shrink-0">
            {tActions("cancel")}
          </Button>
        )}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("noCommentsYet")}</p>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <CommentItemView
            key={c.id}
            comment={c}
            depth={0}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            locale={locale}
            t={t}
            tActions={tActions}
            onReply={(id, name) => setReplyTo({ id, name })}
            onLike={handleLike}
            onDelete={handleDelete}
            onReport={setReportTargetId}
          />
        ))}
      </div>

      <ReportDialog
        open={!!reportTargetId}
        onOpenChange={(open) => !open && setReportTargetId(null)}
        commentId={reportTargetId ?? undefined}
      />
    </div>
  );
}

function updateCommentTree(c: CommentItem, targetId: string): CommentItem {
  if (c.id === targetId) {
    const liked = c.likes.length > 0;
    return {
      ...c,
      likes: liked ? [] : [{ id: "optimistic" }],
      _count: { ...c._count, likes: c._count.likes + (liked ? -1 : 1) },
    };
  }
  return { ...c, replies: c.replies.map((r) => updateCommentTree(r, targetId)) };
}

function CommentItemView({
  comment,
  depth,
  currentUserId,
  currentUserRole,
  locale,
  t,
  tActions,
  onReply,
  onLike,
  onDelete,
  onReport,
}: {
  comment: CommentItem;
  depth: number;
  currentUserId: string;
  currentUserRole: string;
  locale: AppLocale;
  t: ReturnType<typeof useTranslations>;
  tActions: ReturnType<typeof useTranslations>;
  onReply: (id: string, name: string) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
}) {
  const name = comment.author.profile?.displayName ?? comment.author.username;
  const isOwn = comment.authorId === currentUserId;
  const canModerate = isOwn || currentUserRole === "ADMIN" || currentUserRole === "MODERATOR";
  const liked = comment.likes.length > 0;
  const isPendingReview = comment.moderationStatus === "PENDING_REVIEW";

  return (
    <div className={cn("flex gap-2.5", depth === 1 && "ml-9", depth > 1 && "ml-6")}>
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={comment.author.profile?.avatarUrl} alt={name} />
        <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-semibold">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2 inline-block max-w-full">
          <Link href={`/profile/${comment.author.username}`} className="text-sm font-semibold hover:underline">
            {name}
          </Link>
          <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        {isPendingReview && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">{t("pendingReviewByModerators")}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground pl-1">
          <span>{timeAgo(comment.createdAt, locale)}</span>
          <button
            className={cn("font-medium hover:underline flex items-center gap-1", liked && "text-primary")}
            onClick={() => onLike(comment.id)}
          >
            <Heart className={cn("size-3", liked && "fill-primary")} />
            {comment._count.likes > 0 ? comment._count.likes : t("likeCommentLabel")}
          </button>
          {depth === 0 && (
            <button className="font-medium hover:underline flex items-center gap-1" onClick={() => onReply(comment.id, name)}>
              <CornerDownRight className="size-3" /> {t("replyAction")}
            </button>
          )}
          {!isOwn && (
            <button className="font-medium hover:underline flex items-center gap-1" onClick={() => onReport(comment.id)}>
              <Flag className="size-3" /> {tActions("report")}
            </button>
          )}
          {canModerate && (
            <button
              className="font-medium hover:underline flex items-center gap-1 text-destructive"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="size-3" /> {tActions("delete")}
            </button>
          )}
        </div>

        {comment.replies?.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((r) => (
              <CommentItemView
                key={r.id}
                comment={r}
                depth={depth + 1}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                locale={locale}
                t={t}
                tActions={tActions}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
