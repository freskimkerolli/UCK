"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Video,
  FileText,
  Landmark,
  MapPin,
  Hash,
  Loader2,
  X,
} from "lucide-react";
import { useComposer, type ComposerPanel } from "@/components/composer/composer-context";
import { MediaUploadField } from "@/components/composer/media-upload-field";
import { createPostAction } from "@/lib/actions/posts";
import { searchHistoricalMaterialsForPicker } from "@/lib/actions/composer-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initials } from "@/lib/format";

type Panel = ComposerPanel;

interface CurrentUserLite {
  displayName: string;
  username: string;
  avatarUrl: string;
}

interface CommunityOption {
  id: string;
  name: string;
}

export function PostComposerDialog({
  currentUser,
  communities,
}: {
  currentUser: CurrentUserLite;
  communities: CommunityOption[];
}) {
  const { isOpen, close, defaultCommunityId, defaultPanel } = useComposer();
  const router = useRouter();
  const t = useTranslations("composer");
  const tActions = useTranslations("actions");
  const [content, setContent] = useState("");
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [hashtagDraft, setHashtagDraft] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [communityId, setCommunityId] = useState<string>(defaultCommunityId ?? "none");
  const [materialOptions, setMaterialOptions] = useState<{ id: string; title: string }[]>([]);
  const [materialId, setMaterialId] = useState<string>("none");
  const [isPending, startTransition] = useTransition();

  function reset() {
    setContent("");
    setActivePanel(null);
    setMediaUrl("");
    setIsMediaUploading(false);
    setDocumentName("");
    setLocationLabel("");
    setHashtagDraft("");
    setHashtags([]);
    setCommunityId("none");
    setMaterialId("none");
  }

  function loadMaterialOptionsIfNeeded() {
    if (materialOptions.length === 0) {
      searchHistoricalMaterialsForPicker().then((res) =>
        setMaterialOptions(res.map((r) => ({ id: r.id, title: r.title }))),
      );
    }
  }

  function togglePanel(panel: Exclude<Panel, null>) {
    setActivePanel((p) => (p === panel ? null : panel));
    if (panel === "HISTORICAL") loadMaterialOptionsIfNeeded();
  }

  // Lets callers (e.g. the richer composer-trigger card on Home) open the
  // dialog with a specific attachment panel already active instead of always
  // landing on the blank default state.
  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing composer defaults from context at open-time, not a derived-render loop
    setCommunityId(defaultCommunityId ?? "none");
    if (defaultPanel) {
      setActivePanel(defaultPanel);
      if (defaultPanel === "HISTORICAL") loadMaterialOptionsIfNeeded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function addHashtag() {
    const clean = hashtagDraft.trim().replace(/^#/, "");
    if (clean && !hashtags.includes(clean)) setHashtags((h) => [...h, clean]);
    setHashtagDraft("");
  }

  function handleSubmit() {
    if (!content.trim()) {
      toast.error(t("contentRequiredError"));
      return;
    }
    startTransition(async () => {
      const mediaType = activePanel === "PHOTO" ? "PHOTO" : activePanel === "VIDEO" ? "VIDEO" : activePanel === "DOCUMENT" ? "DOCUMENT" : null;
      const res = await createPostAction({
        content,
        mediaType,
        mediaUrls: mediaUrl ? [mediaUrl] : [],
        documentName: documentName || undefined,
        locationLabel: locationLabel || undefined,
        communityId: communityId === "none" ? undefined : communityId,
        historicalMaterialId: materialId === "none" ? undefined : materialId,
        hashtags,
      });

      if (!res.success) {
        toast.error(res.error);
        return;
      }

      if (res.data.moderation === "BLOCK") {
        toast.error(res.data.userMessage ?? t("postBlockedFallback"));
      } else if (res.data.moderation === "WARNING") {
        toast.warning(res.data.userMessage ?? t("postPendingReviewFallback"));
      } else {
        toast.success(t("postPublishedSuccess"));
      }

      reset();
      close();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createPostTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.displayName} />
            <AvatarFallback>{initials(currentUser.displayName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-medium text-sm">{currentUser.displayName}</span>
              {communities.length > 0 && (
                <Select value={communityId} onValueChange={(v) => setCommunityId(v ?? "none")}>
                  <SelectTrigger size="sm" className="w-[160px]">
                    <SelectValue placeholder={t("publicPost")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("publicPost")}</SelectItem>
                    {communities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Textarea
              autoFocus
              rows={4}
              placeholder={t("contentPlaceholder")}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none"
            />

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((h) => (
                  <Badge key={h} variant="secondary" className="gap-1 bg-accent/15 text-accent-foreground">
                    #{h}
                    <button type="button" onClick={() => setHashtags((hs) => hs.filter((x) => x !== h))}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {activePanel === "PHOTO" && (
              <MediaUploadField
                kind="PHOTO"
                label={t("uploadPhotoLabel")}
                url={mediaUrl}
                onUploaded={({ url }) => setMediaUrl(url)}
                onRemove={() => setMediaUrl("")}
                onUploadingChange={setIsMediaUploading}
              />
            )}
            {activePanel === "VIDEO" && (
              <MediaUploadField
                kind="VIDEO"
                label={t("uploadVideoLabel")}
                url={mediaUrl}
                onUploaded={({ url }) => setMediaUrl(url)}
                onRemove={() => setMediaUrl("")}
                onUploadingChange={setIsMediaUploading}
              />
            )}
            {activePanel === "DOCUMENT" && (
              <div className="space-y-2">
                <Input
                  placeholder={t("documentNamePlaceholder")}
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                />
                <MediaUploadField
                  kind="DOCUMENT"
                  label={t("uploadDocumentLabel")}
                  url={mediaUrl}
                  fileName={documentName}
                  onUploaded={({ url, name }) => {
                    setMediaUrl(url);
                    if (!documentName) setDocumentName(name);
                  }}
                  onRemove={() => setMediaUrl("")}
                  onUploadingChange={setIsMediaUploading}
                />
              </div>
            )}
            {activePanel === "HISTORICAL" && (
              <Select value={materialId} onValueChange={(v) => setMaterialId(v ?? "none")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectHistoricalMaterialPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("none")}</SelectItem>
                  {materialOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {activePanel === "LOCATION" && (
              <Input
                placeholder={t("locationPlaceholderDialog")}
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
              />
            )}
            {activePanel === "HASHTAG" && (
              <div className="flex gap-2">
                <Input
                  placeholder={t("hashtagPlaceholder")}
                  value={hashtagDraft}
                  onChange={(e) => setHashtagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addHashtag}>
                  {t("addButton")}
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 border-t flex-wrap">
              <div className="flex items-center gap-0.5 flex-wrap">
                <ToolbarButton icon={ImageIcon} active={activePanel === "PHOTO"} label={t("photoShort")} onClick={() => togglePanel("PHOTO")} />
                <ToolbarButton icon={Video} active={activePanel === "VIDEO"} label={t("video")} onClick={() => togglePanel("VIDEO")} />
                <ToolbarButton icon={FileText} active={activePanel === "DOCUMENT"} label={t("document")} onClick={() => togglePanel("DOCUMENT")} />
                <ToolbarButton icon={Landmark} active={activePanel === "HISTORICAL"} label={t("historicalMaterial")} onClick={() => togglePanel("HISTORICAL")} />
                <ToolbarButton icon={MapPin} active={activePanel === "LOCATION"} label={t("location")} onClick={() => togglePanel("LOCATION")} />
                <ToolbarButton icon={Hash} active={activePanel === "HASHTAG"} label={t("hashtag")} onClick={() => togglePanel("HASHTAG")} />
              </div>
              <Button onClick={handleSubmit} disabled={isPending || isMediaUploading || !content.trim()}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {tActions("submit")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ToolbarButton({
  icon: Icon,
  active,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <Icon className="size-4" />
    </Button>
  );
}
