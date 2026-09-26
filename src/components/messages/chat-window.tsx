"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Image as ImageIcon, Send, Smile } from "lucide-react";
import {
  getConversationDetail,
  sendMessageAction,
  setTypingAction,
  markConversationReadAction,
} from "@/lib/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { initials, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/locales";

const EMOJIS = ["❤️", "😂", "😢", "👍", "🙏", "🇽🇰", "🕊️", "🔥", "😮", "👏"];

type ConversationDetail = NonNullable<Awaited<ReturnType<typeof getConversationDetail>>>;

export function ChatWindow({ conversationId, initial, currentUserId }: { conversationId: string; initial: ConversationDetail; currentUserId: string }) {
  const t = useTranslations("chat");
  const locale = useLocale() as AppLocale;
  const [data, setData] = useState(initial);
  const [draft, setDraft] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    markConversationReadAction(conversationId);
    const interval = setInterval(() => {
      getConversationDetail(conversationId).then((res) => {
        if (res) setData(res);
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [data.conversation.messages.length]);

  function handleTyping(value: string) {
    setDraft(value);
    setTypingAction(conversationId, true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTypingAction(conversationId, false), 2000);
  }

  async function handleSend() {
    if (!draft.trim() && !imageUrl.trim()) return;
    const content = draft;
    const img = imageUrl || undefined;
    setDraft("");
    setImageUrl("");
    setShowImageInput(false);
    await sendMessageAction({ conversationId, content, imageUrl: img });
    const res = await getConversationDetail(conversationId);
    if (res) setData(res);
  }

  const other = data.other;
  const name = other?.profile?.displayName ?? other?.username ?? t("defaultUser");

  return (
    <div className="flex flex-col h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-6rem)]">
      <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
        <Link href="/messages" className="md:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="relative">
          <Avatar className="size-9">
            <AvatarImage src={other?.profile?.avatarUrl} alt={name} />
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          {other?.online && <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-background" />}
        </div>
        <div className="min-w-0">
          <Link href={`/profile/${other?.username}`} className="text-sm font-medium hover:underline">
            {name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {other?.isTyping ? t("typingStatus") : other?.online ? t("onlineStatus") : t("offlineStatus")}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {data.conversation.messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2", isMe ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {m.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.imageUrl} alt="" className="rounded-lg mb-1 max-h-60 object-cover" />
                )}
                {m.content && <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>}
                <p className={cn("text-[10px] mt-0.5", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {timeAgo(m.createdAt, locale)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {showImageInput && (
        <div className="px-4 pb-2 flex gap-2">
          <Input placeholder={t("imageUrlPlaceholder")} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
      )}

      <div className="border-t p-3 flex items-center gap-2 shrink-0">
        <Popover>
          <PopoverTrigger render={<Button variant="ghost" size="icon" aria-label={t("emojiAriaLabel")} />}>
            <Smile className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-1 flex-wrap max-w-48">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="text-lg hover:scale-110 transition-transform"
                  onClick={() => setDraft((d) => d + e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" aria-label={t("photoAriaLabel")} onClick={() => setShowImageInput((s) => !s)}>
          <ImageIcon className="size-4" />
        </Button>
        <Input
          placeholder={t("messagePlaceholder")}
          value={draft}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button size="icon" onClick={handleSend} aria-label={t("sendAriaLabel")}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
