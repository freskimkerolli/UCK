"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Flame, MessageCircle, Share2, Bookmark } from "lucide-react";
import { togglePostLikeAction, toggleSavePostAction } from "@/lib/actions/posts";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/format";
import type { AppLocale } from "@/i18n/locales";

export function PostActions({
  postId,
  initialLiked,
  initialSaved,
  likeCount,
  commentCount,
  onToggleComments,
}: {
  postId: string;
  initialLiked: boolean;
  initialSaved: boolean;
  likeCount: number;
  commentCount: number;
  onToggleComments: () => void;
}) {
  const t = useTranslations("post");
  const tActions = useTranslations("actions");
  const locale = useLocale() as AppLocale;
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(likeCount);
  const [, startTransition] = useTransition();

  function handleLike() {
    setLiked((l) => !l);
    setCount((c) => (liked ? c - 1 : c + 1));
    startTransition(async () => {
      await togglePostLikeAction(postId);
    });
  }

  function handleSave() {
    setSaved((s) => !s);
    startTransition(async () => {
      const res = await toggleSavePostAction(postId);
      if (res.success) {
        toast.success(res.data.saved ? t("savedToast") : t("unsavedToast"));
      }
    });
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("linkCopiedToast"));
    } catch {
      toast.error(t("linkCopyErrorToast"));
    }
  }

  return (
    <div className="flex items-center gap-1 -ml-2.5 pt-0.5">
      <ActionPill
        active={liked}
        activeClassName="text-primary"
        hoverClassName="hover:text-primary hover:bg-primary/10"
        onClick={handleLike}
        icon={<Flame className={cn("size-[18px] transition-transform", liked && "fill-primary scale-110")} />}
        label={count > 0 ? formatCount(count, locale) : t("likeLabel")}
      />
      <ActionPill
        hoverClassName="hover:text-chart-3 hover:bg-chart-3/10"
        onClick={onToggleComments}
        icon={<MessageCircle className="size-[18px]" />}
        label={commentCount > 0 ? formatCount(commentCount, locale) : tActions("comment")}
      />
      <ActionPill
        hoverClassName="hover:text-emerald-600 hover:bg-emerald-500/10 dark:hover:text-emerald-400"
        onClick={handleShare}
        icon={<Share2 className="size-[18px]" />}
        label={tActions("share")}
        hideLabelOnMobile
      />
      <ActionPill
        active={saved}
        activeClassName="text-accent-foreground"
        hoverClassName="hover:text-accent-foreground hover:bg-accent/20"
        onClick={handleSave}
        icon={<Bookmark className={cn("size-[18px] transition-transform", saved && "fill-current scale-110")} />}
        label={tActions("save")}
        hideLabelOnMobile
        className="ml-auto"
      />
    </div>
  );
}

function ActionPill({
  icon,
  label,
  active,
  activeClassName,
  hoverClassName,
  onClick,
  className,
  hideLabelOnMobile,
}: {
  icon: React.ReactNode;
  label?: string;
  active?: boolean;
  activeClassName?: string;
  hoverClassName: string;
  onClick: () => void;
  className?: string;
  hideLabelOnMobile?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150",
        hoverClassName,
        active && activeClassName,
        className,
      )}
    >
      {icon}
      {label && (
        <span className={cn("tabular-nums", hideLabelOnMobile && "sr-only sm:not-sr-only")}>{label}</span>
      )}
    </button>
  );
}
